// 限制 libuv 线程池大小为 1，减少 CPU 占用
process.env.UV_THREADPOOL_SIZE = '1';

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const si = require('systeminformation');
const mysql = require('mysql2/promise');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const MAIN_SERVER_URL = 'http://127.0.0.1:3001';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://127.0.0.1', 'http://localhost', 'http://127.0.0.1:80', 'http://127.0.0.1:8080'],
        credentials: true,
        methods: ['GET', 'POST']
    },
    pingInterval: 5000,
    pingTimeout: 3000,
    connectTimeout: 5000
});

app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'same-origin' }
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'monitor-public')));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3002;
const LOGS_DIR = path.join(__dirname, 'logs');
const BACKUP_DIR = path.join(__dirname, 'database');
const MAX_LOGS = 500;
const RESOURCE_INTERVAL = 3000;
const LOG_POLL_INTERVAL = 2000;

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 格式化时间 YYYY-MM-DD HH:mm:ss
function formatTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取本机IP地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}
const LOCAL_IP = getLocalIP();

// 从主服务器读取数据库配置（与 server.js 共用同一个数据库配置）
const { DB_CONFIG } = require('./database-mysql');
const mainDbConfig = {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    connected: false
};

function discoverLogFiles() {
    const files = [];
    try {
        if (fs.existsSync(LOGS_DIR)) {
            const entries = fs.readdirSync(LOGS_DIR);
            entries.forEach(f => {
                const fullPath = path.join(LOGS_DIR, f);
                const stat = fs.statSync(fullPath);
                if (!stat.isFile() || !f.endsWith('.log')) return;
                if (f.startsWith('pm2-out')) {
                    files.push({ name: f, path: fullPath, source: 'main' });
                } else if (f.startsWith('pm2-error')) {
                    files.push({ name: f, path: fullPath, source: 'error' });
                } else if (f.startsWith('monitor-out')) {
                    files.push({ name: f, path: fullPath, source: 'monitor' });
                } else if (f.startsWith('monitor-error')) {
                    files.push({ name: f, path: fullPath, source: 'monitor-error' });
                } else {
                    files.push({ name: f, path: fullPath, source: 'log' });
                }
            });
        }
    } catch (e) {}
    return files;
}

let LOG_FILES = discoverLogFiles();

let serverLogs = [];
let filePositions = new Map();
let onlineUsers = 0;
let dbConnected = false;
let dbPool = null;
let abnormalAccountsCount = 0;
let attackDetected = false;
let lastSystemInfo = null;
let workerPoolStats = null;

// ===== monitor 在线设备跟踪 =====
const onlineMonitorSessions = new Map(); // socketId → { ip, connectedAt, userAgent }
const kickedIPs = new Set();

// ===== Monitor 登录锁定：密码错误3次 或 申请被拒3次（每日24点自动清除） =====
const monitorLockedIPs = new Map();
const MONITOR_MAX_FAILURES = 3;
const MONITOR_MAX_REJECTS = 3;

function getTodayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isIPLocked(ip) {
    const record = monitorLockedIPs.get(ip);
    if (!record) return false;
    const today = getTodayDateKey();
    if (record.lastResetDate !== today) {
        monitorLockedIPs.delete(ip);
        return false;
    }
    return record.locked === true;
}

function recordMonitorFailure(ip, type) {
    const today = getTodayDateKey();
    let record = monitorLockedIPs.get(ip);
    if (!record || record.lastResetDate !== today) {
        record = { failures: 0, rejects: 0, locked: false, lastResetDate: today };
    }
    if (type === 'login') {
        record.failures++;
        if (record.failures >= MONITOR_MAX_FAILURES) {
            record.locked = true;
            const warnMsg = `[警告] IP ${ip} 连续密码错误 ${record.failures} 次，已被锁定禁止登录 monitor`;
            addLog(warnMsg, 'warning');
            console.error(warnMsg);
            monitorLockedIPs.set(ip, record);
            return true;
        }
    } else if (type === 'reject') {
        record.rejects++;
        if (record.rejects >= MONITOR_MAX_REJECTS) {
            record.locked = true;
            const warnMsg = `[警告] IP ${ip} 申请连续被拒绝 ${record.rejects} 次，已被锁定禁止登录 monitor`;
            addLog(warnMsg, 'warning');
            console.error(warnMsg);
            monitorLockedIPs.set(ip, record);
            return true;
        }
    }
    monitorLockedIPs.set(ip, record);
    return false;
}

function clearMidnightLockedIPs() {
    const today = getTodayDateKey();
    let clearedCount = 0;
    for (const [ip, record] of monitorLockedIPs.entries()) {
        if (record.lastResetDate !== today) {
            monitorLockedIPs.delete(ip);
            clearedCount++;
        }
    }
    if (clearedCount > 0) {
        const infoMsg = `[系统] 每日重置：已清除 ${clearedCount} 个锁定IP`;
        addLog(infoMsg, 'info');
    }
}

// 每60秒检查一次是否需要跨日重置
setInterval(clearMidnightLockedIPs, 60000);

let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

let psCachedCpu = 0;
let psCachedMemPercent = 0;
let psCachedMemTotal = 0;
let psCachedMemUsed = 0;
let psCachedMemFree = 0;
let psProcess = null;
let cachedDisk = null;
let cachedNetwork = null;
let cachedOsInfo = null;
let lastDiskFetch = 0;
const SLOW_FETCH_INTERVAL = 30000;

// ===== 设备访问控制系统 =====
const DEVICES_FILE = path.join(__dirname, 'certified-devices.json');
const PENDING_FILE = path.join(__dirname, 'pending-requests.json');
let certifiedDevices = new Map(); // ip → { name, addedAt, approvedBy }
let pendingRequests = new Map();  // sessionId → { ip, userAgent, requestedAt, status }

