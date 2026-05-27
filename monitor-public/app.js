let socket = null;
let logWorker = null;
let computeWorker = null;
let autoScroll = true;
let currentFilter = 'all';
let allLogs = [];
let chartData = { cpu: [], memory: [], labels: [] };
let rafId = null;
let pendingRenderLogs = [];
let isRenderScheduled = false;
let perfData = { fps: 60, longTasks: 0, jsHeapSize: 0, domNodes: 0 };
let chartCtx = null;
let chartCanvas = null;
let chartFrameCount = 0;
let chartDirty = false;

const LOG_ROW_HEIGHT = 22;
const VISIBLE_BUFFER = 5;
const MAX_DOM_LOGS = 200;
const CHART_RENDER_SKIP = 3;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('monitorPage').style.display = 'none';
    checkAccess();
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

let currentAccessType = null;
let currentRequestId = null;
let accessPollInterval = null;
let pendingLoginCreds = null;

async function checkAccess() {
    try {
        const res = await fetch('/api/check-ip');
        const data = await res.json();
        currentAccessType = data.type;
        const hint = document.getElementById('loginHint');
        if (data.type === 'local') {
            hint.textContent = '服务器本机';
        } else if (data.type === 'certified') {
            hint.textContent = '已认证设备';
        } else if (data.type === 'approved') {
            hint.textContent = '已获得临时访问权限';
        } else {
            hint.textContent = '服务器监控';
        }

        const wasAuth = sessionStorage.getItem('monitor_auth') === '1';
        if (wasAuth && (data.type === 'local' || data.type === 'certified' || data.type === 'approved')) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('monitorPage').style.display = 'flex';
            showMonitor();
            return;
        }

        if (wasAuth && data.type !== 'local' && data.type !== 'certified' && data.type !== 'approved') {
            sessionStorage.removeItem('monitor_auth');
        }

        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('monitorPage').style.display = 'none';
        initLogin();
    } catch (err) {
        currentAccessType = null;
        sessionStorage.removeItem('monitor_auth');
        document.getElementById('loginHint').textContent = '服务器监控';
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('monitorPage').style.display = 'none';
        initLogin();
    }
}

function showRequestPopup(username, password) {
    stopPollingAccessStatus();
    currentRequestId = null;
    pendingLoginCreds = { username, password };
    const popup = document.getElementById('requestPopup');
    const countdownEl = document.getElementById('popupCountdown');
    const expiresEl = document.getElementById('popupExpires');
    const btn = document.querySelector('.login-btn');
    const txt = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    txt.style.display = 'block';
    loader.style.display = 'none';
    popup.style.display = 'flex';
    let remaining = 600;
    const updateCountdown = () => {
        if (remaining <= 0) {
            countdownEl.textContent = '已过期';
            countdownEl.style.color = 'var(--error)';
            closeRequestPopup();
            document.getElementById('loginError').textContent = '请求已超时（600秒），请重新提交';
            setTimeout(() => document.getElementById('loginError').textContent = '', 3000);
            return;
        }
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        countdownEl.textContent = m + '分' + s + '秒';
        remaining--;
    };
    updateCountdown();
    const countdownTimer = setInterval(updateCountdown, 1000);

    const checkInterval = setInterval(async () => {
        if (!currentRequestId) return;
        try {
            const res = await fetch('/api/request-status/' + currentRequestId);
            const data = await res.json();
            if (data.status === 'approved') {
                currentAccessType = 'approved';
                clearInterval(countdownTimer);
                clearInterval(checkInterval);
                popup.style.display = 'none';
                await performLogin(username, password);
            } else if (data.status === 'rejected') {
                clearInterval(countdownTimer);
                clearInterval(checkInterval);
                popup.style.display = 'none';
                document.getElementById('loginError').textContent = '访问申请已被拒绝';
                setTimeout(() => document.getElementById('loginError').textContent = '', 3000);
                currentRequestId = null;
                pendingLoginCreds = null;
            } else if (data.status === 'expired' || data.status === 'cancelled') {
                clearInterval(countdownTimer);
                clearInterval(checkInterval);
                popup.style.display = 'none';
                if (data.status === 'expired') {
                    document.getElementById('loginError').textContent = '请求已超时（600秒），请重新提交';
                }
                setTimeout(() => document.getElementById('loginError').textContent = '', 3000);
                currentRequestId = null;
                pendingLoginCreds = null;
            }
        } catch (e) {}
    }, 2000);

    const doCancel = async () => {
        if (currentRequestId) {
            try {
                await fetch('/api/cancel-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestId: currentRequestId })
                });
            } catch (e) {}
        }
        clearInterval(countdownTimer);
        clearInterval(checkInterval);
        popup.style.display = 'none';
        currentRequestId = null;
        pendingLoginCreds = null;
    };

    document.getElementById('popupCancelBtn').onclick = doCancel;
    document.getElementById('popupCloseBtn').onclick = doCancel;

    fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            userAgent: navigator.userAgent.substring(0, 100)
        })
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if (data.status === 'certified') {
                clearInterval(countdownTimer);
                clearInterval(checkInterval);
                popup.style.display = 'none';
                performLogin(username, password);
            } else {
                currentRequestId = data.requestId;
                const expiresAt = Date.now() + 600 * 1000;
                const d = new Date(expiresAt);
                expiresEl.textContent = '过期时间: ' + d.toLocaleTimeString('zh-CN');
            }
        } else {
            clearInterval(countdownTimer);
            clearInterval(checkInterval);
            popup.style.display = 'none';
            document.getElementById('loginError').textContent = data.message || '申请失败';
            setTimeout(() => document.getElementById('loginError').textContent = '', 3000);
        }
    }).catch(err => {
        clearInterval(countdownTimer);
        clearInterval(checkInterval);
        popup.style.display = 'none';
        document.getElementById('loginError').textContent = '网络错误，请重试';
        setTimeout(() => document.getElementById('loginError').textContent = '', 3000);
    });
}

