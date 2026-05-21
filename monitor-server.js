const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const si = require('systeminformation');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
const MAX_LOGS = 500;
const RESOURCE_INTERVAL = 5000;
const LOG_POLL_INTERVAL = 2000;

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

const DB_CONFIG = {
    host: process.env.DB_HOST || '192.168.3.6',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'score_analysis',
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
    const log = {
        id: Date.now() + Math.random(),
        time: new Date().toISOString(),
        message,
        type: type || 'info',
        source: 'monitor'
    };
    serverLogs.push(log);
    if (serverLogs.length > MAX_LOGS) serverLogs.shift();
    io.emit('new_log', log);
}

async function getSystemInfo() {
    try {
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
            dbConnected,
            onlineUsers,
            abnormalAccountsCount,
            attackDetected
        };
    } catch (err) {
        return {
            timestamp: Date.now(),
            error: err.message,
            dbConnected,
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
    return {
        id: Date.now() + Math.random(),
        time: new Date().toISOString(),
        message: line,
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

function initLogWatchers() {
    function watchAllFiles() {
        LOG_FILES.forEach(fi => {
            try {
                if (fs.existsSync(fi.path)) {
                    const stats = fs.statSync(fi.path);
                    const oldPos = filePositions.get(fi.path);
                    if (oldPos === undefined) {
                        filePositions.set(fi.path, stats.size);
                        const content = fs.readFileSync(fi.path, 'utf8');
                        const lines = content.split(/\r?\n/).filter(l => l.trim()).slice(-80);
                        lines.forEach(l => {
                            const log = classifyLog(l, fi.source);
                            serverLogs.push(log);
                        });
                    }
                }
            } catch (e) {}
        });
        while (serverLogs.length > MAX_LOGS) serverLogs.shift();
    }

    watchAllFiles();

    if (LOG_FILES.length > 0) {
        setInterval(() => {
            LOG_FILES = discoverLogFiles();
            if (LOG_FILES.length === 0) return;
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
    initLogWatchers();
    startResourceCollection();
    startAbnormalCheck();
    startWorkerPoolMonitor();
    server.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('=========================================');
        console.log('  监控服务器已启动');
        console.log('  本地访问: http://127.0.0.1:' + PORT);
        console.log('  局域网访问: http://' + LOCAL_IP + ':' + PORT);
        console.log('=========================================');
        addLog('监控服务器已启动', 'success');
    });
}

startServer();
module.exports = { addLog, getSystemInfo };