function loadDevicesFile() {
    try {
        if (fs.existsSync(DEVICES_FILE)) {
            const data = JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf8'));
            certifiedDevices = new Map(Object.entries(data));
        }
    } catch (e) {}
}
function saveDevicesFile() {
    try {
        fs.writeFileSync(DEVICES_FILE, JSON.stringify(Object.fromEntries(certifiedDevices)), 'utf8');
    } catch (e) {}
}
function loadPendingFile() {
    try {
        if (fs.existsSync(PENDING_FILE)) {
            const data = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
            pendingRequests = new Map(Object.entries(data));
        }
    } catch (e) {}
}
function savePendingFile() {
    try {
        fs.writeFileSync(PENDING_FILE, JSON.stringify(Object.fromEntries(pendingRequests)), 'utf8');
    } catch (e) {}
}
loadDevicesFile();
loadPendingFile();

function getClientIP(req) {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        req.headers['x-forwarded-for'] || 'unknown';
}

function normalizeIP(ip) {
    if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
    if (ip.startsWith('::ffff:')) return ip.substring(7);
    return ip;
}

function isLocalIP(ip) {
    ip = normalizeIP(ip);
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
    if (ip === LOCAL_IP) return true;
    return false;
}

function isLANIP(ip) {
    ip = normalizeIP(ip);
    if (isLocalIP(ip)) return true;
    const parts = ip.split('.');
    if (parts.length === 4) {
        const b = parseInt(parts[1]);
        if (parts[0] === '192' && b === 168) return true;
        if (parts[0] === '10') return true;
        if (parts[0] === '172' && b >= 16 && b <= 31) return true;
    }
    return false;
}

function startPsMonitor() {
    const psScript = path.join(__dirname, 'monitor.ps1');
    if (!fs.existsSync(psScript)) {
        addLog('monitor.ps1 未找到，回退到 systeminformation 采集', 'warning');
        return;
    }
    try {
        psProcess = spawn('powershell.exe', [
            '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
            '-File', psScript
        ], {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let buffer = '';
        psProcess.stdout.on('data', (data) => {
            buffer += data.toString();
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === 'ERROR') continue;
                const parts = trimmed.split(',');
                if (parts.length >= 5) {
                    psCachedCpu = parseFloat(parts[0]) || 0;
                    psCachedMemPercent = parseFloat(parts[1]) || 0;
                    psCachedMemTotal = parseFloat(parts[2]) || 0;
                    psCachedMemUsed = parseFloat(parts[3]) || 0;
                    psCachedMemFree = parseFloat(parts[4]) || 0;
                }
            }
        });

        psProcess.stderr.on('data', () => {});

        psProcess.on('close', (code) => {
            addLog(`PS 监控进程退出 (code: ${code})，5秒后重启`, 'warning');
            psProcess = null;
            setTimeout(startPsMonitor, 5000);
        });

        psProcess.on('error', (err) => {
            addLog(`PS 监控进程错误: ${err.message}`, 'error');
            psProcess = null;
        });

        addLog('PowerShell 持久监控进程已启动', 'info');
    } catch (err) {
        addLog(`启动 PS 监控失败: ${err.message}`, 'error');
    }
}

app.post('/api/login', async (req, res) => {
    const ip = normalizeIP(getClientIP(req));
    
    if (isIPLocked(ip)) {
        addLog(`IP ${ip} 已被锁定，拒绝登录 monitor`, 'warning');
        return res.status(423).json({ success: false, message: '该设备已被禁止登录，请明天再试', locked: true });
    }
    
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '请输入用户名和密码' });
    }

    let credOk = false;
    let userName = username;
    if (dbConnected) {
        try {
            const [rows] = await dbPool.execute(
                'SELECT * FROM users WHERE employee_id = ? AND role = "admin"',
                [username]
            );
            if (rows.length > 0) {
                const user = rows[0];
                const bcrypt = require('bcryptjs');
                if (bcrypt.compareSync(password, user.password)) {
                    credOk = true;
                    userName = user.name;
                }
            }
        } catch (err) {
            addLog(`数据库验证失败: ${err.message}`, 'error');
        }
    }
    if (!credOk) {
        addLog(`登录失败(数据库未连接或密码错误): ${username}`, 'warning');
        recordMonitorFailure(ip, 'login');
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 登录成功，清除该IP的失败记录
    if (monitorLockedIPs.has(ip)) {
        const record = monitorLockedIPs.get(ip);
        if (record.failures > 0 || record.locked) {
            record.failures = 0;
            record.locked = false;
            addLog(`IP ${ip} 密码错误记录已清除（登录成功）`, 'info');
        }
    }

    if (!isLocalIP(ip) && !certifiedDevices.has(ip)) {
        const now = Date.now();
        const approved = [...pendingRequests.values()].find(r => 
            r.ip === ip && r.status === 'approved' && r.approvedAt && (now - r.approvedAt) < REQUEST_EXPIRE_MS
        );
        if (!approved) {
            return res.json({ success: false, cred_ok: true, message: '凭证正确，需要申请访问授权', username, password: undefined });
        }
    }

    addLog(`管理员 ${username} 登录成功`, 'success');
    res.json({ success: true, user: { name: userName, username } });
});

// 检查IP类型（本地/局域网/认证设备/需要审批/已锁定）
app.get('/api/check-ip', (req, res) => {
    const ip = normalizeIP(getClientIP(req));
    if (isIPLocked(ip)) {
        return res.json({ type: 'locked', ip, message: '该设备已被锁定，禁止访问' });
    }
    if (isLocalIP(ip)) {
        return res.json({ type: 'local', ip, message: '本地访问' });
    }
    // 被踢出的设备不返回特殊状态，而是当作正常需要申请的设备处理
    // 但踢出状态仍然在其他地方生效（如登录、WebSocket连接等）
    if (certifiedDevices.has(ip)) {
        return res.json({ type: 'certified', ip, device: certifiedDevices.get(ip) });
    }
    const now = Date.now();
    const pending = [...pendingRequests.values()].find(r => 
        r.ip === ip && r.status === 'approved' && r.approvedAt && (now - r.approvedAt) < REQUEST_EXPIRE_MS
    );
    if (pending) {
        return res.json({ type: 'approved', ip, temporary: true });
    }
    if (isLANIP(ip)) {
        return res.json({ type: 'lan', ip, message: '局域网设备，需要申请访问' });
    }
    return res.json({ type: 'external', ip, message: '外部网络，需要申请访问' });
});