function closeRequestPopup() {
    document.getElementById('requestPopup').style.display = 'none';
    currentRequestId = null;
    pendingLoginCreds = null;
}

function stopPollingAccessStatus() {
    if (accessPollInterval) {
        clearInterval(accessPollInterval);
        accessPollInterval = null;
    }
}

function performLogin(username, password) {
    return fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(res => res.json()).then(data => {
        if (data.success) {
            showMonitor();
            pendingLoginCreds = null;
            currentRequestId = null;
        } else {
            const errEl = document.getElementById('loginError');
            errEl.textContent = data.message || '登录失败';
            setTimeout(() => errEl.textContent = '', 3000);
            pendingLoginCreds = null;
            currentRequestId = null;
        }
    }).catch(err => {
        const errEl = document.getElementById('loginError');
        errEl.textContent = '网络错误，请重试';
        setTimeout(() => errEl.textContent = '', 3000);
        pendingLoginCreds = null;
        currentRequestId = null;
    });
}

let loginSubmitHandler = null;

function initLogin() {
    const form = document.getElementById('loginForm');
    form.style.display = 'flex';
    if (loginSubmitHandler) {
        form.removeEventListener('submit', loginSubmitHandler);
    }
    loginSubmitHandler = async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (!username || !password) return;
        const btn = form.querySelector('.login-btn');
        const txt = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.btn-loader');
        const errEl = document.getElementById('loginError');
        errEl.textContent = '';

        if (currentAccessType === 'local' || currentAccessType === 'certified' || currentAccessType === 'approved') {
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
                    errEl.textContent = data.message || '登录失败';
                    setTimeout(() => errEl.textContent = '', 3000);
                }
            } catch (err) {
                errEl.textContent = '网络错误，请重试';
                setTimeout(() => errEl.textContent = '', 3000);
            } finally {
                txt.style.display = 'block';
                loader.style.display = 'none';
            }
        } else {
            txt.style.display = 'none';
            loader.style.display = 'flex';
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (data.cred_ok) {
                    txt.style.display = 'block';
                    loader.style.display = 'none';
                    showRequestPopup(username, password);
                    return;
                }
                if (data.success) {
                    showRequestPopup(username, password);
                    return;
                }
                errEl.textContent = data.message || '登录失败';
                setTimeout(() => errEl.textContent = '', 3000);
            } catch (err) {
                errEl.textContent = '网络错误，请重试';
                setTimeout(() => errEl.textContent = '', 3000);
            } finally {
                txt.style.display = 'block';
                loader.style.display = 'none';
            }
        }
    };
    form.addEventListener('submit', loginSubmitHandler);
}

let backupRefreshInterval = null;

