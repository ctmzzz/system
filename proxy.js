const http = require('http');
const httpProxy = require('http-proxy');
const { exec } = require('child_process');
const os = require('os');

// 检查并清理占用指定端口的进程
async function killProcessOnPort(port) {
    return new Promise((resolve) => {
        if (os.platform() === 'win32') {
            // Windows: 使用 netstat 查找并 taskkill 结束进程
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
                        setTimeout(resolve, 1000); // 稍等一下让进程完全退出
                        return;
                    }
                }
                resolve();
            });
        } else {
            // Linux/Mac: 使用 lsof 查找并 kill 进程
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

// 获取本机IP
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

// 创建代理服务器
const proxy = httpProxy.createProxyServer({
    target: 'http://127.0.0.1:3001',
    ws: true, // 支持WebSocket
    xfwd: true
});

// 代理错误处理
proxy.on('error', (err, req, res) => {
    console.error('代理错误:', err);
    if (!res.headersSent) {
        res.writeHead(500);
        res.end('代理服务器错误');
    }
});

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

// 处理WebSocket升级
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

// 启动服务器
async function startServer() {
    // 先清理80端口
    await killProcessOnPort(80);
    
    // 尝试80端口
    server.listen(80, '0.0.0.0', () => {
        console.log('');
        console.log('=========================================');
        console.log('  反向代理服务器已启动');
        console.log('  本地访问: http://127.0.0.1');
        console.log('  局域网访问: http://' + LOCAL_IP);
        console.log('  (自动代理到 3001 端口)');
        console.log('=========================================');
    });
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        console.log('\n[提示] 80端口不可用，尝试8080端口...');
        server.listen(8080, '0.0.0.0', () => {
            console.log('');
            console.log('=========================================');
            console.log('  反向代理服务器已启动');
            console.log('  本地访问: http://127.0.0.1:8080');
            console.log('  局域网访问: http://' + LOCAL_IP + ':8080');
            console.log('  (自动代理到 3001 端口)');
            console.log('=========================================');
        });
    }
});

// 启动
startServer();

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n反向代理服务器已关闭');
    process.exit();
});