// 请求有效期 600s
const REQUEST_EXPIRE_MS = 600 * 1000;

// 启动时清理过期请求
(function cleanupStaleOnStartup() {
    const now = Date.now();
    let changed = false;
    for (const [id, req] of pendingRequests) {
        if (req.status === 'pending' && req.expiresAt && now > req.expiresAt) {
            req.status = 'expired';
            changed = true;
        }
        if (req.status === 'approved' && req.type === 'temporary' && req.approvedAt && (now - req.approvedAt) > REQUEST_EXPIRE_MS) {
            req.status = 'expired';
            changed = true;
        }
    }
    if (changed) savePendingFile();
})();

// 定期清理过期请求
setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const [id, req] of pendingRequests) {
        if (req.status === 'pending' && req.expiresAt && now > req.expiresAt) {
            req.status = 'expired';
            changed = true;
            addLog(`访问请求已过期: ${req.ip} (${req.username || '未知用户'})`, 'info');
            io.emit('access_request_expired', { requestId: id, ip: req.ip });
        }
        if (req.status === 'approved' && req.type === 'temporary' && req.approvedAt && (now - req.approvedAt) > REQUEST_EXPIRE_MS) {
            req.status = 'expired';
            changed = true;
            addLog(`临时访问已过期: ${req.ip} (${req.username || '未知用户'})`, 'info');
            io.emit('access_request_expired', { requestId: id, ip: req.ip });
        }
    }
    if (changed) savePendingFile();
}, 10000);

// 局域网设备申请访问
app.post('/api/request-access', (req, res) => {
    const ip = normalizeIP(getClientIP(req));
    const { userAgent, username } = req.body;
    
    if (isIPLocked(ip)) {
        return res.status(423).json({ success: false, message: '该设备已被锁定，请明天再试', locked: true });
    }
    
    // 被踢出的设备重新申请时清除踢出标记
    if (kickedIPs.has(ip)) {
        kickedIPs.delete(ip);
        addLog(`设备 ${ip} 重新申请访问，清除踢出标记`, 'info');
    }
    
    const existingPending = [...pendingRequests.values()].find(r => r.ip === ip && r.status === 'pending');
    if (existingPending) {
        return res.json({ success: true, message: '已存在待审批的请求，请等待管理员处理', status: 'pending', requestId: existingPending.id });
    }
    
    if (certifiedDevices.has(ip)) {
        return res.json({ success: true, message: '已认证设备，无需再次申请', status: 'certified' });
    }
    
    const reqId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const request = {
        id: reqId,
        ip,
        username: username || '未知用户',
        userAgent: userAgent || '未知设备',
        requestedAt: Date.now(),
        expiresAt: Date.now() + REQUEST_EXPIRE_MS,
        status: 'pending'
    };
    pendingRequests.set(reqId, request);
    savePendingFile();
    
    addLog(`新设备申请访问: ${ip} (用户: ${request.username}, 设备: ${request.userAgent})`, 'info');
    io.emit('new_access_request', request);
    
    res.json({ success: true, message: '访问申请已发送，请等待管理员审批', requestId: reqId });
});

// 查询申请状态
app.get('/api/request-status/:requestId', (req, res) => {
    const request = pendingRequests.get(req.params.requestId);
    if (!request) {
        return res.json({ status: 'not_found' });
    }
    if (request.status === 'pending' && request.expiresAt && Date.now() > request.expiresAt) {
        request.status = 'expired';
        savePendingFile();
    }
    res.json(request);
});

// 获取所有待审批请求
app.get('/api/pending-requests', (req, res) => {
    const pending = [...pendingRequests.values()].filter(r => r.status === 'pending');
    res.json({ success: true, requests: pending });
});

// 审批访问请求
app.post('/api/approve-access', (req, res) => {
    const { requestId, type } = req.body; // type: 'temporary' | 'certified'
    const request = pendingRequests.get(requestId);
    if (!request) {
        return res.status(404).json({ success: false, message: '请求不存在' });
    }
    
    if (type === 'certified') {
        certifiedDevices.set(request.ip, {
            name: request.userAgent || request.ip,
            addedAt: Date.now(),
            approvedBy: 'monitor'
        });
        saveDevicesFile();
        addLog(`设备已认证: ${request.ip} (${request.userAgent})`, 'success');
    }
    
    request.status = 'approved';
    request.approvedAt = Date.now();
    request.type = type;
    savePendingFile();
    
    addLog(`访问请求已批准: ${request.ip} (${type})`, 'success');
    io.emit('access_request_approved', { requestId, ip: request.ip, type });
    res.json({ success: true, message: '已批准' });
});

// 拒绝访问请求
app.post('/api/reject-access', (req, res) => {
    const { requestId } = req.body;
    const request = pendingRequests.get(requestId);
    if (!request) {
        return res.status(404).json({ success: false, message: '请求不存在' });
    }
    
    request.status = 'rejected';
    request.rejectedAt = Date.now();
    savePendingFile();
    
    addLog(`访问请求已拒绝: ${request.ip}`, 'warning');
    recordMonitorFailure(request.ip, 'reject');
    io.emit('access_request_rejected', { requestId, ip: request.ip });
    res.json({ success: true, message: '已拒绝' });
});