function showMonitor() {
    sessionStorage.setItem('monitor_auth', '1');
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('monitorPage').style.display = 'flex';
    initLogWorker();
    initComputeWorker();
    initSocket();
    initChart();
    initServerControl();
    initBackupBtn();
    loadBackupList();
    initIpManagement();
    if (currentAccessType === 'local') {
        document.getElementById('deviceCard').style.display = '';
        initDeviceManagement();
        document.getElementById('onlineMonitorCard').style.display = '';
        initOnlineMonitorManagement();
    } else {
        document.getElementById('deviceCard').style.display = 'none';
        document.getElementById('onlineMonitorCard').style.display = 'none';
    }
    chartRenderLoop();
    
    if (backupRefreshInterval) clearInterval(backupRefreshInterval);
    backupRefreshInterval = setInterval(loadBackupList, 30000);
}

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
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try { await fetch('/api/revoke-temp', { method: 'POST' }); } catch (e) {}
        sessionStorage.removeItem('monitor_auth');
        currentAccessType = null;
        if (socket) socket.disconnect();
        if (logWorker) logWorker.terminate();
        if (computeWorker) { computeWorker.postMessage({ type: 'reset' }); computeWorker.terminate(); computeWorker = null; }
        stopPollingAccessStatus();
        currentRequestId = null;
        pendingLoginCreds = null;
        document.getElementById('requestPopup').style.display = 'none';
        document.getElementById('monitorPage').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('loginError').textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        allLogs = [];
        chartData = { cpu: [], memory: [], labels: [] };
        pendingRenderLogs = [];
        document.getElementById('logsContainer').innerHTML = '';
        checkAccess();
    });
}

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
    socket.on('locked_ips', (ips) => {
        updateIpList(ips);
    });
    socket.on('new_access_request', (request) => {
        addAccessRequestNotification(request);
    });
    socket.on('access_request_approved', (data) => {
        removeAccessRequestNotification(data.requestId);
    });
    socket.on('access_request_rejected', (data) => {
        removeAccessRequestNotification(data.requestId);
    });
    socket.on('access_request_cancelled', (data) => {
        removeAccessRequestNotification(data.requestId);
    });
    socket.on('access_request_expired', (data) => {
        removeAccessRequestNotification(data.requestId);
    });
    socket.on('device_removed', (data) => {
        refreshDeviceList();
    });
    socket.on('monitor_online_devices_updated', (devices) => {
        if (currentAccessType === 'local') {
            updateOnlineMonitorList(devices || []);
        }
    });
    socket.on('kicked', () => {
        // 设备被踢出后，直接返回登录页面，不显示 alert
        sessionStorage.removeItem('monitor_auth');
        // 关闭 monitor 页面，显示登录页面
        if (socket) socket.disconnect();
        if (logWorker) logWorker.terminate();
        if (computeWorker) { computeWorker.postMessage({ type: 'reset' }); computeWorker.terminate(); computeWorker = null; }
        stopPollingAccessStatus();
        currentRequestId = null;
        pendingLoginCreds = null;
        document.getElementById('requestPopup').style.display = 'none';
        document.getElementById('monitorPage').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('loginError').textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        allLogs = [];
        chartData = { cpu: [], memory: [], labels: [] };
        pendingRenderLogs = [];
        document.getElementById('logsContainer').innerHTML = '';
        // 重新检查访问状态
        checkAccess();
    });
}

function updateIpList(ips) {
    const countEl = document.getElementById('ipCount');
    const listEl = document.getElementById('ipList');
    const cardEl = document.getElementById('ipCard');
    const alertCountEl = document.getElementById('alertValue');
    const arr = ips || [];
    countEl.textContent = arr.length;
    alertCountEl.textContent = arr.length;
    if (arr.length > 0) {
        cardEl.classList.add('active');
    } else {
        cardEl.classList.remove('active');
    }
    if (arr.length > 0) {
        listEl.innerHTML = arr.map(ip => `
            <div class="ip-item">
                <div class="ip-item-info">
                    <div class="ip-address">${ip.ip}</div>
                    <div class="ip-details">
                        原因: ${ip.reason || '未知'} | 
                        失败: ${ip.captchaFails || 0}次 | 
                        时间: ${new Date(ip.lockTime).toLocaleString()}
                    </div>
                </div>
                <button class="ip-unlock-btn" data-ip="${ip.ip}">解锁</button>
            </div>
        `).join('');
        listEl.querySelectorAll('.ip-unlock-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const ip = e.target.dataset.ip;
                if (confirm(`确定要解锁IP: ${ip} 吗？`)) {
                    await unlockIp(ip);
                }
            });
        });
    } else {
        listEl.innerHTML = '';
    }
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

