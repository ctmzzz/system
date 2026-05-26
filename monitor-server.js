// 限制 libuv 线程池大小为 1，减少 CPU 占用
process.env.UV_THREADPOOL_SIZE = '1';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const si = require('systeminformation');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const MAIN_SERVER_URL = 'http://127.0.0.1:3001';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: true, credentials: true },
    pingInterval: 5000,
    pingTimeout: 3000,
    connectTimeout: 5000
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'monitor-public')));

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

// 从主服务器读取数据库配置
const mainDbConfig = {
    host: 'localhost',
    port: 3306,
    connected: false
};

// monitor 自己的数据库配置（用于登录）
const DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'score_analysis',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
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

let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '请输入用户名和密码' });
    }
    if (dbConnected) {
        try {
            const [rows] = await dbPool.execute(
                'SELECT * FROM users WHERE employee_id = ? AND role = "admin"',
                [username]
            );
            if (rows.length > 0) {
                const user = rows[0];
                const bcrypt = require('bcryptjs');
                if (bcrypt.compareSync(password, user.password) || password === user.plain_password) {
                    addLog(`管理员 ${username} 登录成功`, 'success');
                    return res.json({ success: true, user: { name: user.name, username: user.employee_id } });
                }
            }
        } catch (err) {
            addLog(`数据库验证失败: ${err.message}`, 'error');
        }
    }
    if ((username === 'admin' && password === 'admin123') || (username === 'root' && password === 'root')) {
        addLog(`管理员 ${username} 登录成功（备用验证）`, 'success');
        return res.json({ success: true, user: { name: username, username } });
    }
    addLog(`登录失败: ${username}`, 'warning');
    res.status(401).json({ success: false, message: '用户名或密码错误' });
});

app.get('/api/logs', (req, res) => {
    res.json({ logs: [...serverLogs] });
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
        const result = await new Promise((resolve, reject) => {
            const options = {
                hostname: '127.0.0.1',
                port: 3001,
                path: '/api/monitor/backup',
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            };
            const reqObj = require('http').request(options, (resObj) => {
                let data = '';
                resObj.on('data', chunk => data += chunk);
                resObj.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            reqObj.on('error', reject);
            reqObj.setTimeout(5000, () => { reqObj.destroy(); reject(new Error('timeout')); });
            reqObj.write(JSON.stringify({ filename }));
            reqObj.end();
        });
        addLog(`删除备份: ${filename}`, 'info');
        res.json(result);
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
        console.log('[DB-STATUS] 正在获取主服务器数据库状态...');
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
        console.log('[DB-STATUS] 收到数据:', dbData);
        mainDbConfig.host = dbData.host;
        mainDbConfig.port = dbData.port;
        mainDbConfig.connected = dbData.connected;
        console.log('[DB-STATUS] 更新后 mainDbConfig:', mainDbConfig);
    } catch (err) {
        console.error('[DB-STATUS] 获取失败:', err.message);
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

        const [cpuLoad, memLoad, diskLoad, networkStats, osInfo] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.networkStats(),
            si.osInfo()
        ]);

        const now = Date.now();
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
                usage: parseFloat(cpuLoad.currentLoad.toFixed(1)),
                cores: cpuLoad.cpus.length,
                model: cpuLoad.cpus[0] ? cpuLoad.cpus[0].model : 'Unknown'
            },
            memory: {
                used: parseFloat((memLoad.used / 1024 / 1024 / 1024).toFixed(2)),
                total: parseFloat((memLoad.total / 1024 / 1024 / 1024).toFixed(2)),
                usage: parseFloat(((memLoad.used / memLoad.total) * 100).toFixed(1)),
                free: parseFloat((memLoad.free / 1024 / 1024 / 1024).toFixed(2))
            },
            disk: diskLoad[0] ? {
                used: parseFloat((diskLoad[0].used / 1024 / 1024 / 1024).toFixed(2)),
                total: parseFloat((diskLoad[0].size / 1024 / 1024 / 1024).toFixed(2)),
                usage: parseFloat(diskLoad[0].use.toFixed(1))
            } : null,
            network: networkStats[0] ? {
                rx: parseFloat((networkStats[0].rx_sec / 1024).toFixed(1)),
                tx: parseFloat((networkStats[0].tx_sec / 1024).toFixed(1))
            } : null,
            os: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                hostname: osInfo.hostname,
                uptime: osInfo.uptime
            },
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
    if (!dbPool) return;
    try {
        const [rows] = await dbPool.query(
            `SELECT COUNT(*) as count FROM user_logins 
             WHERE fail_count >= 5 AND last_fail_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)`
        );
        abnormalAccountsCount = rows[0].count || 0;
        attackDetected = abnormalAccountsCount > 0;
    } catch (err) {}
}

function classifyLog(line, source) {
    let type = 'info';
    if (source === 'error' || /error|错误|fail|失败|exception/i.test(line)) {
        type = 'error';
    } else if (/warn|警告/i.test(line)) {
        type = 'warning';
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
let mainServerDbConnected = false;

function spawnMainServer() {
    const serverScript = path.join(__dirname, 'server.js');
    addLog('正在启动主服务器 (node server.js)...', 'info');
    mainServerDbConnected = false;
    let startedLogged = false;

    mainServerProcess = spawn('node', [serverScript], {
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
    onlineUsers++;
    addLog(`客户端连接: ${socket.id.substring(0, 8)}`, 'info');
    if (lastSystemInfo) socket.emit('system_info', lastSystemInfo);
    socket.emit('logs_history', [...serverLogs]);
    socket.on('disconnect', () => {
        onlineUsers--;
        addLog(`客户端断开: ${socket.id.substring(0, 8)}`, 'info');
    });
});

async function startServer() {
    await initDatabase();
    spawnMainServer();
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