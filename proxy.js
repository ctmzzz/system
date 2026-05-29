require('dotenv').config();
process.noDeprecation = true;
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const { exec, execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true';
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT, 10) || 443;
const HTTP_PORT = 80;
const CERT_DIR = process.env.CERT_DIR || './certs';

async function killProcessOnPort(port) {
    return new Promise((resolve) => {
        if (os.platform() === 'win32') {
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                if (stdout) {
                    const lines = stdout.trim().split('\n');
                    const pids = new Set();
                    lines.forEach(line => {
                        const match = line.trim().match(/\s+(\d+)\s*$/);
                        if (match) pids.add(match[1]);
                    });
                    if (pids.size > 0) {
                        console.log(`[清理] 发现端口 ${port} 被占用，正在清理...`);
                        pids.forEach(pid => {
                            exec(`taskkill /F /PID ${pid}`, (killErr) => {
                                if (!killErr) console.log(`[清理] 已结束进程 PID: ${pid}`);
                            });
                        });
                        setTimeout(resolve, 1000);
                        return;
                    }
                }
                resolve();
            });
        } else {
            exec(`lsof -ti:${port}`, (error, stdout) => {
                if (stdout) {
                    const pids = stdout.trim().split('\n');
                    if (pids.length > 0) {
                        console.log(`[清理] 发现端口 ${port} 被占用，正在清理...`);
                        pids.forEach(pid => {
                            exec(`kill -9 ${pid}`, (killErr) => {
                                if (!killErr) console.log(`[清理] 已结束进程 PID: ${pid}`);
                            });
                        });
                        setTimeout(resolve, 1000);
                        return;
                    }
                }
                resolve();
            });
        }
    });
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

function loadCert() {
    const keyPath = path.join(CERT_DIR, 'server.key');
    const certPath = path.join(CERT_DIR, 'server.crt');

    if (!fs.existsSync(CERT_DIR)) {
        console.warn('[HTTPS] certs 目录不存在，尝试生成自签名证书...');
        fs.mkdirSync(CERT_DIR, { recursive: true });
    }

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        console.log('[HTTPS] 使用已有证书: certs/server.crt (' + (fs.statSync(certPath).size / 1024).toFixed(1) + 'KB)');
        return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
    }

    console.warn('[HTTPS] 未找到证书文件，正在生成自签名证书...');
    try {
        if (os.platform() === 'win32') {
            const opensslCmd = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 3650 -nodes -subj "/C=CN/ST=Beijing/L=Beijing/O=School/OU=IT/CN=${LOCAL_IP}"`;
            execSync(opensslCmd, { stdio: 'pipe' });
        } else {
            execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 3650 -nodes -subj "/C=CN/ST=Beijing/L=Beijing/O=School/OU=IT/CN=${LOCAL_IP}"`, { stdio: 'pipe' });
        }
        console.log('[HTTPS] 自签名证书生成成功（浏览器会提示不安全，仅开发环境使用）');
        return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
    } catch (err) {
        console.warn('[HTTPS] 证书生成失败，将以 HTTP 模式运行:', err.message);
        return null;
    }
}

function getIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

const proxyAgent = new http.Agent({ keepAlive: true, maxSockets: 50, keepAliveMsecs: 30000 });

const proxy = httpProxy.createProxyServer({
    target: 'http://127.0.0.1:3001',
    ws: true,
    xfwd: true,
    agent: proxyAgent
});

// ========== DDoS/CC 防护：连接数限流 ==========
const MAX_CONNS_PER_IP = 50;
const MAX_REQ_PER_IP_PER_SEC = 30;
const ipConnections = new Map();
const ipRequestCounts = new Map();
const ipBlockedUntil = new Map();

function cleanupConnections() {
    const now = Date.now();
    for (const [ip, count] of ipConnections) {
        if (count <= 0) ipConnections.delete(ip);
    }
    for (const [ip, data] of ipRequestCounts) {
        if (now - data.resetAt > 1000) ipRequestCounts.delete(ip);
    }
    for (const [ip, blockUntil] of ipBlockedUntil) {
        if (now > blockUntil) ipBlockedUntil.delete(ip);
    }
}

function blockIP(ip, reason) {
    ipBlockedUntil.set(ip, Date.now() + 60000);
    console.warn(`[DDoS防护] IP ${ip} 被临时封禁60秒，原因: ${reason}`);
}

// 每10秒清理
setInterval(cleanupConnections, 10000);

function createRequestHandler(serverType) {
    return (req, res) => {
        const ip = getIP(req);
        
        // 检查是否被封禁
        const blockUntil = ipBlockedUntil.get(ip);
        if (blockUntil && Date.now() < blockUntil) {
            res.writeHead(429, { 'Retry-After': '60' });
            res.end('Too Many Requests');
            return;
        }
        
        // 请求频率检查
        const now = Date.now();
        let reqData = ipRequestCounts.get(ip);
        if (!reqData || now - reqData.resetAt > 1000) {
            reqData = { count: 0, resetAt: now };
        }
        reqData.count++;
        ipRequestCounts.set(ip, reqData);
        
        if (reqData.count > MAX_REQ_PER_IP_PER_SEC) {
            blockIP(ip, `请求频率过高(${reqData.count}次/秒)`);
            res.writeHead(429, { 'Retry-After': '60' });
            res.end('Rate Limited');
            return;
        }
        
        if (serverType === 'http' && ENABLE_HTTPS) {
            const host = req.headers.host || '';
            const hostname = host.split(':')[0];
            res.writeHead(301, { Location: `https://${hostname}:${HTTPS_PORT}${req.url}` });
            res.end();
            return;
        }
        
        proxy.web(req, res);
    };
}