function initComputeWorker() {
    if (computeWorker) { computeWorker.terminate(); }
    computeWorker = new Worker('computeWorker.js');
    computeWorker.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === 'chart_data') {
            chartData = data;
            chartDirty = true;
        }
    };
}

function initChart() {
    chartCanvas = document.getElementById('resourceChart');
    if (!chartCanvas) return;
    chartCtx = chartCanvas.getContext('2d');
    resizeChart();
    window.addEventListener('resize', resizeChart);
}

function resizeChart() {
    if (!chartCanvas) return;
    const rect = chartCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    chartCanvas.width = rect.width * dpr;
    chartCanvas.height = rect.height * dpr;
    chartCanvas.style.width = rect.width + 'px';
    chartCanvas.style.height = rect.height + 'px';
    if (chartCtx) chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    chartDirty = true;
}

function drawChart() {
    if (!chartCtx || !chartCanvas) return;
    var w = chartCanvas.width / (window.devicePixelRatio || 1);
    var h = chartCanvas.height / (window.devicePixelRatio || 1);
    var ctx = chartCtx;

    ctx.clearRect(0, 0, w, h);

    var cpu = chartData.cpu;
    var memory = chartData.memory;
    var labels = chartData.labels;
    if (!cpu || cpu.length < 2) return;

    var margin = { top: 20, right: 30, bottom: 40, left: 55 };
    var plotW = w - margin.left - margin.right;
    var plotH = h - margin.top - margin.bottom;

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
    ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
        var y = margin.top + (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(w - margin.right, y);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText((100 - i * 25) + '%', margin.left - 10, y + 4);
    }

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, h - margin.bottom);
    ctx.moveTo(margin.left, h - margin.bottom);
    ctx.lineTo(w - margin.right, h - margin.bottom);
    ctx.stroke();

    var step = Math.max(1, Math.floor(labels.length / 6));
    for (var i = 0; i < labels.length; i += step) {
        var x = margin.left + (plotW / (cpu.length - 1)) * i;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x, h - 20);
    }

    function drawSmoothLine(data, color, glowColor) {
        if (!data || data.length < 2) return;
        
        var points = [];
        for (var i = 0; i < data.length; i++) {
            points.push({
                x: margin.left + (plotW / (data.length - 1)) * i,
                y: margin.top + plotH - (data[i] / 100) * plotH
            });
        }

        var gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + plotH);
        gradient.addColorStop(0, color + '30');
        gradient.addColorStop(0.5, color + '15');
        gradient.addColorStop(1, color + '05');

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var j = 1; j < points.length; j++) {
            var xc = (points[j].x + points[j - 1].x) / 2;
            var yc = (points[j].y + points[j - 1].y) / 2;
            ctx.quadraticCurveTo(points[j - 1].x, points[j - 1].y, xc, yc);
        }
        ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);

        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();

        ctx.lineTo(points[points.length - 1].x, h - margin.bottom);
        ctx.lineTo(points[0].x, h - margin.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        return points[points.length - 1];
    }

    var lastMem = drawSmoothLine(memory, '#10b981', '#10b98180');
    var lastCpu = drawSmoothLine(cpu, '#3b82f6', '#3b82f680');

    if (lastCpu) {
        ctx.save();
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(lastCpu.x, lastCpu.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastCpu.x, lastCpu.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
    }

    if (lastMem) {
        ctx.save();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(lastMem.x, lastMem.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastMem.x, lastMem.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
    }
}

function updateChart(data) {
    if (!data || !data.cpu || !data.memory) return;
    var now = new Date();
    var timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (computeWorker) {
        computeWorker.postMessage({
            type: 'add_point',
            data: { cpu: data.cpu.usage, memory: data.memory.usage, label: timeStr }
        });
    }
}

function chartRenderLoop() {
    chartFrameCount++;
    if (chartDirty && chartFrameCount % CHART_RENDER_SKIP === 0) {
        drawChart();
        chartDirty = false;
    }
    requestAnimationFrame(chartRenderLoop);
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
    document.getElementById('clearLogsBtn').addEventListener('click', async () => {
        try {
            await fetch('/api/logs/clear', { method: 'POST' });
        } catch (e) {}
        allLogs = [];
        pendingRenderLogs = [];
        document.getElementById('logsContainer').innerHTML = '';
    });
}

function initIpManagement() {
    const toggleBtn = document.getElementById('toggleIpList');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const container = document.getElementById('ipListContainer');
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                loadLockedIps();
            }
        });
    }
    
    loadLockedIps();
    
    setInterval(loadLockedIps, 5000);
}