// 取消访问请求
app.post('/api/cancel-request', (req, res) => {
    const { requestId } = req.body;
    const request = pendingRequests.get(requestId);
    if (!request) {
        return res.status(404).json({ success: false, message: '请求不存在' });
    }
    if (request.status !== 'pending') {
        return res.json({ success: false, message: '请求状态已变更，无法取消' });
    }
    request.status = 'cancelled';
    request.cancelledAt = Date.now();
    savePendingFile();
    addLog(`访问请求已被用户取消: ${request.ip} (${request.username || '未知用户'})`, 'info');
    io.emit('access_request_cancelled', { requestId, ip: request.ip });
    res.json({ success: true, message: '请求已取消' });
});

// 撤销临时审批（退出登录时调用）
app.post('/api/revoke-temp', (req, res) => {
    const ip = normalizeIP(getClientIP(req));
    const approved = [...pendingRequests.values()].find(r => r.ip === ip && r.status === 'approved' && r.type === 'temporary');
    if (approved) {
        approved.status = 'revoked';
        approved.revokedAt = Date.now();
        savePendingFile();
        addLog(`临时访问权限已撤销: ${ip}`, 'info');
    }
    res.json({ success: true });
});

// 获取所有认证设备
app.get('/api/certified-devices', (req, res) => {
    const devices = [...certifiedDevices.entries()].map(([ip, info]) => ({
        ip,
        name: info.name,
        addedAt: info.addedAt
    }));
    res.json({ success: true, devices });
});

// 移除认证设备
app.post('/api/remove-device', (req, res) => {
    const { ip } = req.body;
    if (certifiedDevices.has(ip)) {
        const info = certifiedDevices.get(ip);
        certifiedDevices.delete(ip);
        saveDevicesFile();
        addLog(`认证设备已移除: ${ip} (${info.name})`, 'info');
        io.emit('device_removed', { ip });
        return res.json({ success: true, message: '设备已移除' });
    }
    res.status(404).json({ success: false, message: '设备不存在' });
});

// 获取 monitor 在线设备列表（仅本地可见）
app.get('/api/monitor-online-devices', (req, res) => {
    const ip = normalizeIP(getClientIP(req));
    if (!isLocalIP(ip)) {
        return res.status(403).json({ success: false, message: '仅本地访问' });
    }
    const devices = [...onlineMonitorSessions.values()].map(session => ({
        ...session,
        isLocal: isLocalIP(session.ip)
    }));
    res.json({ success: true, devices });
});

// 踢出指定 IP 的 monitor 设备
app.post('/api/kick-monitor-device', (req, res) => {
    const localIp = normalizeIP(getClientIP(req));
    if (!isLocalIP(localIp)) {
        return res.status(403).json({ success: false, message: '仅本地访问' });
    }
    const { targetIp } = req.body;
    if (!targetIp) {
        return res.status(400).json({ success: false, message: '缺少目标 IP' });
    }
    
    // 检查是否是本地 IP，不允许踢出本地
    if (isLocalIP(targetIp)) {
        return res.status(403).json({ success: false, message: '不允许踢出本地设备' });
    }
    
    // 添加到踢出列表
    kickedIPs.add(targetIp);
    addLog(`已踢出设备: ${targetIp}`, 'warning');
    
    // 断开该 IP 的所有 socket 连接
    for (const [socketId, session] of onlineMonitorSessions.entries()) {
        if (session.ip === targetIp) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
                socket.emit('kicked');
                socket.disconnect(true);
            }
        }
    }
    
    // 如果该 IP 是认证设备，移除认证
    if (certifiedDevices.has(targetIp)) {
        certifiedDevices.delete(targetIp);
        saveDevicesFile();
    }
    
    // 清理该 IP 的临时审批
    for (const [reqId, request] of pendingRequests.entries()) {
        if (request.ip === targetIp && request.status === 'approved') {
            request.status = 'revoked';
            request.revokedAt = Date.now();
        }
    }
    savePendingFile();
    
    io.emit('monitor_online_devices_updated', [...onlineMonitorSessions.values()]);
    res.json({ success: true, message: '已踢出设备' });
});

app.get('/api/logs', (req, res) => {
    res.json({ logs: [...serverLogs] });
});

app.post('/api/logs/clear', (req, res) => {
    serverLogs = [];
    addLog('日志已清空', 'info');
    res.json({ success: true });
});

app.get('/api/locked-ips', async (req, res) => {
    try {
        const result = await new Promise((resolve, reject) => {
            const req2 = require('http').get(MAIN_SERVER_URL + '/api/monitor/locked-ips', { timeout: 3000 }, (resp) => {
                let data = '';
                resp.on('data', chunk => data += chunk);
                resp.on('end', () => {
                    try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                });
            });
            req2.on('error', reject);
            req2.on('timeout', () => { req2.destroy(); reject(new Error('timeout')); });
        });
        // 合并主服务器的IP + monitor自己的IP
        const mainLocked = result.data || [];
        const monitorLocked = [];
        for (const [ip, record] of monitorLockedIPs.entries()) {
            if (record.lastResetDate === getTodayDateKey() && record.locked) {
                monitorLocked.push({
                    ip: ip,
                    lockTime: Date.now(),
                    reason: 'monitor登录失败次数过多',
                    captchaFails: record.failures
                });
            }
        }
        const allLocked = [...mainLocked, ...monitorLocked];
        res.json({ success: true, data: allLocked });
    } catch (err) {
        // 出错时至少返回monitor自己的IP
        const monitorLocked = [];
        for (const [ip, record] of monitorLockedIPs.entries()) {
            if (record.lastResetDate === getTodayDateKey() && record.locked) {
                monitorLocked.push({
                    ip: ip,
                    lockTime: Date.now(),
                    reason: 'monitor登录失败次数过多',
                    captchaFails: record.failures
                });
            }
        }
        res.json({ success: true, data: monitorLocked });
    }
});

