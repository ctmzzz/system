process.env.UV_THREADPOOL_SIZE = '1';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const MAIN_SERVER_URL = 'http://192.168.3.6:3001';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: true, credentials: true },
    pingInterval: 15000,
    pingTimeout: 10000,
    connectTimeout: 10000
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.MONITOR_PORT || 3002;
const MAX_LOGS = 500;
const POLL_INTERVAL = 5000;

let lastSystemInfo = null;
let serverLogs = [];
let mainServerOk = false;
let mainDbConnected = false;
let dbHost = 'unknown';
let dbPort = 3306;
let onlineUsersCount = 0;
let abnormalAccountsCount = 0;
let attackDetected = false;
let workerPoolStats = null;

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

async function httpGet(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, {
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await res.json();
    } catch (e) {
        clearTimeout(timeoutId);
        throw new Error(e.cause?.code === 'ABORT_ERR' ? 'timeout' : e.message);
    }
}

async function httpPost(url, body = {}, timeout = 60000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await res.json();
    } catch (e) {
        clearTimeout(timeoutId);
        throw new Error(e.cause?.code === 'ABORT_ERR' ? 'timeout' : e.message);
    }
}

async function fetchSystemInfo() {
    try {
        const result = await httpGet(MAIN_SERVER_URL + '/api/monitor/system-info', 5000);
        if (result.success && result.data) {
            const d = result.data;
            dbConnected = d.dbConnected !== undefined ? d.dbConnected : dbConnected;
            if (d.dbHost !== undefined) dbHost = d.dbHost;
            if (d.dbPort !== undefined) dbPort = d.dbPort;
            return {
                timestamp: d.timestamp,
                cpu: {
                    usage: d.cpu.usage || 0,
                    cores: d.cpu.cores || 0,
                    model: d.cpu.model || 'Unknown'
                },
                memory: {
                    used: d.memory.used || 0,
                    total: d.memory.total || 0,
                    usage: d.memory.usage || 0,
                    free: d.memory.free || 0
                },
                disk: d.disk ? {
                    used: d.disk.used || 0,
                    total: d.disk.total || 0,
                    usage: d.disk.usage || 0
                } : null,
                network: d.network,
                os: d.os || {},
                process: d.process || {},
                mainServer: 'running',
                dbConnected: dbConnected,
                dbHost: dbHost,
                dbPort: dbPort,
                onlineUsers: d.onlineUsers || 0,
                abnormalAccountsCount: d.abnormalAccountsCount || 0,
                attackDetected: d.attackDetected || false,
                workerPool: workerPoolStats || { status: 'unknown' }
            };
        }
    } catch (err) {
        return {
            timestamp: Date.now(),
            error: err.message,
            mainServer: 'unknown',
            dbConnected: dbConnected,
            dbHost: dbHost,
            dbPort: dbPort,
            onlineUsers: 0,
            abnormalAccountsCount: 0,
            attackDetected: false
        };
    }
    return null;
}

async function fetchDbStatus() {
    try {
        const result = await httpGet(MAIN_SERVER_URL + '/api/monitor/db-status', 3000);
        mainDbConnected = result.connected || false;
        dbHost = result.host || 'unknown';
        dbPort = result.port || 3306;
    } catch (err) {
        mainDbConnected = false;
    }
}

async function fetchOnlineCount() {
    try {
        const result = await httpGet(MAIN_SERVER_URL + '/api/monitor/online-count', 3000);
        onlineUsersCount = result.count || 0;
    } catch (err) {
        onlineUsersCount = 0;
    }
}

async function fetchAbnormalAccounts() {
    try {
        const result = await httpGet(MAIN_SERVER_URL + '/api/monitor/locked-ips', 3000);
        if (result.lockedIps && Array.isArray(result.lockedIps)) {
            abnormalAccountsCount = result.lockedIps.length;
            attackDetected = abnormalAccountsCount > 0;
        }
    } catch (err) {
    }
}

