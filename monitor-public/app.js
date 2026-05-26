let socket = null;
let logWorker = null;
let autoScroll = true;
let currentFilter = 'all';
let allLogs = [];
let resourceChart = null;
let cpuHistory = [];
let memoryHistory = [];
let labels = [];
let rafId = null;
let pendingRenderLogs = [];
let isRenderScheduled = false;
let perfData = { fps: 60, longTasks: 0, jsHeapSize: 0, domNodes: 0 };

const LOG_ROW_HEIGHT = 22;
const VISIBLE_BUFFER = 5;
const MAX_DOM_LOGS = 200;

document.addEventListener('DOMContentLoaded', () => {
    initLogin();
    initFilterButtons();
    initAutoScrollBtn();
    initClearBtn();
    initLogoutBtn();
    initPerfMonitor();
});

function initPerfMonitor() {
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                perfData.longTasks = list.getEntries().length;
            });
            observer.observe({ type: 'longtask', buffered: true });
        } catch (e) {}
    }

    let lastTime = performance.now();
    let frames = 0;
    function measureFPS() {
        frames++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
            perfData.fps = Math.round(frames / ((now - lastTime) / 1000));
            frames = 0;
            lastTime = now;
            updatePerfDisplay();
        }
        requestAnimationFrame(measureFPS);
    }
    requestAnimationFrame(measureFPS);

    setInterval(() => {
        if (performance.memory) {
            perfData.jsHeapSize = Math.round(performance.memory.usedJSHeapSize / 1048576);
        }
        perfData.domNodes = document.querySelectorAll('.log-entry').length;
        updatePerfDisplay();
    }, 2000);
}

function updatePerfDisplay() {
    const el = document.getElementById('perfStats');
    if (!el) return;
    el.textContent = `FPS:${perfData.fps} | DOM:${perfData.domNodes} | Mem:${perfData.jsHeapSize}MB | LT:${perfData.longTasks}`;
}

function initLogin() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btn = form.querySelector('.login-btn');
        const txt = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.btn-loader');
        txt.style.display = 'none';
        loader.style.display = 'flex';
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                showMonitor();
            } else {
                const errEl = document.getElementById('loginError');
                errEl.textContent = data.message || '登录失败';
                setTimeout(() => errEl.textContent = '', 3000);
            }
        } catch (err) {
            const errEl = document.getElementById('loginError');
            errEl.textContent = '网络错误，请重试';
            setTimeout(() => errEl.textContent = '', 3000);
        } finally {
            txt.style.display = 'block';
            loader.style.display = 'none';
        }
    });
}

let backupRefreshInterval = null;

function showMonitor() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('monitorPage').style.display = 'flex';
    initLogWorker();
    initSocket();
    initChart();
    initServerControl();
    initBackupBtn();
    loadBackupList();
    
    // 每 30 秒刷新备份列表
    if (backupRefreshInterval) clearInterval(backupRefreshInterval);
    backupRefreshInterval = setInterval(loadBackupList, 30000);
}

// 加载备份列表
async function loadBackupList() {
    try {
        const res = await fetch('/api/backups');
        const data = await res.json();
        const listEl = document.getElementById('backupList');
        if (data.backups && data.backups.length > 0) {
            listEl.innerHTML = data.backups.map(b => `
                <div class="backup-item">
                    <div>
                        <div class="backup-item-name">${b.name}</div>
                        <div class="backup-item-date">${b.date} · ${b.size}</div>
                    </div>
                    <div class="backup-item-actions">
                        <button class="backup-action-btn" data-action="restore" data-file="${b.name}">恢复</button>
                        <button class="backup-action-btn danger" data-action="delete" data-file="${b.name}">删除</button>
                    </div>
                </div>
            `).join('');
            
            // 绑定按钮事件
            listEl.querySelectorAll('.backup-action-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const action = e.target.dataset.action;
                    const file = e.target.dataset.file;
                    
                    if (action === 'restore') {
                        if (confirm(`确定要恢复备份: ${file} 吗？\n这将覆盖当前数据库！`)) {
                            try {
                                const res = await fetch('/api/restore', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ filename: file })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    alert('数据库恢复成功！');
                                    await loadBackupList();
                                } else {
                                    alert('恢复失败: ' + (data.error || '未知错误'));
                                }
                            } catch (err) {
                                alert('请求失败: ' + err.message);
                            }
                        }
                    } else if (action === 'delete') {
                        if (confirm(`确定要删除备份: ${file} 吗？`)) {
                            try {
                                const res = await fetch('/api/backup', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ filename: file })
                                });
                                await loadBackupList();
                            } catch (err) {
                                alert('删除失败: ' + err.message);
                            }
                        }
                    }
                });
            });
        } else {
            listEl.innerHTML = '<div style="color:#64748b;font-size:12px;padding:10px;">暂无备份</div>';
        }
    } catch (err) {
        console.error('加载备份列表失败:', err);
    }
}