app.post('/api/unlock-ip', async (req, res) => {
    const localIp = normalizeIP(getClientIP(req));
    if (!isLocalIP(localIp)) {
        return res.status(403).json({ success: false, message: '仅本地访问' });
    }
    
    const { ip } = req.body;
    if (!ip) {
        return res.status(400).json({ success: false, message: '缺少 IP' });
    }

    // 先解锁 monitor 自己的 IP
    if (monitorLockedIPs.has(ip)) {
        monitorLockedIPs.delete(ip);
        addLog(`已解锁 monitor IP: ${ip}`, 'info');
    }

    // 再尝试解锁主服务器的 IP
    try {
        const postData = JSON.stringify({ ip });
        const options = {
            hostname: '127.0.0.1',
            port: 3001,
            path: '/api/monitor/unlock-ip',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
            timeout: 3000
        };
        const req2 = require('http').request(options, (resp) => {
            let data = '';
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => {
                try {
                    const respData = JSON.parse(data);
                    res.json({ ...respData, message: '已解锁 IP' });
                } catch (e) {
                    res.json({ success: true, message: '已解锁 IP' });
                }
            });
        });
        req2.on('error', () => res.json({ success: true, message: '已解锁 IP' }));
        req2.on('timeout', () => { req2.destroy(); res.json({ success: true, message: '已解锁 IP' }); });
        req2.write(postData);
        req2.end();
    } catch (err) {
        res.json({ success: true, message: '已解锁 IP' });
    }
});

// 主服务器状态
app.get('/api/server-status', (req, res) => {
    res.json({
        running: mainServerProcess !== null && !mainServerProcess.killed,
        dbConnected: mainServerDbConnected
    });
});

// 启动主服务器
app.post('/api/server-start', (req, res) => {
    if (mainServerProcess && !mainServerProcess.killed) {
        return res.json({ success: false, message: '主服务器已在运行' });
    }
    spawnMainServer();
    res.json({ success: true, message: '正在启动主服务器' });
});

// 停止主服务器
app.post('/api/server-stop', (req, res) => {
    if (!mainServerProcess || mainServerProcess.killed) {
        return res.json({ success: false, message: '主服务器未在运行' });
    }
    addLog('正在停止主服务器...', 'info');
    mainServerProcess.removeAllListeners('close');
    mainServerProcess.kill('SIGINT');
    mainServerProcess = null;
    mainServerDbConnected = false;
    addLog('主服务器已停止', 'warning');
    res.json({ success: true, message: '主服务器已停止' });
});

// 手动备份数据库
app.post('/api/backup', async (req, res) => {
    const result = await backupDatabase();
    res.json(result);
});

// 获取备份列表
app.get('/api/backups', async (req, res) => {
    const backups = await getBackupList();
    res.json({ success: true, backups });
});

// 恢复数据库
app.post('/api/restore', async (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).json({ success: false, error: '请选择备份文件' });
    }
    const result = await restoreDatabase(filename);
    res.json(result);
});

// 删除备份
app.delete('/api/backup', async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ success: false, error: '请选择备份文件' });
        }
        const backupFile = path.join(BACKUP_DIR, filename);
        if (!fs.existsSync(backupFile)) {
            return res.status(404).json({ success: false, error: '备份文件不存在' });
        }
        fs.unlinkSync(backupFile);
        addLog(`删除备份: ${filename}`, 'info');
        res.json({ success: true });
    } catch (err) {
        addLog(`删除备份失败: ${err.message}`, 'error');
        res.status(500).json({ success: false, error: err.message });
    }
});

async function initDatabase() {
    try {
        dbPool = mysql.createPool(DB_CONFIG);
        await dbPool.getConnection();
        dbConnected = true;
        addLog('数据库连接成功', 'success');
    } catch (err) {
        dbConnected = false;
        addLog(`数据库连接失败: ${err.message}`, 'error');
    }
}

function addLog(message, type) {
    const timeStr = formatTime(new Date());
    const log = {
        id: Date.now() + Math.random(),
        time: new Date().toISOString(),
        message: `[${timeStr}] ${message}`,
        type: type || 'info',
        source: 'monitor'
    };
    serverLogs.push(log);
    if (serverLogs.length > MAX_LOGS) serverLogs.shift();
    io.emit('new_log', log);
}

// 从主服务器获取数据库状态
async function fetchMainDbStatus() {
    try {
        const dbRes = await new Promise((resolve, reject) => {
            const req = require('http').get('http://127.0.0.1:3001/api/monitor/db-status', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.setTimeout(1000, () => { req.destroy(); reject(new Error('timeout')); });
        });
        const dbData = JSON.parse(dbRes);
        mainDbConfig.host = dbData.host;
        mainDbConfig.port = dbData.port;
        mainDbConfig.connected = dbData.connected;
    } catch (err) {
        mainDbConfig.connected = false;
    }
}

// 通过主服务器 API 备份数据库
async function backupDatabase() {
    try {
        addLog('开始手动备份数据库...', 'info');
        
        const http = require('http');
        const result = await new Promise((resolve, reject) => {
            console.log('[DEBUG] 准备发送请求到 127.0.0.1:3001/api/monitor/backup');
            
            const options = {
                hostname: '127.0.0.1',
                port: 3001,
                path: '/api/monitor/backup',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            };
            
            const req = http.request(options, (res) => {
                console.log(`[DEBUG] 收到响应，状态码: ${res.statusCode}`);
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                    console.log(`[DEBUG] 收到数据块，当前长度: ${data.length}`);
                });
                res.on('end', () => {
                    console.log(`[DEBUG] 响应结束，完整数据: ${data}`);
                    try {
                        const parsed = JSON.parse(data);
                        console.log('[DEBUG] 解析成功:', parsed);
                        resolve(parsed);
                    } catch (e) {
                        console.error('[DEBUG] 解析失败:', e, '原始数据:', data);
                        reject(new Error(`响应解析失败: ${e.message} - 数据: ${data.substring(0, 200)}`));
                    }
                });
            });
            
            req.on('error', (e) => {
                console.error('[DEBUG] 请求错误:', e);
                reject(new Error(`请求失败: ${e.message}`));
            });
            
            req.setTimeout(60000, () => {
                console.error('[DEBUG] 请求超时');
                req.destroy();
                reject(new Error('请求超时'));
            });
            
            req.end();
        });
        
        if (result.success) {
            addLog(`数据库备份成功: ${result.filename}`, 'success');
        } else {
            addLog(`数据库备份失败: ${result.error || '未知错误'}`, 'error');
        }
        return result;
    } catch (err) {
        console.error('[DEBUG] 备份异常:', err);
        addLog(`数据库备份失败: ${err.message}`, 'error');
        return { success: false, error: err.message };
    }
}