// 连接数限制
function trackConnection(socket, ip) {
    const count = (ipConnections.get(ip) || 0) + 1;
    ipConnections.set(ip, count);
    
    if (count > MAX_CONNS_PER_IP) {
        blockIP(ip, `连接数过多(${count}个)`);
        socket.destroy();
        return false;
    }
    
    socket.on('close', () => {
        const current = ipConnections.get(ip);
        if (current > 0) ipConnections.set(ip, current - 1);
    });
    
    return true;
}

// 爬虫UA黑名单（代理层）
const BOT_UA_PATTERNS = [
    'AhrefsBot', 'MJ12bot', 'SemrushBot', 'DotBot', 'Bytespider',
    'PetalBot', 'BLEXBot', 'ClaudeBot', 'GPTBot', 'CCBot',
    'zgrab', 'ZGrab', 'masscan', 'nmap', 'Nikto', 'sqlmap'
];

proxy.on('proxyRes', (proxyRes, req, res) => {
    if (proxyRes.headers['transfer-encoding'] && proxyRes.headers['content-length']) {
        delete proxyRes.headers['content-length'];
    }
});

proxy.on('error', (err, req, res) => {
    console.error('代理错误:', err.message);
    if (res && typeof res.writeHead === 'function' && !res.headersSent) {
        res.writeHead(502);
        res.end('代理服务器错误');
    }
});

function createHttpServer() {
    const server = http.createServer(createRequestHandler('http'));

    server.on('upgrade', (req, socket, head) => {
        proxy.ws(req, socket, head);
    });
    
    server.on('connection', (socket) => {
        const ip = socket.remoteAddress || 'unknown';
        trackConnection(socket, ip);
    });

    return server;
}

function createHttpsServer() {
    const cert = loadCert();
    if (!cert) return null;

    const server = https.createServer(cert, createRequestHandler('https'));

    server.on('upgrade', (req, socket, head) => {
        proxy.ws(req, socket, head);
    });
    
    server.on('connection', (socket) => {
        const ip = socket.remoteAddress || 'unknown';
        trackConnection(socket, ip);
    });

    return server;
}

async function startServer() {
    await killProcessOnPort(HTTP_PORT);

    if (ENABLE_HTTPS) {
        await killProcessOnPort(HTTPS_PORT);
        const httpsServer = createHttpsServer();
        if (httpsServer) {
            httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
                console.log('');
                console.log('=========================================');
                console.log('  反向代理服务器已启动 (HTTPS)');
                console.log('  证书域名: *.shems.edu.cn');
                console.log('  本地访问: https://127.0.0.1:' + HTTPS_PORT);
                console.log('  局域网访问: https://' + LOCAL_IP + ':' + HTTPS_PORT);
                console.log('  连接限制: ' + MAX_CONNS_PER_IP + '/IP | 请求: ' + MAX_REQ_PER_IP_PER_SEC + '/秒');
                console.log('=========================================');
            });
        } else {
            console.log('[HTTPS] 证书生成失败，退回 HTTP 模式');
        }
    }

    const httpServer = createHttpServer();
    httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
        console.log('');
        console.log('=========================================');
        console.log('  反向代理服务器已启动 (HTTP)');
        console.log('  本地访问: http://127.0.0.1');
        console.log('  局域网访问: http://' + LOCAL_IP);
        if (ENABLE_HTTPS) {
            console.log('  HTTP 请求会自动重定向到 HTTPS');
        }
        console.log('  连接限制: ' + MAX_CONNS_PER_IP + '/IP | 请求: ' + MAX_REQ_PER_IP_PER_SEC + '/秒');
        console.log('  (自动代理到 3001 端口)');
        console.log('=========================================');
    });

    httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
            console.log('\n[提示] 80端口不可用，尝试8080端口...');
            let fallbackServer = http.createServer(createRequestHandler('http'));
            fallbackServer.on('upgrade', (req, socket, head) => {
                proxy.ws(req, socket, head);
            });
            fallbackServer.on('connection', (socket) => {
                const ip = socket.remoteAddress || 'unknown';
                trackConnection(socket, ip);
            });
            fallbackServer.listen(8080, '0.0.0.0', () => {
                console.log('');
                console.log('=========================================');
                console.log('  反向代理服务器已启动 (HTTP)');
                console.log('  本地访问: http://127.0.0.1:8080');
                console.log('  局域网访问: http://' + LOCAL_IP + ':8080');
                console.log('  连接限制: ' + MAX_CONNS_PER_IP + '/IP | 请求: ' + MAX_REQ_PER_IP_PER_SEC + '/秒');
                console.log('=========================================');
            });
        }
    });
}

startServer();

process.on('SIGINT', () => {
    console.log('\n反向代理服务器已关闭');
    process.exit();
});