async function fetchWorkerPoolStats() {
    try {
        const result = await httpGet(MAIN_SERVER_URL + '/api/worker-pool-stats', 3000);
        workerPoolStats = result;
    } catch (err) {
        workerPoolStats = 'error';
    }
}

let lastLogId = 0;

async function fetchMainServerLogs() {
    try {
        const result = await httpGet(MAIN_SERVER_URL + '/api/monitor/logs?since_id=' + lastLogId, 3000);
        if (result.logs && Array.isArray(result.logs) && result.logs.length > 0) {
            result.logs.forEach(log => {
                serverLogs.push({ ...log, id: log.id || (Date.now() + Math.random()) });
                if (serverLogs.length > MAX_LOGS) serverLogs.shift();
                io.emit('new_log', log);
                if (log.id > lastLogId) lastLogId = log.id;
            });
        }
    } catch (err) {
    }
}

async function pollAllData() {
    await Promise.all([
        fetchSystemInfo().then(info => {
            if (info) {
                lastSystemInfo = info;
                io.emit('system_info', info);
            }
        }),
        fetchDbStatus(),
        fetchOnlineCount(),
        fetchAbnormalAccounts(),
        fetchWorkerPoolStats()
    ]);

    const now = Date.now();
    if (now - lastLogFetchTime >= 3000) {
        lastLogFetchTime = now;
        fetchMainServerLogs();
    }
}

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '请输入用户名和密码' });
    }
    if ((username === 'admin' && password === 'admin123') || (username === 'root' && password === 'root')) {
        addLog(`管理员 ${username} 登录成功`, 'success');
        return res.json({ success: true, user: { name: username, username } });
    }
    addLog(`登录失败: ${username}`, 'warning');
    res.status(401).json({ success: false, message: '用户名或密码错误' });
});

app.get('/api/logs', (req, res) => {
    res.json({ logs: [...serverLogs] });
});