async function loadLockedIps() {
    try {
        const res = await fetch('/api/locked-ips');
        const data = await res.json();
        if (data.success) {
            updateIpList(data.data || []);
        }
    } catch (err) {}
}

async function unlockIp(ip) {
    try {
        const res = await fetch('/api/unlock-ip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: ip })
        });
        const data = await res.json();
        
        if (data.success) {
            alert('IP解锁成功！');
            await loadLockedIps();
        } else {
            alert('解锁失败: ' + (data.message || '未知错误'));
        }
    } catch (err) {
        alert('请求失败: ' + err.message);
    }
}

function initDeviceManagement() {
    const toggleBtn = document.getElementById('toggleDeviceList');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const container = document.getElementById('deviceListContainer');
            const pendingContainer = document.getElementById('pendingListContainer');
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';
            pendingContainer.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                loadCertifiedDevices();
                loadPendingRequests();
            }
        });
    }
    
    loadCertifiedDevices();
    loadPendingRequests();
    startCountdownTicker();
    
    setInterval(loadCertifiedDevices, 30000);
}

let countdownTicker = null;
function startCountdownTicker() {
    if (countdownTicker) return;
    countdownTicker = setInterval(() => {
        const timers = document.querySelectorAll('.pending-countdown');
        if (timers.length === 0) return;
        timers.forEach(el => {
            const expiresAt = parseInt(el.getAttribute('data-expires'));
            if (!expiresAt) return;
            const remainSec = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            if (remainSec <= 0) {
                el.textContent = '已过期';
                el.style.color = 'var(--error)';
            } else {
                const m = Math.floor(remainSec / 60);
                const s = remainSec % 60;
                el.textContent = '剩余' + m + '分' + s + '秒';
                el.style.color = '';
            }
        });
    }, 1000);
}

async function loadCertifiedDevices() {
    try {
        const res = await fetch('/api/certified-devices');
        const data = await res.json();
        if (data.success) {
            updateDeviceList(data.devices || []);
        }
    } catch (err) {}
}

async function loadPendingRequests() {
    try {
        const res = await fetch('/api/pending-requests');
        const data = await res.json();
        if (data.success) {
            updatePendingList(data.requests || []);
        }
    } catch (err) {}
}

function updateDeviceList(devices) {
    const countEl = document.getElementById('deviceCount');
    const listEl = document.getElementById('deviceList');
    countEl.textContent = devices.length + ' 台已认证';
    if (devices.length > 0) {
        listEl.innerHTML = devices.map(d => {
            const addedTime = new Date(d.addedAt).toLocaleString('zh-CN');
            return '<div class="device-item">' +
                '<div><span class="device-item-ip">' + d.ip + '</span>' +
                '<span class="device-item-name">' + (d.name || '') + '</span></div>' +
                '<div><span class="device-item-time">' + addedTime + '</span>' +
                '<button class="device-remove-btn" onclick="removeDevice(\'' + d.ip + '\')">移除</button></div>' +
                '</div>';
        }).join('');
        document.getElementById('deviceListContainer').style.display = 'block';
    } else {
        listEl.innerHTML = '<div class="device-item" style="color:var(--text-muted)">暂无认证设备</div>';
    }
}

function updatePendingList(requests) {
    const listEl = document.getElementById('pendingList');
    const badgeEl = document.getElementById('pendingBadge');
    if (requests.length > 0) {
        badgeEl.style.display = 'inline-flex';
        badgeEl.textContent = requests.length;
        listEl.innerHTML = requests.map(r => {
            const reqTime = new Date(r.requestedAt).toLocaleString('zh-CN');
            return '<div class="pending-item" id="pending-' + r.id + '">' +
                '<div><span class="device-item-ip">' + r.ip + '</span>' +
                '<span class="device-item-name">用户: ' + (r.username || '未知') + '</span><br>' +
                '<span class="device-item-time">' + reqTime + ' | </span>' +
                '<span class="pending-countdown" data-expires="' + (r.expiresAt || 0) + '"></span></div>' +
                '<div class="pending-actions">' +
                '<button class="pending-approve-btn" onclick="approveAccess(\'' + r.id + '\',\'temporary\')">临时通过</button>' +
                '<button class="pending-approve-cert-btn" onclick="approveAccess(\'' + r.id + '\',\'certified\')">认证设备</button>' +
                '<button class="pending-reject-btn" onclick="rejectAccess(\'' + r.id + '\')">拒绝</button>' +
                '</div>' +
                '</div>';
        }).join('');
        document.getElementById('pendingListContainer').style.display = 'block';
    } else {
        badgeEl.style.display = 'none';
        listEl.innerHTML = '';
        document.getElementById('pendingListContainer').style.display = 'none';
    }
}