function initLogoutBtn() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (socket) socket.disconnect();
        if (logWorker) logWorker.terminate();
        document.getElementById('monitorPage').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
        allLogs = [];
        cpuHistory = [];
        memoryHistory = [];
        labels = [];
        pendingRenderLogs = [];
        document.getElementById('logsContainer').innerHTML = '';
    });
}

// 手动备份按钮
function initBackupBtn() {
    const btn = document.getElementById('manualBackupBtn');
    if (btn) {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = '备份中...';
            try {
                const res = await fetch('/api/backup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                if (data.success) {
                    alert('备份成功！');
                    await loadBackupList();
                } else {
                    alert('备份失败: ' + (data.error || '未知错误'));
                }
            } catch (err) {
                alert('请求失败: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = '手动备份';
            }
        });
    }
}

function initLogWorker() {
    logWorker = new Worker('worker.js');
    logWorker.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === 'log_batch') {
            data.forEach(log => {
                allLogs.push(log);
                if (allLogs.length > 1000) allLogs.shift();
                if (currentFilter === 'all' || log.type === currentFilter) {
                    pendingRenderLogs.push(log);
                }
            });
            scheduleRender();
        } else if (type === 'logs_history') {
            allLogs = data;
            renderAllLogs();
        } else if (type === 'filtered_logs') {
            allLogs = data;
            renderAllLogs();
        }
    };
}

function initSocket() {
    const statusEl = document.getElementById('connectionStatus');
    const statusText = statusEl.querySelector('.status-text');

    socket = io({ reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000 });

    socket.on('connect', () => {
        statusEl.className = 'connection-status connected';
        statusText.textContent = '已连接';
    });
    socket.on('disconnect', () => {
        statusEl.className = 'connection-status disconnected';
        statusText.textContent = '已断开';
    });
    socket.on('reconnecting', () => {
        statusEl.className = 'connection-status connecting';
        statusText.textContent = '重连中';
    });
    socket.on('system_info', updateSystemInfo);
    socket.on('new_log', (log) => {
        if (logWorker) logWorker.postMessage({ type: 'new_log', data: log });
    });
    socket.on('logs_history', (logs) => {
        if (logWorker) logWorker.postMessage({ type: 'logs_history', data: logs });
    });
}

function updateSystemInfo(data) {
    if (data.cpu) {
        document.getElementById('cpuValue').textContent = data.cpu.usage + '%';
        document.getElementById('cpuProgress').style.width = data.cpu.usage + '%';
        document.getElementById('cpuCores').textContent = data.cpu.cores + ' 核心';
    }
    if (data.memory) {
        document.getElementById('memoryValue').textContent = data.memory.usage + '%';
        document.getElementById('memoryDetail').textContent = data.memory.used + 'GB / ' + data.memory.total + 'GB';
        document.getElementById('memoryProgress').style.width = data.memory.usage + '%';
    }
    if (data.disk) {
        document.getElementById('diskValue').textContent = data.disk.usage + '%';
        document.getElementById('diskDetail').textContent = data.disk.used + 'GB / ' + data.disk.total + 'GB';
        document.getElementById('diskProgress').style.width = data.disk.usage + '%';
    }
    if (data.network) {
        document.getElementById('networkDetail').textContent = '↓ ' + data.network.rx + ' KB/s | ↑ ' + data.network.tx + ' KB/s';
    }
    const dbStatus = document.getElementById('dbStatus');
    const dbDot = dbStatus.querySelector('.status-dot');
    dbDot.className = 'status-dot ' + (data.dbConnected ? 'online' : 'offline');
    dbStatus.lastChild.textContent = ' 数据库: ' + (data.dbConnected ? '已连接' : '未连接');

    if (data.dbHost) {
        document.getElementById('dbHost').textContent = 'MySQL ' + data.dbHost + ':' + (data.dbPort || 3306);
    }

    const onlineStatus = document.getElementById('onlineStatus');
    const onlineDot = onlineStatus.querySelector('.status-dot');
    onlineDot.className = 'status-dot online';
    onlineStatus.lastChild.textContent = ' 在线: ' + data.onlineUsers;

    document.getElementById('alertValue').textContent = data.abnormalAccountsCount;
    const alertCard = document.getElementById('alertCard');
    const attackStatus = document.getElementById('attackStatus');
    if (data.attackDetected || data.abnormalAccountsCount > 0) {
        attackStatus.textContent = '检测到异常';
        alertCard.classList.add('active');
    } else {
        attackStatus.textContent = '无异常';
        alertCard.classList.remove('active');
    }
    updateChart(data);
}