app.get('/api/locked-ips', async (req, res) => {
    try {
        const result = await httpGet(MAIN_SERVER_URL + '/api/monitor/locked-ips', 3000);
        res.json(result);
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

app.post('/api/unlock-ip', async (req, res) => {
    try {
        const result = await httpPost(MAIN_SERVER_URL + '/api/monitor/unlock-ip', req.body, 5000);
        res.json(result);
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

app.get('/api/server-status', async (req, res) => {
    try {
        await httpGet(MAIN_SERVER_URL + '/api/monitor/db-status', 2000);
        mainServerOk = true;
        res.json({ running: true, dbConnected: mainDbConnected });
    } catch (err) {
        mainServerOk = false;
        res.json({ running: false, dbConnected: false });
    }
});

// 远程停止主服务器
app.post('/api/stop-server', async (req, res) => {
    try {
        addLog('正在停止主服务器...', 'warn');
        const result = await httpPost(MAIN_SERVER_URL + '/api/monitor/shutdown', {}, 2000);
        res.json(result);
    } catch (err) {
        addLog('停止主服务器失败', 'error');
        res.json({ success: false, error: err.message });
    }
});

// 远程启动主服务器（假设monitor和主服务器在同一台机器）
app.post('/api/start-server', async (req, res) => {
    try {
        const { spawn } = require('child_process');
        const path = require('path');
        
        // 假设主服务器在父目录
        const mainServerDir = path.resolve(__dirname, '..');
        const mainServerPath = path.join(mainServerDir, 'server.js');
        
        addLog('正在启动主服务器...', 'info');
        
        // 使用独立进程启动
        const child = spawn('node', ['server.js'], {
            cwd: mainServerDir,
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        
        res.json({ success: true, message: '主服务器启动指令已发送' });
        addLog('主服务器启动指令已发送', 'success');
    } catch (err) {
        addLog('启动主服务器失败', 'error');
        res.json({ success: false, error: err.message });
    }
});

app.post('/api/backup', async (req, res) => {
    addLog('开始备份数据库...', 'info');
    try {
        const result = await httpPost(MAIN_SERVER_URL + '/api/monitor/backup', {}, 120000);
        if (result.success) {
            addLog(`数据库备份成功: ${result.filename}`, 'success');
        } else {
            addLog(`数据库备份失败: ${result.error || '未知错误'}`, 'error');
        }
        res.json(result);
    } catch (err) {
        addLog(`数据库备份失败: ${err.message}`, 'error');
        res.json({ success: false, error: err.message });
    }
});

app.get('/api/backups', async (req, res) => {
    try {
        const result = await httpGet(MAIN_SERVER_URL + '/api/monitor/backups', 5000);
        res.json({ success: true, backups: result.backups || [] });
    } catch (err) {
        res.json({ success: true, backups: [] });
    }
});

app.post('/api/restore', async (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).json({ success: false, error: '请选择备份文件' });
    }
    addLog(`开始恢复数据库: ${filename}`, 'info');
    try {
        const result = await httpPost(MAIN_SERVER_URL + '/api/monitor/restore', { filename }, 120000);
        if (result.success) {
            addLog(`数据库恢复成功: ${filename}`, 'success');
        } else {
            addLog(`数据库恢复失败: ${result.error}`, 'error');
        }
        res.json(result);
    } catch (err) {
        addLog(`数据库恢复失败: ${err.message}`, 'error');
        res.json({ success: false, error: err.message });
    }
});

async function httpDelete(url, body = {}, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await res.json();
    } catch (e) {
        clearTimeout(timeoutId);
        throw new Error(e.cause?.code === 'ABORT_ERR' ? 'timeout' : e.message);
    }
}

app.delete('/api/backup', async (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).json({ success: false, error: '请选择备份文件' });
    }
    try {
        const result = await httpDelete(MAIN_SERVER_URL + '/api/monitor/backup', { filename }, 5000);
        addLog(`删除备份: ${filename}`, 'info');
        res.json(result);
    } catch (err) {
        addLog(`删除备份失败: ${err.message}`, 'error');
        res.status(500).json({ success: false, error: err.message });
    }
});

function startAutoBackup() {
    setInterval(async () => {
        const now = new Date();
        if (now.getHours() === 22 && now.getMinutes() === 0) {
            addLog('开始自动备份数据库...', 'info');
            try {
                const result = await httpPost(MAIN_SERVER_URL + '/api/monitor/backup', {}, 120000);
                if (result.success) {
                    addLog(`自动备份成功: ${result.filename}`, 'success');
                }
            } catch (err) {
                addLog(`自动备份失败: ${err.message}`, 'error');
            }
        }
    }, 60000);
    addLog('自动备份功能已启用（每天 22:00）', 'info');
}

io.on('connection', (socket) => {
    addLog(`客户端连接: ${socket.id.substring(0, 8)}`, 'info');
    if (lastSystemInfo) socket.emit('system_info', lastSystemInfo);
    socket.emit('logs_history', [...serverLogs]);
    socket.on('disconnect', () => {
        addLog(`客户端断开: ${socket.id.substring(0, 8)}`, 'info');
    });
});

async function startServer() {
    addLog('正在连接主服务器...', 'info');
    addLog(`主服务器地址: ${MAIN_SERVER_URL}`, 'info');

    try {
        await fetchDbStatus();
        addLog(`数据库状态: ${mainDbConnected ? '已连接' : '未连接'}`, mainDbConnected ? 'success' : 'warning');
    } catch (err) {
        addLog(`连接主服务器失败: ${err.message}`, 'error');
    }

    await pollAllData();

    setInterval(pollAllData, POLL_INTERVAL);
    startAutoBackup();

    server.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('=========================================');
        console.log('  远程监控面板已启动');
        console.log('  目标服务器: ' + MAIN_SERVER_URL);
        console.log('  本地访问: http://127.0.0.1:' + PORT);
        console.log('  局域网访问: http://' + LOCAL_IP + ':' + PORT);
        console.log('=========================================');
        addLog('监控面板已启动', 'success');
    });
}

startServer();