function addAccessRequestNotification(request) {
    const badgeEl = document.getElementById('pendingBadge');
    loadPendingRequests();
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('新的访问申请', { body: 'IP: ' + request.ip + '\n设备: ' + (request.userAgent || '未知') });
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function removeAccessRequestNotification(requestId) {
    const el = document.getElementById('pending-' + requestId);
    if (el) el.remove();
    loadPendingRequests();
}

async function approveAccess(requestId, type) {
    try {
        const res = await fetch('/api/approve-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, type })
        });
        const data = await res.json();
        if (data.success) {
            loadPendingRequests();
            loadCertifiedDevices();
        }
    } catch (err) {}
}

async function rejectAccess(requestId) {
    try {
        const res = await fetch('/api/reject-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId })
        });
        const data = await res.json();
        if (data.success) {
            loadPendingRequests();
        }
    } catch (err) {}
}

async function removeDevice(ip) {
    if (!confirm('确定要移除设备 ' + ip + ' 的认证吗？')) return;
    try {
        const res = await fetch('/api/remove-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
        });
        const data = await res.json();
        if (data.success) {
            loadCertifiedDevices();
        }
    } catch (err) {}
}

function refreshDeviceList() {
    loadCertifiedDevices();
}

function initOnlineMonitorManagement() {
    const toggleBtn = document.getElementById('toggleOnlineMonitorList');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const container = document.getElementById('onlineMonitorListContainer');
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                loadOnlineMonitorDevices();
            }
        });
    }
    
    loadOnlineMonitorDevices();
}

async function loadOnlineMonitorDevices() {
    try {
        const res = await fetch('/api/monitor-online-devices');
        const data = await res.json();
        if (data.success) {
            updateOnlineMonitorList(data.devices || []);
        }
    } catch (err) {}
}

function updateOnlineMonitorList(devices) {
    const countEl = document.getElementById('onlineMonitorCount');
    const countTextEl = document.getElementById('onlineMonitorCountText');
    const listEl = document.getElementById('onlineMonitorList');
    countEl.textContent = devices.length;
    countTextEl.textContent = devices.length + ' 台在线';
    
    if (devices.length > 0) {
        listEl.innerHTML = devices.map(d => {
            const connectedTime = new Date(d.connectedAt).toLocaleString('zh-CN');
            const duration = formatDuration(Date.now() - d.connectedAt);
            const isLocal = d.isLocal;
            return `<div class="device-item">
                <div>
                    <span class="device-item-ip">${d.ip}${isLocal ? ' (本地)' : ''}</span>
                    <span class="device-item-name">${d.userAgent || '未知设备'}</span><br>
                    <span class="device-item-time">连接: ${connectedTime} | 在线: ${duration}</span>
                </div>
                <div>
                    ${!isLocal ? `<button class="device-remove-btn" onclick="kickMonitorDevice('${d.ip}')">踢出</button>` : ''}
                </div>
            </div>`;
        }).join('');
    } else {
        listEl.innerHTML = '<div class="device-item" style="color:var(--text-muted)">暂无在线设备</div>';
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
        return `${minutes}分钟${seconds % 60}秒`;
    } else {
        return `${seconds}秒`;
    }
}

async function kickMonitorDevice(ip) {
    if (!confirm(`确定要踢出设备 ${ip} 吗？\n被踢出的设备需要重新申请访问授权。`)) return;
    
    try {
        const res = await fetch('/api/kick-monitor-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetIp: ip })
        });
        const data = await res.json();
        if (data.success) {
            alert('设备已踢出！');
            await loadOnlineMonitorDevices();
        } else {
            alert('踢出失败: ' + (data.message || '未知错误'));
        }
    } catch (err) {
        alert('请求失败: ' + err.message);
    }
}