function initChart() {
    const ctx = document.getElementById('resourceChart').getContext('2d');
    resourceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'CPU',
                    data: [],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.08)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: '内存',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 200 },
            scales: {
                x: { display: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 10 } } },
                y: { display: true, min: 0, max: 100, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', callback: v => v + '%', font: { size: 10 } } }
            },
            plugins: { legend: { display: false } },
            interaction: { intersect: false, mode: 'index' }
        }
    });
}

function updateChart(data) {
    if (!resourceChart) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    labels.push(timeStr);
    cpuHistory.push(data.cpu ? data.cpu.usage : 0);
    memoryHistory.push(data.memory ? data.memory.usage : 0);
    if (labels.length > 60) { labels.shift(); cpuHistory.shift(); memoryHistory.shift(); }
    resourceChart.data.labels = labels;
    resourceChart.data.datasets[0].data = cpuHistory;
    resourceChart.data.datasets[1].data = memoryHistory;
    resourceChart.update('none');
}

function scheduleRender() {
    if (isRenderScheduled) return;
    isRenderScheduled = true;
    rafId = requestAnimationFrame(doRender);
}

function doRender() {
    const container = document.getElementById('logsContainer');
    if (!container) { isRenderScheduled = false; return; }

    const shouldScroll = autoScroll && isNearBottom(container);
    const fragment = document.createDocumentFragment();

    pendingRenderLogs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'log-entry ' + log.type;
        entry.textContent = log.message;
        fragment.appendChild(entry);
    });
    pendingRenderLogs = [];

    container.appendChild(fragment);

    while (container.children.length > MAX_DOM_LOGS) {
        container.removeChild(container.firstChild);
    }

    if (shouldScroll) {
        container.scrollTop = container.scrollHeight;
    }

    isRenderScheduled = false;
}

function renderAllLogs() {
    const container = document.getElementById('logsContainer');
    container.innerHTML = '';
    const filtered = currentFilter === 'all' ? allLogs : allLogs.filter(l => l.type === currentFilter);
    const fragment = document.createDocumentFragment();
    filtered.slice(-MAX_DOM_LOGS).forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'log-entry ' + log.type;
        entry.textContent = log.message;
        fragment.appendChild(entry);
    });
    container.appendChild(fragment);
    if (autoScroll) container.scrollTop = container.scrollHeight;
}

function isNearBottom(container) {
    return container.scrollHeight - container.scrollTop - container.clientHeight < 80;
}

function initFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderAllLogs();
        });
    });
}

function initServerControl() {
    const statusEl = document.getElementById('serverStatus');
    const toggleBtn = document.getElementById('serverToggleBtn');
    
    async function updateServerStatus() {
        try {
            const res = await fetch('/api/server-status');
            const data = await res.json();
            
            // 更新主服务器状态
            if (data.running) {
                statusEl.innerHTML = '<span class="status-dot online"></span> 状态: 运行中';
                toggleBtn.textContent = '停止';
                toggleBtn.classList.add('stop');
            } else {
                statusEl.innerHTML = '<span class="status-dot offline"></span> 状态: 已停止';
                toggleBtn.textContent = '启动';
                toggleBtn.classList.remove('stop');
            }
        } catch (e) {
            statusEl.innerHTML = '<span class="status-dot offline"></span> 状态: 检测失败';
        }
    }

    updateServerStatus();
    setInterval(updateServerStatus, 3000);

    toggleBtn.addEventListener('click', async () => {
        try {
            const statusRes = await fetch('/api/server-status');
            const statusData = await statusRes.json();
            
            if (statusData.running) {
                await fetch('/api/server-stop', { method: 'POST' });
            } else {
                await fetch('/api/server-start', { method: 'POST' });
            }
            
            setTimeout(updateServerStatus, 500);
        } catch (e) {}
    });
}

function initAutoScrollBtn() {
    const btn = document.getElementById('autoScrollBtn');
    const container = document.getElementById('logsContainer');
    btn.addEventListener('click', () => {
        autoScroll = !autoScroll;
        btn.classList.toggle('active', autoScroll);
        if (autoScroll) container.scrollTop = container.scrollHeight;
    });
    container.addEventListener('scroll', () => {
        if (isNearBottom(container) && !autoScroll) {
            autoScroll = true;
            btn.classList.add('active');
        } else if (!isNearBottom(container) && autoScroll) {
            autoScroll = false;
            btn.classList.remove('active');
        }
    });
}

function initClearBtn() {
    document.getElementById('clearLogsBtn').addEventListener('click', () => {
        allLogs = [];
        pendingRenderLogs = [];
        document.getElementById('logsContainer').innerHTML = '';
    });
}