// 通过主服务器 API 恢复数据库
async function restoreDatabase(filename) {
    try {
        addLog(`开始恢复数据库: ${filename}`, 'info');
        const result = await new Promise((resolve, reject) => {
            const options = {
                hostname: '127.0.0.1',
                port: 3001,
                path: '/api/monitor/restore',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            };
            const req = require('http').request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', reject);
            req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
            req.write(JSON.stringify({ filename }));
            req.end();
        });
        if (result.success) {
            addLog(`数据库恢复成功: ${filename}`, 'success');
        } else {
            addLog(`数据库恢复失败: ${result.error}`, 'error');
        }
        return result;
    } catch (err) {
        addLog(`数据库恢复失败: ${err.message}`, 'error');
        return { success: false, error: err.message };
    }
}

// 通过主服务器 API 获取备份列表
async function getBackupList() {
    try {
        const result = await new Promise((resolve, reject) => {
            const req = require('http').get('http://127.0.0.1:3001/api/monitor/backups', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', reject);
            req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
        });
        return result.backups || [];
    } catch (err) {
        return [];
    }
}

// 定时自动备份（每天晚上10点）
let backupInterval = null;
function startAutoBackup() {
    const checkAndBackup = async () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // 每天晚上 10 点执行备份
        if (hours === 22 && minutes === 0) {
            addLog('开始自动备份数据库...', 'info');
            await backupDatabase();
        }
    };

    // 每分钟检查一次时间
    backupInterval = setInterval(checkAndBackup, 60000);
    addLog('自动备份功能已启用（每天 22:00）', 'info');
}

async function getSystemInfo() {
    try {
        // 获取在线用户数
        let onlineCount = 0;
        try {
            const onlineRes = await new Promise((resolve, reject) => {
                const req = require('http').get('http://127.0.0.1:3001/api/monitor/online-count', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(data));
                });
                req.on('error', reject);
                req.setTimeout(1000, () => { req.destroy(); reject(new Error('timeout')); });
            });
            const onlineData = JSON.parse(onlineRes);
            onlineCount = onlineData.count || 0;
        } catch (err) {
            onlineCount = 0;
        }
        onlineUsers = onlineCount;

        // 获取主服务器数据库状态
        await fetchMainDbStatus();

        const now = Date.now();

        let cpuUsagePercent = psCachedCpu;
        let memData = {
            used: psCachedMemUsed,
            total: psCachedMemTotal,
            usage: psCachedMemPercent,
            free: psCachedMemFree
        };

        if (!psProcess || psCachedCpu === 0) {
            try {
                const [cpuLoad, memLoad] = await Promise.all([
                    si.currentLoad(),
                    si.mem()
                ]);
                cpuUsagePercent = parseFloat(cpuLoad.currentLoad.toFixed(1));
                memData = {
                    used: parseFloat((memLoad.used / 1024 / 1024 / 1024).toFixed(2)),
                    total: parseFloat((memLoad.total / 1024 / 1024 / 1024).toFixed(2)),
                    usage: parseFloat(((memLoad.used / memLoad.total) * 100).toFixed(1)),
                    free: parseFloat((memLoad.free / 1024 / 1024 / 1024).toFixed(2))
                };
            } catch (e) {}
        }

        if (!cachedDisk || !cachedNetwork || !cachedOsInfo || now - lastDiskFetch > SLOW_FETCH_INTERVAL) {
            try {
                const [diskLoad, networkStats, osInfo] = await Promise.all([
                    si.fsSize(),
                    si.networkStats(),
                    si.osInfo()
                ]);
                cachedDisk = diskLoad;
                cachedNetwork = networkStats;
                cachedOsInfo = osInfo;
                lastDiskFetch = now;
            } catch (e) {}
        }

        const elapsed = now - lastCpuTime;
        const cpuUsage = process.cpuUsage(lastCpuUsage);
        const processCpuPercent = elapsed > 0
            ? ((cpuUsage.user + cpuUsage.system) / (elapsed * 1000)).toFixed(1)
            : 0;
        lastCpuUsage = process.cpuUsage();
        lastCpuTime = now;

        const memUsage = process.memoryUsage();
        const mainServerOk = workerPoolStats && workerPoolStats !== 'error';

        return {
            timestamp: Date.now(),
            dbHost: mainDbConfig.host,
            dbPort: mainDbConfig.port,
            cpu: {
                usage: cpuUsagePercent,
                cores: os.cpus().length,
                model: os.cpus()[0] ? os.cpus()[0].model : 'Unknown'
            },
            memory: memData,
            disk: cachedDisk && cachedDisk[0] ? {
                used: parseFloat((cachedDisk[0].used / 1024 / 1024 / 1024).toFixed(2)),
                total: parseFloat((cachedDisk[0].size / 1024 / 1024 / 1024).toFixed(2)),
                usage: parseFloat(cachedDisk[0].use.toFixed(1))
            } : null,
            network: cachedNetwork && cachedNetwork[0] ? {
                rx: parseFloat((cachedNetwork[0].rx_sec / 1024).toFixed(1)),
                tx: parseFloat((cachedNetwork[0].tx_sec / 1024).toFixed(1))
            } : null,
            os: cachedOsInfo ? {
                platform: cachedOsInfo.platform,
                distro: cachedOsInfo.distro,
                hostname: cachedOsInfo.hostname,
                uptime: cachedOsInfo.uptime
            } : null,
            process: {
                cpu: parseFloat(processCpuPercent),
                memory: {
                    rss: parseFloat((memUsage.rss / 1024 / 1024).toFixed(1)),
                    heapUsed: parseFloat((memUsage.heapUsed / 1024 / 1024).toFixed(1)),
                    heapTotal: parseFloat((memUsage.heapTotal / 1024 / 1024).toFixed(1))
                },
                uptime: parseFloat((process.uptime() / 3600).toFixed(2))
            },
            workerPool: workerPoolStats || { status: 'unknown' },
            mainServer: mainServerOk ? 'running' : 'unknown',
            dbConnected: mainDbConfig.connected,
            onlineUsers,
            abnormalAccountsCount,
            attackDetected
        };
    } catch (err) {
        return {
            timestamp: Date.now(),
            error: err.message,
            dbHost: mainDbConfig.host,
            dbPort: mainDbConfig.port,
            dbConnected: mainDbConfig.connected,
            onlineUsers,
            abnormalAccountsCount,
            attackDetected
        };
    }
}

async function updateAbnormalAccounts() {
    try {
        const result = await new Promise((resolve, reject) => {
            const req = require('http').get(MAIN_SERVER_URL + '/api/monitor/locked-ips', { timeout: 3000 }, (resp) => {
                let data = '';
                resp.on('data', chunk => data += chunk);
                resp.on('end', () => {
                    try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                });
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        });
        if (result.success && result.data && Array.isArray(result.data)) {
            abnormalAccountsCount = result.data.length;
            attackDetected = abnormalAccountsCount > 0;
            io.emit('locked_ips', result.data);
        }
    } catch (err) {}
}

function classifyLog(line, source) {
    let type = 'info';
    if (/warn|警告|安全/i.test(line)) {
        type = 'warning';
    } else if (source === 'error' || /error|错误|fail|失败|exception/i.test(line)) {
        type = 'error';
    } else if (/success|成功|ok|完成/i.test(line)) {
        type = 'success';
    }
    const timeStr = formatTime(new Date());
    return {
        id: Date.now() + Math.random(),
        time: new Date().toISOString(),
        message: `[${timeStr}] ${line}`,
        type,
        source
    };
}

function readNewLines(fileInfo) {
    try {
        if (!fs.existsSync(fileInfo.path)) return [];
        const stats = fs.statSync(fileInfo.path);
        const currentSize = stats.size;
        const lastPosition = filePositions.get(fileInfo.path) || 0;
        if (currentSize < lastPosition) {
            filePositions.set(fileInfo.path, 0);
            return [];
        }
        if (currentSize === lastPosition) return [];
        const buffer = Buffer.alloc(currentSize - lastPosition);
        const fd = fs.openSync(fileInfo.path, 'r');
        fs.readSync(fd, buffer, 0, buffer.length, lastPosition);
        fs.closeSync(fd);
        filePositions.set(fileInfo.path, currentSize);
        const content = buffer.toString('utf8');
        return content.split(/\r?\n/).filter(l => l.trim()).map(l => classifyLog(l, fileInfo.source));
    } catch (err) {
        return [];
    }
}

let mainServerProcess = null;
let proxyProcess = null;
let mainServerDbConnected = false;

function spawnProxyServer() {
    const proxyScript = path.join(__dirname, 'proxy.js');
    addLog('正在启动反向代理服务器 (node proxy.js)...', 'info');
    
    proxyProcess = spawn('node', [proxyScript], {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
    });

    proxyProcess.stdout.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/).filter(l => l.trim());
        lines.forEach(l => {
            const log = classifyLog(l, 'proxy');
            serverLogs.push(log);
            if (serverLogs.length > MAX_LOGS) serverLogs.shift();
            io.emit('new_log', log);
        });
    });

    proxyProcess.stderr.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/).filter(l => l.trim());
        lines.forEach(l => {
            const log = classifyLog(l, 'proxy-error');
            serverLogs.push(log);
            if (serverLogs.length > MAX_LOGS) serverLogs.shift();
            io.emit('new_log', log);
        });
    });

    proxyProcess.on('error', (err) => {
        addLog(`反向代理启动失败: ${err.message}`, 'error');
    });

    proxyProcess.on('close', (code) => {
        addLog(`反向代理已退出 (code: ${code})`, 'warning');
        proxyProcess = null;
    });

    addLog('反向代理进程已启动', 'success');
}

function spawnMainServer() {
    const serverScript = path.join(__dirname, 'server.js');
    addLog('正在启动主服务器 (node server.js)...', 'info');
    mainServerDbConnected = false;
    let startedLogged = false;

    mainServerProcess = spawn('node', ['--max-old-space-size=12288', serverScript], {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
    });

    mainServerProcess.stdout.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/).filter(l => l.trim());
        lines.forEach(l => {
            // 检测数据库连接成功
            if (l.includes('MySQL 连接成功')) {
                mainServerDbConnected = true;
            }
            
            // 过滤掉启动信息（只保留「主服务器已经启动」）
            if (l.includes('成绩分析系统已启动') && !startedLogged) {
                const log = classifyLog('主服务器已经启动', 'server');
                serverLogs.push(log);
                if (serverLogs.length > MAX_LOGS) serverLogs.shift();
                io.emit('new_log', log);
                startedLogged = true;
            }
            // 其他所有日志都显示（只要不是启动信息）
            else if (
                !l.includes('Ignoring invalid configuration option') &&
                !l.includes('已创建图片存储目录') &&
                !l.includes('所有表创建完成') &&
                !l.includes('数据库初始化完成') &&
                !l.includes('========================================') &&
                !l.includes('成绩分析系统已启动') &&
                !l.includes('本地访问') &&
                !l.includes('局域网访问') &&
                !l.includes('WS:    ws://') &&
                !l.includes('班级账号最大连接数') &&
                !l.includes('会话空闲超时') &&
                !l.includes('默认管理员')
            ) {
                const log = classifyLog(l, 'server');
                serverLogs.push(log);
                if (serverLogs.length > MAX_LOGS) serverLogs.shift();
                io.emit('new_log', log);
            }
        });
    });

    mainServerProcess.stderr.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/).filter(l => l.trim());
        lines.forEach(l => {
            // 显示所有错误日志，除了配置警告
            if (!l.includes('Ignoring invalid configuration option')) {
                const log = classifyLog(l, 'server-error');
                serverLogs.push(log);
                if (serverLogs.length > MAX_LOGS) serverLogs.shift();
                io.emit('new_log', log);
            }
        });
    });

    mainServerProcess.on('error', (err) => {
        addLog(`主服务器启动失败: ${err.message}`, 'error');
    });

    mainServerProcess.on('close', (code) => {
        addLog(`主服务器已退出 (code: ${code})`, 'warning');
        mainServerProcess = null;
        setTimeout(() => {
            addLog('尝试重新启动主服务器...', 'info');
            spawnMainServer();
        }, 5000);
    });

    addLog('主服务器进程已启动', 'success');
}

function initLogWatchers() {
    LOG_FILES = discoverLogFiles();

    LOG_FILES.forEach(fi => {
        try {
            if (fs.existsSync(fi.path)) {
                const stats = fs.statSync(fi.path);
                filePositions.set(fi.path, stats.size);
                const content = fs.readFileSync(fi.path, 'utf8');
                const lines = content.split(/\r?\n/).filter(l => l.trim()).slice(-80);
                lines.forEach(l => {
                    const log = classifyLog(l, fi.source);
                    serverLogs.push(log);
                });
            }
        } catch (e) {}
    });
    while (serverLogs.length > MAX_LOGS) serverLogs.shift();

    setInterval(() => {
        LOG_FILES = discoverLogFiles();
        LOG_FILES.forEach(fi => {
            const logs = readNewLines(fi);
            logs.forEach(l => {
                serverLogs.push(l);
                if (serverLogs.length > MAX_LOGS) serverLogs.shift();
                io.emit('new_log', l);
            });
        });
    }, LOG_POLL_INTERVAL);
}

function startResourceCollection() {
    setInterval(async () => {
        lastSystemInfo = await getSystemInfo();
        io.emit('system_info', lastSystemInfo);
    }, RESOURCE_INTERVAL);
}

function startAbnormalCheck() {
    setInterval(updateAbnormalAccounts, 10000);
}

async function fetchWorkerPoolStats() {
    try {
        const resp = await new Promise((resolve, reject) => {
            const req = require('http').get(MAIN_SERVER_URL + '/api/worker-pool-stats', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
        });
        workerPoolStats = JSON.parse(resp);
    } catch (err) {
        workerPoolStats = 'error';
    }
}

function startWorkerPoolMonitor() {
    fetchWorkerPoolStats();
    setInterval(fetchWorkerPoolStats, 3000);
}

io.on('connection', (socket) => {
    const ip = normalizeIP(socket.handshake.address);
    
    if (isIPLocked(ip)) {
        socket.emit('locked', { message: '该设备已被锁定，请明天再试' });
        socket.disconnect(true);
        return;
    }
    
    // 检查是否被踢出
    if (kickedIPs.has(ip)) {
        socket.emit('kicked');
        socket.disconnect(true);
        return;
    }
    
    onlineUsers++;
    
    // 记录在线 session
    const session = {
        ip,
        connectedAt: Date.now(),
        userAgent: socket.handshake.headers['user-agent'] || '未知设备'
    };
    onlineMonitorSessions.set(socket.id, session);
    
    addLog(`客户端连接: ${socket.id.substring(0, 8)} (${ip})`, 'info');
    
    // 向所有本地连接推送在线设备更新
    const devicesWithLocal = [...onlineMonitorSessions.values()].map(session => ({
        ...session,
        isLocal: isLocalIP(session.ip)
    }));
    io.emit('monitor_online_devices_updated', devicesWithLocal);
    
    if (lastSystemInfo) socket.emit('system_info', lastSystemInfo);
    socket.emit('logs_history', [...serverLogs]);
    
    socket.on('disconnect', () => {
        onlineUsers--;
        onlineMonitorSessions.delete(socket.id);
        addLog(`客户端断开: ${socket.id.substring(0, 8)} (${ip})`, 'info');
        const devicesWithLocalAfter = [...onlineMonitorSessions.values()].map(session => ({
            ...session,
            isLocal: isLocalIP(session.ip)
        }));
        io.emit('monitor_online_devices_updated', devicesWithLocalAfter);
    });
});

async function startServer() {
    await initDatabase();
    startPsMonitor();
    spawnMainServer();
    spawnProxyServer();
    initLogWatchers();
    startResourceCollection();
    startAbnormalCheck();
    setTimeout(startWorkerPoolMonitor, 3000);
    startAutoBackup();
    server.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('=========================================');
        console.log('  服务器已启动');
        console.log('  本地访问: http://127.0.0.1:' + PORT);
        console.log('  局域网访问: http://' + LOCAL_IP + ':' + PORT);
        console.log('=========================================');
        addLog('服务器已启动', 'success');
    });
}

startServer();
module.exports = { addLog, getSystemInfo };