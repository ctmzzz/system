const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { initDatabase, database } = require('./database-mysql');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { createWebSocketServer, getSessionCount, broadcastToClass, kickUserSessions, kickSocketsForSession, CLASS_MAX_SESSIONS, TEACHER_MAX_SESSIONS } = require('./ws-server');
const workerPool = require('./worker-pool');

const INDICATOR_TREE = [
    { l0: '守礼明规', l1: '品德修养', l2: '政治态度', point: '参加党课学习班', score: '+10' },
    { l0: '守礼明规', l1: '品德修养', l2: '政治态度', point: '参加团课学习班', score: '+10' },
    { l0: '守礼明规', l1: '品德修养', l2: '政治态度', point: '有错误政治言论', score: '-5' },
    { l0: '守礼明规', l1: '品德修养', l2: '政治态度', point: '有错误政治行为', score: '-10' },
    { l0: '守礼明规', l1: '品德修养', l2: '道德品质', point: '拾金不昧', score: '+5' },
    { l0: '守礼明规', l1: '品德修养', l2: '道德品质', point: '见义勇为', score: '+5' },
    { l0: '守礼明规', l1: '品德修养', l2: '道德品质', point: '乐于助人', score: '+2' },
    { l0: '守礼明规', l1: '品德修养', l2: '道德品质', point: '考试作弊', score: '-20' },
    { l0: '守礼明规', l1: '品德修养', l2: '道德品质', point: '损坏公物', score: '-5' },
    { l0: '守礼明规', l1: '品德修养', l2: '道德品质', point: '欺骗行为', score: '-5' },
    { l0: '守礼明规', l1: '品德修养', l2: '道德品质', point: '偷窃行为', score: '-20' },
    { l0: '守礼明规', l1: '品德修养', l2: '遵纪守法', point: '得到社会表扬', score: '+15' },
    { l0: '守礼明规', l1: '品德修养', l2: '遵纪守法', point: '学期无违纪处分', score: '+15' },
    { l0: '守礼明规', l1: '品德修养', l2: '遵纪守法', point: '警告或严重警告', score: '-10' },
    { l0: '守礼明规', l1: '品德修养', l2: '遵纪守法', point: '记过或留校察看', score: '-20' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '仪容仪表', point: '无违规', score: '+10' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '仪容仪表', point: '受到表扬', score: '+5' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '仪容仪表', point: '仪容仪表扣分', score: '-5' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '文明礼貌', point: '尊敬师长，受到表扬', score: '+5' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '文明礼貌', point: '友爱同学，受到表扬', score: '+5' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '文明礼貌', point: '辱骂师生', score: '-5' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '文明礼貌', point: '讲脏话粗话', score: '-3' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '文明礼貌', point: '乱涂乱画、乱扔杂物', score: '-3' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '出勤情况', point: '全勤 每月:+10 学期:+20', score: '+10' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '出勤情况', point: '迟到早退', score: '-5' },
    { l0: '守礼明规', l1: '文明礼仪', l2: '出勤情况', point: '旷课', score: '-3' },
    { l0: '善学勤思', l1: '学业质量', l2: '课堂纪律', point: '认真听讲，受到教师表扬', score: '+5' },
    { l0: '善学勤思', l1: '学业质量', l2: '课堂纪律', point: '积极发言，受到教师表扬', score: '+5' },
    { l0: '善学勤思', l1: '学业质量', l2: '课堂纪律', point: '玩手机、玩游戏等', score: '-5' },
    { l0: '善学勤思', l1: '学业质量', l2: '课堂纪律', point: '睡觉、说话、吃东西等', score: '-5' },
    { l0: '善学勤思', l1: '学业质量', l2: '课堂纪律', point: '不遵守实训室规则', score: '-3' },
    { l0: '善学勤思', l1: '学业质量', l2: '课后作业', point: '作业好，受到教师表扬', score: '+5' },
    { l0: '善学勤思', l1: '学业质量', l2: '课后作业', point: '班级英语单词默写', score: '+3' },
    { l0: '善学勤思', l1: '学业质量', l2: '课后作业', point: '不交作业，或抄袭作业', score: '-5' },
    { l0: '善学勤思', l1: '学业质量', l2: '学习成绩', point: '期中考试与期末考试，进步明显。每进步5个名次，依次递加5分', score: '+5' },
    { l0: '善学勤思', l1: '班级表现', l2: '活动参与', point: '作为领读员每次加1分', score: '+1' },
    { l0: '善学勤思', l1: '班级表现', l2: '活动参与', point: '讲解分享学科重难点题目/知识点', score: '+2' },
    { l0: '善学勤思', l1: '班级表现', l2: '活动参与', point: '担任班会课主持人', score: '+5' },
    { l0: '善学勤思', l1: '班级表现', l2: '活动参与', point: '参与黑板报活动', score: '+5' },
    { l0: '善学勤思', l1: '班级表现', l2: '活动参与', point: '参与班级活动+5分', score: '+5' },
    { l0: '善学勤思', l1: '岗位职责', l2: '担任班委', point: '担任课代表每学期+10分', score: '+10' },
    { l0: '善学勤思', l1: '岗位职责', l2: '担任班委', point: '担任班委每学期+10～15分', score: '+15' },
    { l0: '合作助人', l1: '社会实践', l2: '公益活动', point: '参加学校劳动周全勤', score: '+5' },
    { l0: '合作助人', l1: '社会实践', l2: '公益活动', point: '参加学校学雷锋服务', score: '+5' },
    { l0: '合作助人', l1: '社会实践', l2: '公益活动', point: '参加学校社团', score: '+5' },
    { l0: '合作助人', l1: '社会实践', l2: '公益活动', point: '学校劳动周缺勤或态', score: '-5' },
    { l0: '合作助人', l1: '社会实践', l2: '公益活动', point: '办公室劳动一次+1分', score: '+1' },
    { l0: '敬业立业', l1: '社会实践', l2: '集体活动', point: '参加军训、运动会、秋游、成人仪式等重大活动', score: '+5' },
    { l0: '敬业立业', l1: '社会实践', l2: '集体活动', point: '重大活动中受到表扬', score: '+10' },
    { l0: '敬业立业', l1: '社会实践', l2: '集体活动', point: '未参加重大活动', score: '-5' },
    { l0: '敬业立业', l1: '社会实践', l2: '集体活动', point: '在重大活动中受到批评', score: '-2' },
    { l0: '敬业立业', l1: '社会实践', l2: '创新实践', point: '专利或省市级期刊发论文', score: '+20' },
    { l0: '敬业立业', l1: '社会实践', l2: '创新实践', point: '省市级竞赛中获奖', score: '+20' },
    { l0: '敬业立业', l1: '社会实践', l2: '创新实践', point: '校竞赛中获奖', score: '+10' }
];

const app = express();
const PORT = process.env.PORT || 3001;

// 获取本机IP地址
function getLocalIP() {
    const os = require('os');
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

// 带时间戳的日志函数（使用本地时间，非 UTC）
function logEvent(msg, req, extra = '') {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const time = now.getFullYear() + '-' +
        pad(now.getMonth() + 1) + '-' +
        pad(now.getDate()) + ' ' +
        pad(now.getHours()) + ':' +
        pad(now.getMinutes()) + ':' +
        pad(now.getSeconds());
    const user = req && req.session && req.session.user ? `${req.session.user.name}(${req.session.user.employee_id}/${req.session.user.role})` : '未登录';
    const ip = req ? (req.ip || req.connection.remoteAddress || '?') : '?';
    console.log(`[${time}] [${ip}] [${user}] ${msg} ${extra}`.trim());
}

// ===== 会话空闲超时：超过此时长无操作须重新登录（关闭浏览器后仅 cookie 仍存活时，下次请求也会被判超时） =====
const SESSION_IDLE_MS = 15 * 60 * 1000;
const sessionLastActivity = new Map(); // sessionID → timestamp（用内存 Map 代替 session 存储，更可靠）

// ===== 单账号互踢：记录用户ID → { sessionId, ip } =====
const userSessions = new Map();

/** 空闲超时：销毁 session、断开该会话下 WebSocket、写日志 */
function finalizeIdleDestroy(req, res, next, user, sid) {
    sessionLastActivity.delete(sid);
    logEvent(`会话超时（${SESSION_IDLE_MS / 60000}分钟无操作），自动注销 ${user.name}(${user.employee_id}) [${user.role}]`, req);
    console.warn(`[会话超时] ${user.name}(${user.employee_id}/${user.role}) sessionId=${sid} IP=${req.ip || req.connection.remoteAddress || '?'}`);
    userSessions.delete(user.id);
    kickSocketsForSession(sid, '长时间未操作，请重新登录');

    if (req.path === '/api/auth/check') {
        return req.session.destroy(() => res.json({ loggedIn: false, idleTimeout: true }));
    }

    if (req.path.startsWith('/socket.io')) {
        return req.session.destroy(() => next());
    }

    if (req.path.startsWith('/api/')) {
        return req.session.destroy(() =>
            res.status(401).json({ success: false, message: '登录已超时，请重新登录', idleTimeout: true })
        );
    }

    return req.session.destroy(() => res.redirect('/login?timeout=1'));
}

function enforceSessionIdle(req, res, next) {
    if (!req.session?.user) {
        return next();
    }
    const now = Date.now();
    const sid = req.sessionID;
    const last = sessionLastActivity.get(sid);
    const isSocketIo = req.path.startsWith('/socket.io');

    if (last === undefined) {
        sessionLastActivity.set(sid, now);
        return next();
    }

    if (now - last > SESSION_IDLE_MS) {
        const user = req.session.user;
        return finalizeIdleDestroy(req, res, next, user, sid);
    }

    if (!isSocketIo) {
        sessionLastActivity.set(sid, now);
    }
    next();
}
// ===== 账号被踢记录：employee_id → [{ time: Date, ip: string }, ...] =====
const kickedRecords = new Map();
// ===== 异常账号：employee_id → { userId: number, name: string, time: Date } =====
const abnormalAccounts = new Map();
// 异常判定阈值：10分钟内被踢5次
const KICK_THRESHOLD = 5;
const TIME_WINDOW_MS = 10 * 60 * 1000;

// 请假单图片存储目录
const IMAGE_DIR = 'D:\\mysql image';
if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    console.log('已创建图片存储目录:', IMAGE_DIR);
}

// multer 配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMAGE_DIR),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 静态服务：图片目录
app.use('/leave-images', express.static(IMAGE_DIR));

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 }));

// ===== 性能优化：信任反向代理 + 并发限制 =====
app.set('trust proxy', true);
app.set('etag', 'weak');

// ===== Web 应用防火墙 (WAF)：登录暴力破解防护 =====
const loginAttempts = new Map(); // IP -> { count, lastAttempt, lockedUntil }
const LOGIN_RATE_LIMIT = 5;        // 允许失败次数
const LOGIN_LOCKOUT_MINUTES = 15;   // 锁定时长（分钟）
function rateLimitLogin(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (record && record.lockedUntil && now < record.lockedUntil) {
        const remainSec = Math.ceil((record.lockedUntil - now) / 1000);
        return res.status(429).json({
            success: false,
            message: `登录尝试次数过多，请 ${Math.ceil(remainSec / 60)} 分钟后重试`
        });
    }
    next();
}
// 记录登录失败（在 login 路由中调用）
function recordFailedLogin(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    let record = loginAttempts.get(ip) || { count: 0 };
    record.count++;
    record.lastAttempt = now;
    if (record.count >= LOGIN_RATE_LIMIT) {
        record.lockedUntil = now + LOGIN_LOCKOUT_MINUTES * 60 * 1000;
        console.warn(`[WAF] IP ${ip} 登录失败${record.count}次，已锁定 ${LOGIN_LOCKOUT_MINUTES} 分钟`);
    }
    loginAttempts.set(ip, record);
    // 清理过期的记录（每小时一次）
    if (!loginAttempts._cleanupAt || now > loginAttempts._cleanupAt + 3600000) {
        for (const [k, v] of loginAttempts.entries()) {
            if (now > (v.lockedUntil || v.lastAttempt) + 3600000) loginAttempts.delete(k);
        }
        loginAttempts._cleanupAt = now;
    }
}
// 清除成功登录的记录
function clearFailedLogin(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    loginAttempts.delete(ip);
}

// ===== 图形验证码系统 =====
const captchaStore = new Map(); // token -> { answer, expires }
const CAPTCHA_EXPIRE_MS = 5 * 60 * 1000; // 5分钟过期

function generateCaptcha() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer, text;
    if (op === '+') { answer = a + b; text = a + ' + ' + b; }
    else if (op === '-') { answer = Math.max(a, b) - Math.min(a, b); text = Math.max(a, b) + ' - ' + Math.min(a, b); }
    else { answer = a * b; text = a + ' × ' + b; }

    const token = crypto.randomBytes(16).toString('hex');
    captchaStore.set(token, { answer, expires: Date.now() + CAPTCHA_EXPIRE_MS });

    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50">' +
        '<rect width="160" height="50" fill="#f0f0f0" rx="4"/>' +
        '<text x="80" y="32" text-anchor="middle" font-size="22" font-family="Arial" fill="#333" font-weight="bold">' + text + ' = ?</text>' +
        '<line x1="10" y1="15" x2="150" y2="10" stroke="#ccc" stroke-width="1"/>' +
        '<line x1="20" y1="40" x2="140" y2="35" stroke="#ccc" stroke-width="1"/>' +
        '</svg>';

    return { token, svg: 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64') };
}

function verifyCaptcha(token, userAnswer) {
    const record = captchaStore.get(token);
    if (!record) return false;
    if (Date.now() > record.expires) {
        captchaStore.delete(token);
        return false;
    }
    captchaStore.delete(token);
    return parseInt(userAnswer) === record.answer;
}

// ===== 按账号跟踪登录失败次数 =====
const accountFailedAttempts = new Map(); // employee_id -> { count, lastAttempt }
const CAPTCHA_THRESHOLD = 2;  // 失败2次后需要验证码
const FREEZE_THRESHOLD = 6;   // 失败6次后冻结账户

function recordAccountFailed(employee_id) {
    let record = accountFailedAttempts.get(employee_id) || { count: 0, lastAttempt: 0 };
    record.count++;
    record.lastAttempt = Date.now();
    accountFailedAttempts.set(employee_id, record);
    console.log('[安全] 账号 ' + employee_id + ' 登录失败 ' + record.count + ' 次');
}

function getAccountFailedCount(employee_id) {
    const record = accountFailedAttempts.get(employee_id);
    return record ? record.count : 0;
}

function clearAccountFailed(employee_id) {
    accountFailedAttempts.delete(employee_id);
}

// API 路由禁用缓存（确保删除后其他页面不显示旧数据）
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Session 中间件（必须在路由前面）
const sessionMiddleware = session({
    secret: 'score-analysis-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: null // 默认关闭浏览器即失效，登录时根据"记住我"动态设置
    }
});
app.use(sessionMiddleware);
app.use(enforceSessionIdle);

// ===== 互踢检测中间件（班级账号允许多端登录） =====
const excludePaths = new Set([
    '/login',
    '/',
    '/api/login',
    '/api/logout',
    '/api/auth/check-kicked',
    '/api/auth/status',
    '/api/auth/check',
    '/api/auth/sessions'
]);

app.use((req, res, next) => {
    if (excludePaths.has(req.path) || req.path.startsWith('/public') || req.path.startsWith('/socket.io')) {
        return next();
    }

    if (!req.session?.user) return next();

    // 检查是否为异常账号
    if (abnormalAccounts.has(req.session.user.employee_id)) {
        req.session.destroy(() => {});
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                message: '账户异常，已被冻结'
            });
        }
        return res.redirect('/login?frozen=1');
    }

    // 班级账号不踢出，允许多端登录
    if (req.session.user.role === 'class') {
        return next();
    }

    if (req.session.kicked) {
        req.session.destroy(() => {});
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                message: '账号已在其他设备登录'
            });
        }
        return res.redirect('/login?kicked=1');
    }

    next();
});

// 页面鉴权中间件
function requirePageAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// 根据角色获取可访问的默认首页
function getDefaultPage(role) {
    const pages = { admin: '/admin', teacher: '/dashboard', class: '/total-table', student: '/dashboard' };
    return pages[role] || '/dashboard';
}

// 角色允许的页面
const ROLE_PAGES = {
    admin:   ['/admin'],
    teacher: ['/dashboard','/teacher-admin','/events','/total-table','/attendance','/detail-analysis','/homework-data','/homework-manage'],
    class:   ['/total-table','/attendance','/homework-data'],
    student: ['/dashboard','/detail-analysis','/period-stats']
};

// 页面路由（带登录和角色检查）
function servePage(pagePath, htmlFile) {
    return [requirePageAuth, (req, res) => {
        const role = req.session.user.role;
        if (!ROLE_PAGES[role] || !ROLE_PAGES[role].includes(pagePath)) {
            return res.redirect(getDefaultPage(role));
        }
        res.sendFile(path.join(__dirname, 'public', htmlFile));
    }];
}

app.get('/admin', ...servePage('/admin', 'admin.html'));
app.get('/dashboard', ...servePage('/dashboard', 'dashboard.html'));
app.get('/teacher-admin', ...servePage('/teacher-admin', 'teacher-admin.html'));
app.get('/events', ...servePage('/events', 'events.html'));
app.get('/total-table', ...servePage('/total-table', 'total-table.html'));
app.get('/attendance', ...servePage('/attendance', 'attendance.html'));
app.get('/detail-analysis', ...servePage('/detail-analysis', 'detail-analysis.html'));
app.get('/period-stats', ...servePage('/period-stats', 'period-stats.html'));
app.get('/homework-data', ...servePage('/homework-data', 'homework-data.html'));
app.get('/homework-manage', ...servePage('/homework-manage', 'homework-manage.html'));
// 获取客户端IP地址
function getClientIP(req) {
    return req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
}

// 验证访问IP（本地访问或localhost）
function validateIP(req, res, next) {
    const clientIP = getClientIP(req);
    // 允许本地访问和localhost
    if (clientIP.includes('127.0.0.1') || 
        clientIP.includes('::1') || 
        clientIP.includes('localhost') ||
        clientIP === '::ffff:127.0.0.1') {
        return next();
    }
    // 检查是否为IPv6本地地址
    if (clientIP.startsWith('::ffff:')) {
        const ipv4 = clientIP.substring(7);
        if (ipv4.startsWith('127.') || ipv4.startsWith('192.168.') || 
            ipv4.startsWith('10.') || ipv4.startsWith('172.')) {
            return next();
        }
    }
    // 在实际部署时，可以在这里添加特定的IP白名单
    // 目前允许所有IP访问
    return next();
}

// 所有路由使用IP验证
app.use(validateIP);

// 登录页面
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect(getDefaultPage(req.session.user.role));
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 获取图形验证码
app.get('/api/captcha/generate', (req, res) => {
    const captcha = generateCaptcha();
    res.json({ success: true, token: captcha.token, image: captcha.svg });
});

// 登录API（带 WAF 防暴力破解 + 验证码 + 账户冻结）
app.post('/api/login', rateLimitLogin, async (req, res) => {
    const { employee_id, password, captcha_token, captcha_answer, remember_me } = req.body;

    if (!employee_id || !password) {
        return res.status(400).json({ success: false, message: '请输入账号和密码' });
    }

    // 检查是否为异常账号
    if (abnormalAccounts.has(employee_id)) {
        const acc = abnormalAccounts.get(employee_id);
        logEvent(`账号 ${acc.name}(${employee_id}) 异常，已被冻结`, req);
        return res.status(403).json({ success: false, message: '账户异常，请联系管理员' });
    }

    // 检查是否需要验证码（失败2次以上）
    const failedCount = getAccountFailedCount(employee_id);
    if (failedCount >= CAPTCHA_THRESHOLD) {
        if (!captcha_token || !captcha_answer) {
            const captcha = generateCaptcha();
            return res.status(401).json({
                success: false,
                needCaptcha: true,
                captchaToken: captcha.token,
                captchaImage: captcha.svg,
                message: '请输入图形验证码'
            });
        }
        if (!verifyCaptcha(captcha_token, captcha_answer)) {
            const captcha = generateCaptcha();
            return res.status(401).json({
                success: false,
                needCaptcha: true,
                captchaToken: captcha.token,
                captchaImage: captcha.svg,
                message: '验证码错误，请重新输入'
            });
        }
    }

    // 检测5位纯数字账号 → 班级角色
    if (/^\d{5}$/.test(employee_id)) {
        // 查找是否已存在该班级账号的用户
        let user = await database.get('SELECT * FROM users WHERE employee_id = ?', [employee_id]);

        if (!user) {
            // 自动创建班级用户
            const classInfo = await findOrCreateClass(employee_id);
            const hashedPassword = bcrypt.hashSync(password, 10);
            await database.run(
                "INSERT INTO users (employee_id, password, plain_password, name, role) VALUES (?, ?, ?, ?, ?)",
                [employee_id, hashedPassword, password, employee_id, 'class']
            );
            user = await database.get('SELECT * FROM users WHERE employee_id = ?', [employee_id]);
            console.log(`自动创建班级账号: ${employee_id} → ${classInfo.classId}`);
        } else {
            // 已存在则验证密码
            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                recordFailedLogin(req);
                recordAccountFailed(employee_id);
                if (getAccountFailedCount(employee_id) >= FREEZE_THRESHOLD) {
                    freezeAccount(employee_id, user.id, user.name);
                    return res.status(403).json({ success: false, message: '账户已被冻结，请联系管理员' });
                }
                return res.status(401).json({ success: false, message: '密码错误' });
            }
        }

        // 获取关联班级ID
        const classInfo = await findOrCreateClass(employee_id);

        // 班级账号：允许多端登录（最多2个连接）
        const currentSessions = getSessionCount(user.id);
        if (currentSessions >= CLASS_MAX_SESSIONS) {
            logEvent(`班级账号 ${user.name}(${employee_id}) 已达最大连接数 ${CLASS_MAX_SESSIONS}，拒绝新登录`, req);
            return res.status(429).json({
                success: false,
                message: `拒绝登录:该班级账号已有 ${CLASS_MAX_SESSIONS} 个设备在线`
            });
        }

        req.session.user = {
            id: user.id,
            employee_id: user.employee_id,
            name: user.name,
            role: 'class',
            class_id: classInfo.classId
        };
        req.session.lastActivityAt = Date.now();
        userSessions.set(user.id, { sessionId: req.sessionID, ip: req.ip || req.connection.remoteAddress || '?' });
        
        // 设置 cookie 过期时间
        if (remember_me) {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 记住我：7 天
        } else {
            req.session.cookie.maxAge = null; // 默认：关闭浏览器即失效
        }

        logEvent('登录成功 [' + req.session.user.role + '] (第' + (currentSessions + 1) + '个设备) [记住我:' + remember_me + ']', req);
        clearFailedLogin(req);
        clearAccountFailed(employee_id);
        return res.json({ success: true, message: '登录成功', redirect: '/total-table' });
    }

    // 普通登录
    const user = await database.get('SELECT * FROM users WHERE employee_id = ?', [employee_id]);
    
    if (!user) {
        recordFailedLogin(req);
        recordAccountFailed(employee_id);
        if (getAccountFailedCount(employee_id) >= FREEZE_THRESHOLD) {
            return res.status(403).json({ success: false, message: '账户已被冻结，请联系管理员' });
        }
        return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
        recordFailedLogin(req);
        recordAccountFailed(employee_id);
        if (getAccountFailedCount(employee_id) >= FREEZE_THRESHOLD) {
            freezeAccount(employee_id, user.id, user.name);
            return res.status(403).json({ success: false, message: '账户已被冻结，请联系管理员' });
        }
        return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    clearFailedLogin(req);
    clearAccountFailed(employee_id);

    const userRole = user.role || 'teacher';
    // 确定最大会话数
    const maxSessions = userRole === 'class' ? CLASS_MAX_SESSIONS : TEACHER_MAX_SESSIONS;
    
    // 检查当前在线会话数
    const currentSessions = getSessionCount(user.id);
    if (currentSessions >= maxSessions) {
        logEvent(`账号 ${user.name}(${employee_id}) 已有${maxSessions}个设备在线，拒绝新登录 [${userRole}]`, req);
        return res.status(429).json({
            success: false,
            message: `拒绝登录:该账号已有${maxSessions}个设备在线`
        });
    }

    req.session.user = {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        role: userRole
    };
    req.session.lastActivityAt = Date.now();
    userSessions.set(user.id, { sessionId: req.sessionID, ip: req.ip || req.connection.remoteAddress || '?' });
    
    // 设置 cookie 过期时间
    if (remember_me) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 记住我：7 天
    } else {
        req.session.cookie.maxAge = null; // 默认：关闭浏览器即失效
    }

    logEvent('登录成功 [' + userRole + '] [记住我:' + remember_me + ']', req);
    res.json({ success: true, message: '登录成功' });
});

// 根据班级编号查找或创建班级，返回 { classId }
async function findOrCreateClass(classNo) {
    // 先按名称查找（如"25008班级"）
    let cls = await database.get("SELECT id FROM classes WHERE name = ?", [classNo + '班级']);
    if (cls) return { classId: cls.id };
    // 按名称查找（如"25008"）
    cls = await database.get("SELECT id FROM classes WHERE name = ?", [classNo]);
    if (cls) return { classId: cls.id };
    // 按id查找
    cls = await database.get("SELECT id FROM classes WHERE id = ?", [parseInt(classNo)]);
    if (cls) return { classId: cls.id };
    // 不存在，创建新班级
    const result = await database.run(
        "INSERT INTO classes (name, grade) VALUES (?, ?)",
        [classNo + '班级', classNo.substring(0, 2)]
    );
    console.log(`自动创建班级: ${classNo}班级 → ID=${result.lastInsertRowid}`);
    return { classId: result.lastInsertRowid };
}

// 冻结账户
function freezeAccount(employee_id, userId, name) {
    if (!abnormalAccounts.has(employee_id)) {
        abnormalAccounts.set(employee_id, { userId, name, time: new Date() });
        console.log('[安全] 账号 ' + name + '(' + employee_id + ') 已被冻结（失败次数过多）');
        logEvent('账号 ' + name + '(' + employee_id + ') 因失败次数过多被冻结', { ip: 'system' });
    }
}

// 记录被踢信息
function recordKick(employee_id, ip, userId, name) {
    const now = new Date();
    // 清理过期记录
    if (!kickedRecords.has(employee_id)) {
        kickedRecords.set(employee_id, []);
    }
    let records = kickedRecords.get(employee_id);
    records = records.filter(r => now - r.time < TIME_WINDOW_MS);
    records.push({ time: now, ip });
    kickedRecords.set(employee_id, records);
    
    console.log(`[调试] 账号 ${name}(${employee_id}) 被踢，当前记录数: ${records.length}/${KICK_THRESHOLD}`);
    
    // 检查是否达到异常阈值
    if (records.length >= KICK_THRESHOLD && !abnormalAccounts.has(employee_id)) {
        abnormalAccounts.set(employee_id, { userId, name, time: now });
        logEvent(`账号 ${name}(${employee_id}) 被列为异常账号`, { ip });
        console.log(`[调试] 账号 ${name}(${employee_id}) 已添加到异常账号列表，当前异常账号数: ${abnormalAccounts.size}`);
    }
}

// 获取异常账号列表
app.get('/api/abnormal-accounts', (req, res) => {
    console.log(`[调试] 请求获取异常账号列表，当前异常账号数: ${abnormalAccounts.size}`);
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: '无权限' });
    }
    const list = Array.from(abnormalAccounts.entries()).map(([employee_id, info]) => ({
        employee_id,
        name: info.name,
        type: info.type,
        reason: info.reason,
        time: info.time.toISOString()
    }));
    console.log(`[调试] 返回异常账号列表:`, list);
    res.json({ success: true, data: list });
});

// 解除异常账号
app.post('/api/abnormal-accounts/remove', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: '无权限' });
    }
    const { employee_id } = req.body;
    if (abnormalAccounts.has(employee_id)) {
        const info = abnormalAccounts.get(employee_id);
        abnormalAccounts.delete(employee_id);
        kickedRecords.delete(employee_id);
        clearAccountFailed(employee_id);
        logEvent(`解除异常账号: ${info.name}(${employee_id})`, req);
        res.json({ success: true, message: '已解除异常状态' });
    } else {
        res.json({ success: false, message: '账号不在异常列表中' });
    }
});

// 添加异常账号
app.post('/api/abnormal-accounts/add', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: '无权限' });
    }
    const { employee_id, name } = req.body;
    if (!employee_id) {
        return res.status(400).json({ success: false, message: '缺少账号' });
    }
    if (employee_id === 'admin') {
        return res.status(400).json({ success: false, message: '不能标记管理员为异常' });
    }
    abnormalAccounts.set(employee_id, {
        name: name || '未知用户',
        time: new Date(),
        type: 'abnormal',
        reason: '管理员标记为异常'
    });
    logEvent(`标记账号为异常: ${name || '未知用户'}(${employee_id})`, req);
    res.json({ success: true, message: '已标记为异常' });
});

// 检测是否被踢出
app.get('/api/auth/check-kicked', (req, res) => {
    if (req.session?.user && abnormalAccounts.has(req.session.user.employee_id)) {
        return res.json({ kicked: true, message: '账户异常，已被冻结' });
    }
    if (req.session?.kicked) {
        return res.json({ kicked: true, message: '您的账号已在其他地方登录，您已被强制下线' });
    }
    res.json({ kicked: false });
});

app.post('/api/logout', (req, res) => {
    const user = req.session?.user;
    const sid = req.sessionID;
    sessionLastActivity.delete(sid);
    if (user) {
        userSessions.delete(user.id);
        logEvent(`账号 ${user.name}(${user.employee_id}) 退出登录 [${user.role}]`, req);
    }
    req.session.destroy();
    res.json({ success: true });
});

// ===== 多端登录：获取当前账号的在线会话列表 =====
app.get('/api/auth/sessions', requireAuth, async (req, res) => {
    const user = req.session.user;
    if (user.role !== 'class') {
        return res.json({ success: true, sessions: [], maxSessions: 1 });
    }
    const { getUserSessions } = require('./ws-server');
    const sessions = getUserSessions(user.id);
    const sessionList = sessions.map(s => ({
        socketId: s.socketId,
        connectedAt: s.connectedAt,
        ip: s.ip,
        isCurrent: s.sessionId === req.sessionID
    }));
    res.json({
        success: true,
        sessions: sessionList,
        maxSessions: CLASS_MAX_SESSIONS,
        currentCount: sessions.length
    });
});

// ===== 多端登录：强制断开指定会话 =====
app.post('/api/auth/kick-session', requireAuth, async (req, res) => {
    const user = req.session.user;
    if (user.role !== 'class') {
        return res.json({ success: false, message: '仅班级账号支持此操作' });
    }
    const { socketId } = req.body;
    if (!socketId) {
        return res.json({ success: false, message: '缺少会话ID' });
    }
    const { getUserSessions } = require('./ws-server');
    const sessions = getUserSessions(user.id);
    const target = sessions.find(s => s.socketId === socketId);
    if (!target) {
        return res.json({ success: false, message: '会话不存在' });
    }
    if (target.sessionId === req.sessionID) {
        return res.json({ success: false, message: '不能断开当前会话' });
    }
    const io = req.app.get('io');
    if (io) {
        const targetSocket = io.sockets.sockets.get(socketId);
        if (targetSocket) {
            targetSocket.emit('kicked', { message: '管理员强制断开此连接' });
            targetSocket.disconnect(true);
        }
    }
    logEvent(`强制断开会话: ${socketId}`, req);
    res.json({ success: true, message: '已断开指定会话' });
});

// ===== 防重复写入：内容哈希去重 =====
const writeDedupCache = new Map();
const DEDUP_WINDOW_MS = 5000;

function isDuplicateWrite(tableName, uniqueKey, contentHash) {
    const key = `${tableName}_${uniqueKey}_${contentHash}`;
    const now = Date.now();
    if (writeDedupCache.has(key)) {
        const lastTime = writeDedupCache.get(key);
        if (now - lastTime < DEDUP_WINDOW_MS) {
            return true;
        }
    }
    writeDedupCache.set(key, now);
    // 定期清理过期缓存
    if (!writeDedupCache._cleanupAt || now > writeDedupCache._cleanupAt + 60000) {
        for (const [k, v] of writeDedupCache.entries()) {
            if (now - v > DEDUP_WINDOW_MS) writeDedupCache.delete(k);
        }
        writeDedupCache._cleanupAt = now;
    }
    return false;
}

// ===== 协同编辑：获取文档锁状态 =====
app.get('/api/collab/lock-status', requireAuth, async (req, res) => {
    const { docType, docId } = req.query;
    if (!docType || !docId) {
        return res.json({ success: false, message: '缺少参数' });
    }
    const user = req.session.user;
    const classId = user.class_id;
    if (!classId) {
        return res.json({ success: false, message: '非班级账号' });
    }
    res.json({ success: true, locked: false });
});

// 修改密码
app.post('/api/change-password', requireAuth, async (req, res) => {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
        return res.json({ success: false, message: '请填写旧密码和新密码' });
    }
    if (new_password.length < 4) {
        return res.json({ success: false, message: '新密码至少4位' });
    }
    try {
        const user = await database.get('SELECT * FROM users WHERE id = ?', [req.session.user.id]);
        if (!user) return res.json({ success: false, message: '用户不存在' });

        const isMatch = bcrypt.compareSync(old_password, user.password);
        if (!isMatch) return res.json({ success: false, message: '旧密码错误' });

        const hashedPassword = bcrypt.hashSync(new_password, 10);
        await database.run('UPDATE users SET password = ?, plain_password = ? WHERE id = ?', [hashedPassword, new_password, req.session.user.id]);
        logEvent('修改密码成功', req);
        res.json({ success: true, message: '密码修改成功' });
    } catch (err) {
        console.error('修改密码失败:', err);
        res.json({ success: false, message: '修改密码失败' });
    }
});

// 检查登录状态
app.get('/api/auth/check', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// 中间件：验证登录
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '请先登录' });
    }
    next();
}

// ============ 账号格式校验 ============
function validateAccountId(employee_id, role) {
    if (!employee_id || typeof employee_id !== 'string') {
        return { valid: false, message: '账号不能为空' };
    }
    const rules = {
        teacher:  { pattern: /^\d{4}$/, msg: '教师账号必须为4位数字' },
        student:  { pattern: /^\d{10}$/, msg: '学生学号必须为10位数字' },
        class:    { pattern: /^\d{5}$/, msg: '班级账号必须为5位数字' },
        admin:     { pattern: /^.{1,20}$/, msg: '' } // 管理员不限
    };
    const rule = rules[role] || rules.admin;
    if (!rule.pattern.test(employee_id)) {
        return { valid: false, message: rule.msg || `账号格式不正确（${role}）` };
    }
    return { valid: true };
}

// ============ 用户管理 ============

// 获取用户列表（包含密码）
app.get('/api/users', requireAuth, async (req, res) => {
    try {
        const users = await database.all('SELECT id, employee_id, name, plain_password, role FROM users');
        console.log(`[API /api/users] 查询到 ${users.length} 个用户`);
        res.json({ success: true, data: users });
    } catch (err) {
        console.error('[API /api/users] 错误:', err.message);
        res.json({ success: true, data: [] });
    }
});

// 添加用户
app.post('/api/users', requireAuth, async (req, res) => {
    const { employee_id, password, name, role } = req.body;
    
    if (!employee_id || !password || !name) {
        return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    // 校验角色
    const validRoles = ['admin', 'teacher', 'student', 'class'];
    const userRole = validRoles.includes(role) ? role : 'teacher';

    // 校验账号格式
    const idCheck = validateAccountId(String(employee_id), userRole);
    if (!idCheck.valid) {
        return res.status(400).json({ success: false, message: idCheck.message });
    }

    const existing = await database.get('SELECT * FROM users WHERE employee_id = ?', [employee_id]);
    if (existing) {
        return res.status(400).json({ success: false, message: '工号/学号已存在' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result = await database.run('INSERT INTO users (employee_id, password, plain_password, name, role) VALUES (?, ?, ?, ?, ?)', [employee_id, hashedPassword, password, name, userRole]);
    
    res.json({ success: true, message: '添加成功', id: result.lastInsertRowid });
});

// 批量导入用户
app.post('/api/users/batch', requireAuth, async (req, res) => {
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ success: false, message: '请提供用户数据' });
    }

    let success = 0, failed = 0;
    
    await database.transaction(async () => {
        for (const item of users) {
            try {
                if (item.employee_id && item.password && item.name) {
                    const roleMap = { '教师': 'teacher', '管理员': 'admin', '学生': 'student', '班级': 'class', 'teacher': 'teacher', 'admin': 'admin', 'student': 'student', 'class': 'class' };
                    const userRole = roleMap[item.role] || 'teacher';

                    // 校验账号格式
                    const idCheck = validateAccountId(String(item.employee_id), userRole);
                    if (!idCheck.valid) { failed++; continue; }

                    const existing = await database.get('SELECT * FROM users WHERE employee_id = ?', [item.employee_id]);
                    if (!existing) {
                        const hashedPassword = bcrypt.hashSync(item.password, 10);
                        await database.run('INSERT INTO users (employee_id, password, plain_password, name, role) VALUES (?, ?, ?, ?, ?)',
                            [item.employee_id, hashedPassword, item.password, item.name, userRole]);
                        success++;
                    } else {
                        failed++;
                    }
                } else {
                    failed++;
                }
            } catch (err) {
                failed++;
            }
        }
    });

    res.json({ success: true, message: `导入完成：成功${success}条，失败${failed}条` });
});

// 删除用户（级联删除所有关联数据）
app.delete('/api/users/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    
    if (parseInt(id) === req.session.user.id) {
        return res.status(400).json({ success: false, message: '不能删除当前登录用户' });
    }

    try {
        // 只删除该用户创建的数据
        // 1. 删除该用户创建的成绩
        await database.run('DELETE FROM scores WHERE user_id = ?', [id]);

        // 2. 删除该用户创建的学生
        await database.run('DELETE FROM students WHERE user_id = ?', [id]);

        // 3. 删除该用户创建的班级
        await database.run('DELETE FROM classes WHERE user_id = ?', [id]);

        // 4. 删除该用户创建的美育成绩
        await database.run('DELETE FROM beauty_scores WHERE user_id = ?', [id]);

        // 5. 删除用户
        await database.run('DELETE FROM users WHERE id = ?', [id]);

        res.json({ success: true, message: '删除成功，该用户的所有关联数据已清除' });
    } catch (err) {
        console.error('删除用户失败:', err);
        res.status(500).json({ success: false, message: '删除失败: ' + err.message });
    }
});

// ============ 班级管理 ============

// 获取班级列表
app.get('/api/classes', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    let sql = 'SELECT * FROM classes';
    let params = [];
    
    // 教师只能看到自己创建的班级
    if (currentUser.role === 'teacher') {
        sql += ' WHERE user_id = ?';
        params.push(currentUser.id);
    }
    
    sql += ' ORDER BY grade, name';
    const classes = await database.all(sql, params);
    res.json({ success: true, data: classes });
});

// 添加班级
app.post('/api/classes', requireAuth, async (req, res) => {
    const { name } = req.body;
    const currentUser = req.session.user;
    
    if (!name) {
        return res.status(400).json({ success: false, message: '请填写班级名称' });
    }

    // 检查班级名称是否已存在（全局检查，防止重复创建）
    const existingClass = await database.get('SELECT * FROM classes WHERE name = ?', [name]);
    if (existingClass) {
        // 获取创建该班级的用户信息
        const creator = await database.get('SELECT employee_id FROM users WHERE id = ?', [existingClass.user_id]);
        const creatorInfo = creator ? `创建者: ${creator.employee_id}` : '';
        
        // 判断是否是当前用户自己创建的
        if (existingClass.user_id === currentUser.id) {
            return res.status(400).json({ 
                success: false, 
                code: 'SAME_USER_DUPLICATE',
                message: `班级"${name}"已存在，请重新输入` 
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                code: 'OTHER_USER_CREATED',
                message: `班级"${name}"已被其他账号创建（${creatorInfo}），无法重复创建` 
            });
        }
    }

    const result = await database.run('INSERT INTO classes (name, grade, user_id, created_by) VALUES (?, ?, ?, ?)', 
        [name, '', currentUser.id, currentUser.employee_id]);
    res.json({ success: true, message: '添加成功', id: result.lastInsertRowid });
});

// 更新班级
app.put('/api/classes/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({ success: false, message: '请填写班级名称' });
    }

    // 检查班级名称是否已被其他班级使用
    const existingClass = await database.get('SELECT * FROM classes WHERE name = ? AND id != ?', [name, id]);
    if (existingClass) {
        return res.status(400).json({ success: false, message: '班级名称已存在' });
    }
    
    await database.run('UPDATE classes SET name = ? WHERE id = ?', [name, id]);
    res.json({ success: true, message: '修改成功' });
});

// 删除班级
app.delete('/api/classes/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    
    try {
        // 检查班级是否存在
        const existingClass = await database.get('SELECT * FROM classes WHERE id = ?', [id]);
        if (!existingClass) {
            return res.status(404).json({ success: false, message: '班级不存在' });
        }

        // 级联删除所有关联数据
        // 1. 获取该班级所有学生记录（用于删除成绩）
        const students = await database.all('SELECT id FROM students WHERE class_id = ?', [id]);
        
        // 2. 删除成绩
        students.forEach(async (s) => {
            await database.run('DELETE FROM scores WHERE student_id = ?', [s.id]);
        });
        
        // 3. 删除学生
        await database.run('DELETE FROM students WHERE class_id = ?', [id]);
        
        // 4. 删除美丽学分评分
        await database.run('DELETE FROM beauty_scores WHERE class_id = ?', [id]);
        
        // 5. 删除美丽学分事件记录
        await database.run('DELETE FROM beauty_score_events WHERE class_id = ?', [id]);
        
        // 6. 删除考勤记录
        await database.run('DELETE FROM attendance WHERE class_id = ?', [id]);
        
        // 7. 删除班级
        await database.run('DELETE FROM classes WHERE id = ?', [id]);
        
        res.json({ success: true, message: '班级及所有关联数据已删除' });
    } catch (err) {
        console.error('删除班级失败:', err);
        res.status(500).json({ success: false, message: '删除失败: ' + err.message });
    }
});

// ============ 学生管理 ============

// 获取学生列表
app.get('/api/students', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { class_id, student_id } = req.query;
    
    let sql = `
        SELECT s.*, c.name as class_name 
        FROM students s 
        LEFT JOIN classes c ON s.class_id = c.id
    `;
    let params = [];
    let conditions = [];

    // 教师只能看到自己创建的学生
    if (currentUser.role === 'teacher') {
        conditions.push('s.user_id = ?');
        params.push(currentUser.id);
    }

    if (class_id) {
        conditions.push('s.class_id = ?');
        params.push(class_id);
    }

    if (student_id) {
        conditions.push('s.student_id = ?');
        params.push(student_id);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY CAST(s.student_id AS INTEGER) ASC';
    
    const students = await database.all(sql, params);
    res.json({ success: true, data: students });
});

// 添加学生
app.post('/api/students', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { student_id, name, class_id } = req.body;
    
    if (!student_id || !name) {
        return res.status(400).json({ success: false, message: '请填写学号和姓名' });
    }

    // 学号必须为10位数字
    if (!/^\d{10}$/.test(String(student_id))) {
        return res.status(400).json({ success: false, message: '学号必须为10位数字' });
    }

    const existing = await database.get('SELECT * FROM students WHERE student_id = ?', [student_id]);
    if (existing) {
        return res.status(400).json({ success: false, message: '学号已存在' });
    }

    const result = await database.run('INSERT INTO students (student_id, name, class_id, user_id) VALUES (?, ?, ?, ?)', 
        [student_id, name, class_id || null, currentUser.id]);
    res.json({ success: true, message: '添加成功', id: result.lastInsertRowid });
});

// 批量导入学生
app.post('/api/students/batch', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { students, class_id } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: '请提供学生数据' });
    }

    let success = 0, failed = 0;
    const failedIds = [];
    const failedReasons = [];
    
    await database.transaction(async () => {
        for (const item of students) {
            try {
                if (item.student_id && item.name) {
                    // 学号必须为10位数字
                    if (!/^\d{10}$/.test(String(item.student_id))) { 
                        failed++; 
                        failedIds.push(item.student_id);
                        failedReasons.push({ id: item.student_id, reason: '学号不是10位数字' });
                        continue; 
                    }
                    const existing = await database.get('SELECT * FROM students WHERE student_id = ?', [item.student_id]);
                    if (!existing) {
                        await database.run('INSERT INTO students (student_id, name, class_id, user_id) VALUES (?, ?, ?, ?)', 
                            [item.student_id, item.name, class_id || null, currentUser.id]);
                        success++;
                    } else {
                        failed++;
                        failedIds.push(item.student_id);
                        failedReasons.push({ id: item.student_id, reason: '学号已存在' });
                    }
                } else {
                    failed++;
                }
            } catch (e) {
                failed++;
            }
        }
    });
    
    res.json({ 
        success: true, 
        imported: success, 
        failed: failed,
        failedIds: failedIds,
        failedReasons: failedReasons,
        message: `导入完成：成功${success}条，失败${failed}条` 
    });
});

// 更新学生
app.put('/api/students/:id', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { id } = req.params;
    const { student_id, name, class_id } = req.body;

    if (!student_id || !name) {
        return res.status(400).json({ success: false, message: '请填写学号和姓名' });
    }

    // 检查学号是否已被其他学生使用
    const existing = await database.get('SELECT * FROM students WHERE student_id = ? AND id != ?', [student_id, id]);
    if (existing) {
        return res.status(400).json({ success: false, message: '学号已存在' });
    }

    // 教师只能更新自己创建的学生
    let sql = 'UPDATE students SET student_id = ?, name = ?, class_id = ? WHERE id = ?';
    let params = [student_id, name, class_id || null, id];
    
    if (currentUser.role === 'teacher') {
        sql += ' AND user_id = ?';
        params.push(currentUser.id);
    }
    
    await database.run(sql, params);
    res.json({ success: true, message: '更新成功' });
});

// 删除学生
app.delete('/api/students/:id', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { id } = req.params;
    
    // 教师只能删除自己创建的学生
    let sql = 'DELETE FROM students WHERE id = ?';
    let params = [id];
    
    if (currentUser.role === 'teacher') {
        sql += ' AND user_id = ?';
        params.push(currentUser.id);
    }
    
    await database.run(sql, params);
    res.json({ success: true, message: '删除成功' });
});

// 批量删除学生
app.post('/api/students/batch-delete', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    let { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要删除的学生' });
    }
    
    // 确保都是数字类型
    ids = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
        return res.status(400).json({ success: false, message: '无效的ID' });
    }
    
    // 使用事务批量删除
    await database.transaction(async () => {
        for (const id of ids) {
            // 教师只能删除自己创建的学生
            let sql = 'DELETE FROM students WHERE id = ?';
            let params = [id];
            
            if (currentUser.role === 'teacher') {
                sql += ' AND user_id = ?';
                params.push(currentUser.id);
            }
            
            await database.run(sql, params);
            
            // 删除该学生的成绩
            await database.run('DELETE FROM scores WHERE student_id = ?', [id]);
        }
    });
    
    res.json({ success: true, message: `成功删除 ${ids.length} 名学生` });
});

// ============ 考试管理 ============

// 获取考试列表
app.get('/api/exams', requireAuth, async (req, res) => {
    const exams = await database.all('SELECT * FROM exams ORDER BY date DESC');
    res.json({ success: true, data: exams });
});

// 添加考试
app.post('/api/exams', requireAuth, async (req, res) => {
    const { name, date } = req.body;
    
    if (!name || !date) {
        return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    const result = await database.run('INSERT INTO exams (name, date) VALUES (?, ?)', [name, date]);
    res.json({ success: true, message: '添加成功', id: result.lastInsertRowid });
});

// 删除考试
app.delete('/api/exams/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    // 删除考试时同时删除关联成绩
    await database.run('DELETE FROM scores WHERE exam_id = ?', [id]);
    await database.run('DELETE FROM exams WHERE id = ?', [id]);
    res.json({ success: true, message: '删除成功' });
});

// ============ 成绩管理 ============

// 获取成绩列表
app.get('/api/scores', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { exam_id, class_id, subject, student_id } = req.query;
    let sql = `
        SELECT sc.*, s.student_id as stu_no, s.name as stu_name, s.class_id as stu_class_id, c.name as class_name, e.name as exam_name
        FROM scores sc
        LEFT JOIN students s ON sc.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN exams e ON sc.exam_id = e.id
    `;

    let params = [];
    let conditions = [];

    // 教师只能看到自己创建的成绩
    if (currentUser.role === 'teacher') {
        conditions.push('sc.user_id = ?');
        params.push(currentUser.id);
    }

    if (exam_id) {
        conditions.push('sc.exam_id = ?');
        params.push(exam_id);
    }

    if (class_id) {
        conditions.push('s.class_id = ?');
        params.push(class_id);
    }

    // 按学科筛选
    if (subject) {
        conditions.push('sc.subject = ?');
        params.push(subject);
    }

    // 按学号筛选（student_id 是学号字段，对应 s.student_id）
    if (student_id) {
        conditions.push('s.student_id = ?');
        params.push(student_id);
    }

    let scores = [];
    if (conditions.length > 0) {
        scores = await database.all(sql + ' WHERE ' + conditions.join(' AND ') + ' ORDER BY sc.subject ASC, CAST(s.student_id AS INTEGER) ASC', params);
    } else {
        scores = await database.all(sql + ' ORDER BY sc.exam_id ASC, sc.subject ASC, CAST(s.student_id AS INTEGER) ASC', params);
    }
    res.json({ success: true, data: scores });
});

// 添加成绩
app.post('/api/scores', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { exam_id, student_id, subject, total_score } = req.body;
    
    if (!exam_id || !student_id || !subject || total_score === undefined) {
        return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    // 检查是否已存在该成绩
    const existing = await database.get('SELECT * FROM scores WHERE exam_id = ? AND student_id = ? AND subject = ?', [exam_id, student_id, subject]);
    if (existing) {
        // 更新
        await database.run('UPDATE scores SET total_score = ?, user_id = ? WHERE exam_id = ? AND student_id = ? AND subject = ?', 
            [total_score, currentUser.id, exam_id, student_id, subject]);
        return res.json({ success: true, message: '更新成功' });
    }

    const result = await database.run('INSERT INTO scores (exam_id, student_id, subject, total_score, user_id) VALUES (?, ?, ?, ?, ?)', 
        [exam_id, student_id, subject, total_score, currentUser.id]);
    res.json({ success: true, message: '添加成功', id: result.lastInsertRowid });
});

// 更新成绩（按成绩ID）
app.put('/api/scores/:id', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { id } = req.params;
    const { exam_id, student_id, subject, total_score } = req.body;

    if (!exam_id || !student_id || !subject || total_score === undefined) {
        return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    // 教师只能更新自己创建的成绩
    let sql = 'UPDATE scores SET exam_id = ?, student_id = ?, subject = ?, total_score = ?, user_id = ? WHERE id = ?';
    let params = [exam_id, student_id, subject, total_score, currentUser.id, id];
    
    if (currentUser.role === 'teacher') {
        sql += ' AND user_id = ?';
        params.push(currentUser.id);
    }
    
    await database.run(sql, params);
    res.json({ success: true, message: '更新成功' });
});

// 批量导入成绩（支持多学科）
app.post('/api/scores/batch', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { exam_id, scores } = req.body;
    
    if (!exam_id || !Array.isArray(scores) || scores.length === 0) {
        return res.status(400).json({ success: false, message: '请提供有效的考试ID和成绩数据' });
    }

    let success = 0, failed = 0;
    
    try {
        // 先尝试执行数据库迁移（处理旧数据库）
        tryMigrateScoresTable();
        
        for (const item of scores) {
            try {
                // 允许 subject 为空字符串或不存在，默认设为空字符串
                const subject = item.subject || '';
                if (item.student_id && item.total_score !== undefined) {
                    // 通过学号查找学生ID
                    const student = await database.get('SELECT id FROM students WHERE student_id = ?', [item.student_id]);
                    if (student) {
                        // 检查是否存在
                        const existing = await database.get('SELECT * FROM scores WHERE exam_id = ? AND student_id = ? AND subject = ?', [exam_id, student.id, subject]);
                        if (existing) {
                            await database.run('UPDATE scores SET total_score = ?, user_id = ? WHERE exam_id = ? AND student_id = ? AND subject = ?', 
                                [item.total_score, currentUser.id, exam_id, student.id, subject]);
                        } else {
                            await database.run('INSERT INTO scores (exam_id, student_id, subject, total_score, user_id) VALUES (?, ?, ?, ?, ?)', 
                                [exam_id, student.id, subject, item.total_score, currentUser.id]);
                        }
                        success++;
                    } else {
                        failed++;
                    }
                } else {
                    failed++;
                }
            } catch (e) {
                console.error('单条导入失败:', e);
                failed++;
            }
        }
    } catch (e) {
        console.error('批量导入失败:', e);
    }

    res.json({ success: true, message: `导入完成：成功${success}条，失败${failed}条` });
});

// 尝试迁移 scores 表（处理旧数据库的唯一约束问题）
function tryMigrateScoresTable() {
    try {
        database.migrateScoresTable();
    } catch (e) {
        console.log('迁移检查完成:', e.message);
    }
}

// 删除成绩
app.delete('/api/scores/:id', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { id } = req.params;
    
    // 教师只能删除自己创建的成绩
    let sql = 'DELETE FROM scores WHERE id = ?';
    let params = [id];
    
    if (currentUser.role === 'teacher') {
        sql += ' AND user_id = ?';
        params.push(currentUser.id);
    }
    
    await database.run(sql, params);
    res.json({ success: true, message: '删除成功' });
});

// 批量删除成绩
app.post('/api/scores/batch-delete', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: '请提供要删除的成绩ID列表' });
    }
    
    try {
        if (currentUser.role === 'teacher') {
            // 教师只能删除自己创建的成绩
            for (const id of ids) {
                await database.run('DELETE FROM scores WHERE id = ? AND user_id = ?', [id, currentUser.id]);
            }
        } else {
            const placeholders = ids.map(() => '?').join(',');
            await database.run(`DELETE FROM scores WHERE id IN (${placeholders})`, ids);
        }
        res.json({ success: true, message: `成功删除 ${ids.length} 条成绩` });
    } catch (e) {
        console.error('批量删除失败:', e);
        res.status(500).json({ success: false, message: '删除失败' });
    }
});

// ============ 成绩分析API ============

// 获取指定考试的各项分析数据
app.get('/api/analysis/exam/:examId', requireAuth, async (req, res) => {
    try {
    const currentUser = req.session.user;
    const { examId } = req.params;
    const { class_id } = req.query;

    // 检查考试是否存在
    const exam = await database.get('SELECT * FROM exams WHERE id = ?', [examId]);
    if (!exam) {
        return res.status(404).json({ success: false, message: '考试不存在' });
    }

    // 1. 班级总分排名
    let classRankings;
    if (class_id) {
        if (currentUser.role === 'teacher') {
            classRankings = await database.all(`
                SELECT c.id, c.name as class_name, 
                       COUNT(sc.id) as student_count,
                       AVG(CAST(sc.total_score AS REAL)) as avg_score,
                       MAX(CAST(sc.total_score AS REAL)) as max_score
                FROM classes c
                LEFT JOIN students s ON s.class_id = c.id
                LEFT JOIN scores sc ON sc.student_id = s.id AND sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
                WHERE c.id = ? AND c.user_id = ?
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_score DESC
            `, [examId, class_id, currentUser.id]);
        } else {
            classRankings = await database.all(`
                SELECT c.id, c.name as class_name, 
                       COUNT(sc.id) as student_count,
                       AVG(CAST(sc.total_score AS REAL)) as avg_score,
                       MAX(CAST(sc.total_score AS REAL)) as max_score
                FROM classes c
                LEFT JOIN students s ON s.class_id = c.id
                LEFT JOIN scores sc ON sc.student_id = s.id AND sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
                WHERE c.id = ?
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_score DESC
            `, [examId, class_id]);
        }
    } else {
        if (currentUser.role === 'teacher') {
            classRankings = await database.all(`
                SELECT c.id, c.name as class_name, 
                       COUNT(sc.id) as student_count,
                       AVG(CAST(sc.total_score AS REAL)) as avg_score,
                       MAX(CAST(sc.total_score AS REAL)) as max_score
                FROM classes c
                LEFT JOIN students s ON s.class_id = c.id
                LEFT JOIN scores sc ON sc.student_id = s.id AND sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
                WHERE c.user_id = ?
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_score DESC
            `, [examId, currentUser.id]);
        } else {
            classRankings = await database.all(`
                SELECT c.id, c.name as class_name, 
                       COUNT(sc.id) as student_count,
                       AVG(CAST(sc.total_score AS REAL)) as avg_score,
                       MAX(CAST(sc.total_score AS REAL)) as max_score
                FROM classes c
                LEFT JOIN students s ON s.class_id = c.id
                LEFT JOIN scores sc ON sc.student_id = s.id AND sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_score DESC
            `, [examId]);
        }
    }

    // 2. 班级统计信息（排名、均分、最高分）
    let classStats;
    if (class_id) {
        if (currentUser.role === 'teacher') {
            classStats = await database.all(`
                SELECT c.id, c.name as class_name,
                       COUNT(sc.id) as student_count,
                       AVG(CAST(sc.total_score AS REAL)) as avg_score,
                       MAX(CAST(sc.total_score AS REAL)) as max_score
                FROM classes c
                LEFT JOIN students s ON s.class_id = c.id
                LEFT JOIN scores sc ON sc.student_id = s.id AND sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
                WHERE c.id = ? AND c.user_id = ?
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_score DESC
            `, [examId, class_id, currentUser.id]);
        } else {
            classStats = await database.all(`
                SELECT c.id, c.name as class_name,
                       COUNT(sc.id) as student_count,
                       AVG(CAST(sc.total_score AS REAL)) as avg_score,
                       MAX(CAST(sc.total_score AS REAL)) as max_score
                FROM classes c
                LEFT JOIN students s ON s.class_id = c.id
                LEFT JOIN scores sc ON sc.student_id = s.id AND sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
                WHERE c.id = ?
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_score DESC
            `, [examId, class_id]);
        }
    } else {
        if (currentUser.role === 'teacher') {
            classStats = await database.all(`
                SELECT c.id, c.name as class_name,
                       COUNT(sc.id) as student_count,
                       AVG(CAST(sc.total_score AS REAL)) as avg_score,
                       MAX(CAST(sc.total_score AS REAL)) as max_score
                FROM classes c
                LEFT JOIN students s ON s.class_id = c.id
                LEFT JOIN scores sc ON sc.student_id = s.id AND sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
                WHERE c.user_id = ?
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_score DESC
            `, [examId, currentUser.id]);
        } else {
            classStats = await database.all(`
                SELECT c.id, c.name as class_name,
                       COUNT(sc.id) as student_count,
                       AVG(CAST(sc.total_score AS REAL)) as avg_score,
                       MAX(CAST(sc.total_score AS REAL)) as max_score
                FROM classes c
                LEFT JOIN students s ON s.class_id = c.id
                LEFT JOIN scores sc ON sc.student_id = s.id AND sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_score DESC
            `, [examId]);
        }
    }

    // 3. 前30%、60%、剩余学生的分数分析（按学生总分，即各学科之和）
    let studentTotals;
    if (class_id) {
        if (currentUser.role === 'teacher') {
            studentTotals = await database.all(`
                SELECT s.student_id, s.name, SUM(CAST(sc.total_score AS REAL)) as total
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = ? AND s.class_id = ? AND sc.user_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                GROUP BY sc.student_id
                HAVING total > 0
                ORDER BY total DESC
            `, [examId, class_id, currentUser.id]);
        } else {
            studentTotals = await database.all(`
                SELECT s.student_id, s.name, SUM(CAST(sc.total_score AS REAL)) as total
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = ? AND s.class_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                GROUP BY sc.student_id
                HAVING total > 0
                ORDER BY total DESC
            `, [examId, class_id]);
        }
    } else {
        if (currentUser.role === 'teacher') {
            studentTotals = await database.all(`
                SELECT s.student_id, s.name, SUM(CAST(sc.total_score AS REAL)) as total
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = ? AND sc.user_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                GROUP BY sc.student_id
                HAVING total > 0
                ORDER BY total DESC
            `, [examId, currentUser.id]);
        } else {
            studentTotals = await database.all(`
                SELECT s.student_id, s.name, SUM(CAST(sc.total_score AS REAL)) as total
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                GROUP BY sc.student_id
                HAVING total > 0
                ORDER BY total DESC
            `, [examId]);
        }
    }

    const totals = studentTotals.map(s => s.total);
    const totalStudents = totals.length;

    let percentile30 = null, percentile60 = null, remainder = null;

    if (totalStudents > 0) {
        const top30Count = Math.ceil(totalStudents * 0.3);
        const top60Count = Math.ceil(totalStudents * 0.6);

        const top30Values = totals.slice(0, top30Count);
        const top60Values = totals.slice(0, top60Count);
        const remainderValues = totals.slice(top60Count);

        percentile30 = top30Values.length > 0
            ? top30Values.reduce((sum, v) => sum + v, 0) / top30Values.length
            : null;
        percentile60 = top60Values.length > 0
            ? top60Values.reduce((sum, v) => sum + v, 0) / top60Values.length
            : null;
        remainder = remainderValues.length > 0
            ? remainderValues.reduce((sum, v) => sum + v, 0) / remainderValues.length
            : null;
    }

    // 4. 所有班级学生排名（用于展示前30%名单）
    let studentRankings;
    if (currentUser.role === 'teacher') {
        studentRankings = await database.all(`
            SELECT s.student_id, s.name, c.name as class_name, sc.total_score
            FROM scores sc
            JOIN students s ON sc.student_id = s.id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
              AND sc.user_id = ?
            ORDER BY CAST(sc.total_score AS REAL) DESC
        `, [examId, currentUser.id]);
    } else {
        studentRankings = await database.all(`
            SELECT s.student_id, s.name, c.name as class_name, sc.total_score
            FROM scores sc
            JOIN students s ON sc.student_id = s.id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE sc.exam_id = ? AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) > 0
            ORDER BY CAST(sc.total_score AS REAL) DESC
        `, [examId]);
    }

    res.json({
        success: true,
        data: {
            exam: exam,
            classRankings: classRankings,
            classStats: classStats,
            percentileAnalysis: {
                top30: percentile30,
                top60: percentile60,
                remainder: remainder,
                totalStudents: totalStudents
            },
            studentRankings: studentRankings
        }
    });
} catch (e) { console.error('分析考试错误:', e.message, e.stack); res.status(500).json({ success: false, message: e.message }); }
});

// 按班级和考试获取各学科平均分（用于柱状图展示）
app.get('/api/analysis/class-subject-avg', requireAuth, async (req, res) => {
    try {
    const currentUser = req.session.user;
    const { exam_id, class_id } = req.query;

    if (!exam_id || !class_id) {
        return res.json({ success: true, data: [] });
    }

    let subjectAvgs;
    if (currentUser.role === 'teacher') {
        // 教师只能看到自己创建的数据
        subjectAvgs = await database.all(`
            SELECT sc.subject,
                   AVG(CAST(sc.total_score AS REAL)) as avg_score,
                   COUNT(sc.id) as student_count
            FROM scores sc
            JOIN students s ON sc.student_id = s.id
            WHERE sc.exam_id = ?
              AND s.class_id = ?
              AND sc.user_id = ?
              AND sc.total_score NOT IN ('缺考', '免修')
              AND sc.total_score IS NOT NULL
              AND CAST(sc.total_score AS REAL) >= 0
            GROUP BY sc.subject
            ORDER BY sc.subject ASC
        `, [exam_id, class_id, currentUser.id]);
    } else {
        subjectAvgs = await database.all(`
            SELECT sc.subject,
                   AVG(CAST(sc.total_score AS REAL)) as avg_score,
                   COUNT(sc.id) as student_count
            FROM scores sc
            JOIN students s ON sc.student_id = s.id
            WHERE sc.exam_id = ?
              AND s.class_id = ?
              AND sc.total_score NOT IN ('缺考', '免修')
              AND sc.total_score IS NOT NULL
              AND CAST(sc.total_score AS REAL) >= 0
            GROUP BY sc.subject
            ORDER BY sc.subject ASC
        `, [exam_id, class_id]);
    }

    res.json({ success: true, data: subjectAvgs });
} catch (e) { console.error('学科平均错误:', e.message); res.status(500).json({ success: false, message: e.message }); }
});

// 获取各考试场次的分段趋势数据（按班级学生总分计算）
app.get('/api/analysis/trend', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    const { class_id } = req.query;

    try {
        const result = await workerPool.run({
            type: 'analyze_trend',
            data: {
                classId: class_id || null,
                userId: currentUser.id,
                userRole: currentUser.role
            }
        });

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error('趋势分析（Worker）错误:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 学生个人仪表盘 API（当前考试的分数、排名、各科雷达图数据）
app.get('/api/analysis/student-dashboard', requireAuth, async (req, res) => {
    const employee_id = req.session.user.employee_id;
    const { exam_id } = req.query;

    if (!exam_id) {
        return res.json({ success: false, message: '缺少考试ID' });
    }

    try {
        const student = await database.get('SELECT * FROM students WHERE student_id = ?', [employee_id]);
        if (!student) {
            return res.json({ success: false, message: '学生信息不存在' });
        }

        const result = await workerPool.run({
            type: 'analyze_student_dashboard',
            data: { studentId: student.id, examId: exam_id }
        });

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error('学生仪表盘分析（Worker）错误:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 学生详细分析 API（各学科历次考试分数和班级排名）
app.get('/api/analysis/student-detail', requireAuth, async (req, res) => {
    const { student_id } = req.query;
    if (!student_id) {
        return res.json({ success: false, message: '缺少学生ID' });
    }

    try {
        const student = await database.get('SELECT * FROM students WHERE id = ?', [student_id]);
        if (!student) {
            return res.json({ success: false, message: '学生不存在' });
        }

        const result = await workerPool.run({
            type: 'analyze_student_detail',
            data: { studentId: student.id, classId: student.class_id }
        });

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error('学生详细分析（Worker）错误:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 保存美丽学分评分
app.post('/api/beauty-scores/save', requireAuth, async (req, res) => {
    const { class_id, scores, month, entry_date, delta, clientId, timestamp } = req.body;
    if (!class_id || !Array.isArray(scores)) {
        return res.json({ success: false, message: '参数错误' });
    }
    const m = month || '';
    if (!m) {
        return res.json({ success: false, message: '缺少月份参数' });
    }
    const entryDate = entry_date || new Date().toISOString().slice(0, 10);
    const isDelta = delta === true;

    // 防重复写入：基于内容哈希去重
    const contentHash = crypto.createHash('md5')
        .update(JSON.stringify({ class_id, scores, month: m, entry_date: entryDate, delta: isDelta }))
        .digest('hex');
    if (isDuplicateWrite('beauty_scores', `${class_id}_${m}`, contentHash)) {
        return res.json({ success: true, message: '数据已保存（去重）', deduplicated: true });
    }

    let ok = 0, fail = 0;
    let conflicts = [];

    for (const s of scores) {
        try {
            const eventName = s.event_name || '';
            const studentId = String(s.student_id);
            const newScoreVal = parseFloat(s.score) || 0;
            console.log('保存评分:', { class_id, student_id: studentId, row_index: s.row_index, month: m, score: s.score, event: eventName, entry_date: entryDate, isDelta });

            const existing = await database.get(
                'SELECT id, events, score FROM beauty_scores WHERE class_id = ? AND student_id = ? AND row_index = ? AND month = ?',
                [class_id, studentId, s.row_index, m]
            );
            if (existing) {
                if (s.expected_score !== undefined && s.expected_score !== null) {
                    const expectedScore = parseFloat(s.expected_score);
                    const currentScore = parseFloat(existing.score) || 0;
                    if (Math.abs(expectedScore - currentScore) > 0.001) {
                        conflicts.push({ student_id: studentId, row_index: s.row_index, expected: expectedScore, current: currentScore });
                        console.log('冲突检测：数据已被其他设备修改', { student_id: studentId, row_index: s.row_index, expected: expectedScore, current: currentScore });
                        continue;
                    }
                }
                let newEvents = existing.events || '';
                if (eventName && !newEvents.includes(eventName)) {
                    newEvents = newEvents ? newEvents + '、' + eventName : eventName;
                }
                const finalScore = isDelta ? (parseFloat(existing.score) || 0) + newScoreVal : newScoreVal;
                await database.run(
                    'UPDATE beauty_scores SET score = ?, events = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [finalScore, newEvents, existing.id]
                );
                console.log('更新记录:', { id: existing.id, oldScore: existing.score, newScore: finalScore, events: newEvents, isDelta });
            } else {
                await database.run(
                    'INSERT INTO beauty_scores (class_id, student_id, row_index, month, score, events, entry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [class_id, studentId, s.row_index, m, newScoreVal, eventName, entryDate]
                );
                console.log('插入新记录:', { class_id, student_id: studentId, row_index: s.row_index, month: m, score: newScoreVal, entry_date: entryDate });
            }
            if (eventName) {
                const existingEvent = await database.get(
                    'SELECT id FROM beauty_score_events WHERE class_id = ? AND student_id = ? AND row_index = ? AND month = ? AND event_name = ?',
                    [class_id, studentId, s.row_index, m, eventName]
                );
                if (!existingEvent) {
                    await database.run(
                        'INSERT INTO beauty_score_events (class_id, student_id, row_index, month, score, event_name, entry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [class_id, studentId, s.row_index, m, newScoreVal, eventName, entryDate]
                    );
                }
            }
            ok++;
        } catch (err) {
            console.error('单条保存失败:', err, JSON.stringify(s));
            fail++;
        }
    }

    if (conflicts.length > 0) {
        res.json({ success: false, conflict: true, message: '数据已被其他设备修改，请刷新页面后重试', conflicts });
    } else if (fail > 0) {
        res.json({ success: true, message: `保存完成：成功${ok}条，失败${fail}条` });
    } else {
        res.json({ success: true, message: `保存成功，共${ok}条` });
    }
});

// 获取美丽学分评分（按班级+月份）
app.get('/api/beauty-scores/load', requireAuth, async (req, res) => {
    const { class_id, month } = req.query;
    if (!class_id) return res.json({ success: false, message: '缺少班级ID' });
    
    const m = month || '';
    if (!m) {
        return res.json({ success: false, message: '缺少月份参数' });
    }

    const rows = await database.all(
        'SELECT student_id, row_index, score, events, updated_at FROM beauty_scores WHERE class_id = ? AND month = ?',
        [class_id, m]
    );
    console.log('加载评分数据:', { class_id, month: m, count: rows.length });
    res.json({ success: true, data: rows });
});

// 导出美丽学分总表（多个月份，每个月份一个 sheet，格式与网页一致）
app.post('/api/beauty-scores/export', requireAuth, async (req, res) => {
    const { class_id, start_month, end_month, student_ids } = req.body;
    if (!class_id || !start_month || !end_month) {
        return res.status(400).json({ success: false, message: '缺少参数' });
    }

    logEvent('导出美丽学分总表', req, 'class_id=' + class_id + ' ' + start_month + '~' + end_month + ' [Worker]');
    try {
        const result = await workerPool.run({
            type: 'export_beauty_scores',
            data: {
                classId: class_id,
                startMonth: start_month,
                endMonth: end_month,
                studentIds: student_ids || null,
                indicatorTree: INDICATOR_TREE
            }
        });

        if (result.success) {
            const buf = Buffer.from(result.buffer);
            const filename = '美丽学分总表_' + start_month + '_' + end_month + '.xlsx';
            res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''" + encodeURIComponent(filename));
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buf);
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error('导出美丽学分总表（Worker）失败:', err);
        res.status(500).json({ success: false, message: '导出失败: ' + err.message });
    }
});

// 清除指定月份的所有评分
app.post('/api/beauty-scores/clear', requireAuth, async (req, res) => {
    const { class_id, month } = req.body;
    if (!class_id) return res.json({ success: false, message: '缺少班级ID' });
    try {
        await database.run('DELETE FROM beauty_scores WHERE class_id = ? AND month = ?', [class_id, month || '']);
        await database.run('DELETE FROM beauty_score_events WHERE class_id = ? AND month = ?', [class_id, month || '']);
        res.json({ success: true, message: '已清除' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 删除单条评分记录
app.post('/api/beauty-scores/delete-single', requireAuth, async (req, res) => {
    const { class_id, student_id, row_index, month } = req.body;
    if (!class_id || !student_id || row_index === undefined) {
        return res.json({ success: false, message: '参数不完整' });
    }
    const m = month || '';
    try {
        await database.run(
            'DELETE FROM beauty_scores WHERE class_id = ? AND student_id = ? AND row_index = ? AND month = ?',
            [class_id, String(student_id), row_index, m]
        );
        await database.run(
            `DELETE b1 FROM beauty_score_events b1
             INNER JOIN (
                 SELECT id FROM beauty_score_events
                 WHERE class_id = ? AND student_id = ? AND row_index = ? AND month = ?
                 ORDER BY created_at DESC LIMIT 1
             ) b2 ON b1.id = b2.id`,
            [class_id, String(student_id), row_index, m]
        );
        console.log('删除单条记录:', { class_id, student_id, row_index, month: m });
        res.json({ success: true, message: '已删除' });
    } catch (err) {
        console.error('删除失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 获取日历事件数据（优先从 beauty_score_events 表查询，兼容旧数据）
app.get('/api/beauty-scores/calendar-events', requireAuth, async (req, res) => {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
        return res.json({ success: false, message: '缺少日期范围' });
    }
    try {
        const currentUser = req.session.user;
        
        // 获取当前用户管理的班级ID列表
        let classIds = [];
        if (currentUser.role === 'admin') {
            const allClasses = await database.all('SELECT id FROM classes');
            classIds = allClasses.map(c => c.id);
        } else {
            const userClasses = await database.all('SELECT id FROM classes WHERE user_id = ?', [currentUser.id]);
            classIds = userClasses.map(c => c.id);
        }
        
        if (classIds.length === 0) {
            return res.json({ success: true, data: {} });
        }
        
        const placeholders = classIds.map(() => '?').join(',');
        const grouped = {};
        
        // 1. 优先从 beauty_score_events 表查询美丽学分事件
        let beautyRows = await database.all(`
            SELECT bse.entry_date, bse.month, bse.student_id, bse.row_index, bse.score, bse.event_name,
                   bse.created_at,
                   s.name as student_name,
                   c.name as class_name,
                   c.id as class_id
            FROM beauty_score_events bse
            LEFT JOIN students s ON bse.student_id = s.student_id
            LEFT JOIN classes c ON bse.class_id = c.id
            WHERE bse.class_id IN (${placeholders})
            ORDER BY bse.entry_date ASC, bse.class_id ASC, bse.created_at ASC
        `, classIds);
        
        // 如果 beauty_score_events 表没有数据，则从 beauty_scores 表查询（兼容旧数据）
        if (beautyRows.length === 0) {
            beautyRows = await database.all(`
                SELECT bs.entry_date, bs.month, bs.student_id, bs.row_index, bs.score, bs.events,
                       bs.updated_at,
                       s.name as student_name,
                       c.name as class_name,
                       c.id as class_id
                FROM beauty_scores bs
                LEFT JOIN students s ON bs.student_id = s.student_id
                LEFT JOIN classes c ON bs.class_id = c.id
                WHERE bs.events != '' AND bs.class_id IN (${placeholders})
                ORDER BY bs.entry_date ASC, bs.class_id ASC
            `, classIds);
        }
        
        // 2. 查询考勤数据（包含迟到、请假和旷课）
        const attendanceRows = await database.all(`
            SELECT a.date, a.student_id, a.status, a.late_time, a.leave_type, a.absent_time,
                   s.name as student_name,
                   c.name as class_name,
                   c.id as class_id
            FROM attendance a
            LEFT JOIN students s ON a.student_id = s.id
            LEFT JOIN classes c ON a.class_id = c.id
            WHERE a.class_id IN (${placeholders})
              AND a.status IN ('late', 'leave', 'absent')
            ORDER BY a.date ASC, a.class_id ASC
        `, classIds);
        
        // 3. 处理美丽学分事件
        beautyRows.forEach(r => {
            let date = r.entry_date;
            if (!date && r.updated_at) {
                date = r.updated_at.substring(0, 10);
            }
            if (!date) return;
            if (date < start_date || date > end_date) return;
            
            if (!grouped[date]) grouped[date] = [];
            
            const eventName = r.event_name || r.events || '';
            const score = r.score || 0;
            
            grouped[date].push({
                student_name: r.student_name || r.student_id,
                class_name: r.class_name || '未知班级',
                class_id: r.class_id,
                point_index: r.row_index,
                score: score,
                event: eventName,
                is_positive: parseFloat(score) >= 0,
                type: 'beauty_score'
            });
        });
        
        // 4. 处理考勤事件
        attendanceRows.forEach(r => {
            const date = r.date;
            if (!date) return;
            if (date < start_date || date > end_date) return;
            
            if (!grouped[date]) grouped[date] = [];
            
            let eventLabel = '';
            if (r.status === 'late') {
                eventLabel = r.late_time ? `迟到 (${r.late_time})` : '迟到';
            } else if (r.status === 'leave') {
                eventLabel = r.leave_type ? `请假 (${r.leave_type})` : '请假';
            } else if (r.status === 'absent') {
                eventLabel = r.absent_time ? `旷课 (${r.absent_time})` : '旷课';
            }
            
            grouped[date].push({
                student_name: r.student_name || r.student_id,
                class_name: r.class_name || '未知班级',
                class_id: r.class_id,
                score: 0,
                event: eventLabel,
                is_positive: false,
                type: 'attendance'
            });
        });
        
        res.json({ success: true, data: grouped });
    } catch (err) {
        console.error('获取日历事件失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// ===== 作业管理API =====

// 获取作业数据列表
app.get('/api/homework', requireAuth, async (req, res) => {
    const { semester, class_id } = req.query;
    try {
        let sql = 'SELECT * FROM homework WHERE 1=1';
        const params = [];
        if (semester) {
            sql += ' AND semester = ?';
            params.push(semester);
        }
        if (class_id) {
            sql += ' AND class_id = ?';
            params.push(class_id);
        }
        sql += ' ORDER BY semester, subject';
        const rows = await database.all(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('获取作业数据失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 添加或更新作业数据
app.post('/api/homework/save', requireAuth, async (req, res) => {
    const { semester, subject, content, class_id } = req.body;
    const currentUser = req.session.user;
    if (!semester || !subject) {
        return res.json({ success: false, message: '学期和学科不能为空' });
    }
    try {
        const existing = await database.get('SELECT id FROM homework WHERE semester = ? AND subject = ? AND class_id <=> ?', [semester, subject, class_id || null]);
        if (existing) {
            await database.run('UPDATE homework SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [content || '', existing.id]);
        } else {
            await database.run('INSERT INTO homework (semester, subject, content, class_id, created_by) VALUES (?, ?, ?, ?, ?)', 
                [semester, subject, content || '', class_id || null, currentUser.name || '']);
        }
        res.json({ success: true, message: '保存成功' });
    } catch (err) {
        console.error('保存作业数据失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 删除作业数据
app.post('/api/homework/delete', requireAuth, async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.json({ success: false, message: '缺少ID' });
    }
    try {
        await database.run('DELETE FROM homework WHERE id = ?', [id]);
        res.json({ success: true, message: '删除成功' });
    } catch (err) {
        console.error('删除作业数据失败:', err);
        res.json({ success: false, message: err.message });
    }
});

app.get('/api/homework/sample', requireAuth, (req, res) => {
    const filePath = path.join(__dirname, '学科导入样例.xlsx');
    res.download(filePath, '学科导入样例.xlsx', (err) => {
        if (err) {
            console.error('下载样例文件失败:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: '文件下载失败' });
            }
        }
    });
});

// 批量导入作业数据
app.post('/api/homework/import', requireAuth, upload.single('file'), async (req, res) => {
    const { semester, class_id } = req.body;
    const currentUser = req.session.user;
    if (!semester) {
        return res.json({ success: false, message: '请选择学期' });
    }
    if (!req.file) {
        return res.json({ success: false, message: '请上传Excel文件' });
    }
    try {
        const ExcelJS = require('exceljs');
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(req.file.path);
        const ws = wb.getWorksheet(1);
        if (!ws) {
            return res.json({ success: false, message: 'Excel文件格式错误：找不到工作表' });
        }
        const subjects = [];
        let hasHeader = false;
        let headerName = '';
        for (let i = 1; i <= ws.rowCount; i++) {
            const row = ws.getRow(i);
            const cellValue = row.getCell(1).value;
            if (i === 1) {
                headerName = String(cellValue || '').trim();
                if (headerName !== '学科') {
                    return res.json({ success: false, message: 'Excel格式错误：第一行表头必须是"学科"' });
                }
                hasHeader = true;
                continue;
            }
            const subject = String(cellValue || '').trim();
            if (subject) {
                subjects.push(subject);
            }
        }
        if (subjects.length === 0) {
            return res.json({ success: false, message: 'Excel中没有找到学科数据' });
        }
        const existingSubjects = await database.all('SELECT subject FROM homework WHERE semester = ? AND class_id <=> ?', [semester, class_id || null]);
        const existingSet = new Set(existingSubjects.map(s => s.subject));
        const duplicates = subjects.filter(s => existingSet.has(s));
        if (duplicates.length > 0) {
            return res.json({ success: false, message: `以下学科已存在：${duplicates.join(', ')}` });
        }
        let imported = 0;
        for (const subject of subjects) {
            await database.run('INSERT INTO homework (semester, subject, content, class_id, created_by) VALUES (?, ?, ?, ?, ?)',
                [semester, subject, '', class_id || null, currentUser.name || '']);
            imported++;
        }
        fs.unlinkSync(req.file.path);
        res.json({ success: true, message: `成功导入${imported}个学科` });
    } catch (err) {
        console.error('导入作业数据失败:', err);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch(e) {}
        }
        res.json({ success: false, message: err.message });
    }
});

// ===== 作业数据 API =====

// 获取作业数据（某班级某学科某天）
app.get('/api/homework-data', requireAuth, async (req, res) => {
    const { semester, class_id, subject, date } = req.query;
    const currentUser = req.session.user;
    
    if (!semester || !class_id || !subject || !date) {
        return res.json({ success: false, message: '缺少必要参数' });
    }
    
    try {
        // 获取该班级的所有学生
        const students = await database.all('SELECT id, student_id, name FROM students WHERE class_id = ?', [class_id]);
        
        // 获取已有作业数据
        const existingData = await database.all(
            'SELECT student_id, submitted, late FROM homework_data WHERE semester = ? AND class_id = ? AND subject = ? AND date = ?',
            [semester, class_id, subject, date]
        );
        
        const existingMap = new Map(existingData.map(d => [d.student_id, { submitted: d.submitted, late: d.late }]));
        
        const result = students.map(s => {
            const data = existingMap.get(s.id);
            return {
                student_id: s.id,
                student_code: s.student_id,
                name: s.name,
                submitted: data ? data.submitted : 1,  // 默认已提交
                late: data ? data.late : 0  // 默认不补交
            };
        });
        
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('获取作业数据失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 获取日历标记数据
app.get('/api/homework-data/calendar', requireAuth, async (req, res) => {
    const { semester, class_id, year, month } = req.query;
    if (!semester || !class_id || !year || !month) {
        return res.json({ success: false, message: '缺少必要参数' });
    }
    
    try {
        const y = parseInt(year);
        const m = parseInt(month);
        const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
        const endDate = `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
        
        // 获取该月的所有作业数据
        const rows = await database.all(
            'SELECT hd.date, hd.subject, s.name, hd.late FROM homework_data hd LEFT JOIN students s ON hd.student_id = s.id WHERE hd.semester = ? AND hd.class_id = ? AND hd.date >= ? AND hd.date <= ? AND hd.submitted = 0',
            [semester, class_id, startDate, endDate]
        );
        
        const result = {};
        for (const row of rows) {
            const dateKey = row.date;
            if (!result[dateKey]) result[dateKey] = {};
            if (!result[dateKey][row.subject]) result[dateKey][row.subject] = { unsubmitted: [], late: [] };
            if (row.late) {
                result[dateKey][row.subject].late.push(row.name || '');
            } else {
                result[dateKey][row.subject].unsubmitted.push(row.name || '');
            }
        }
        
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('获取日历标记失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 获取学生作业历史
app.get('/api/homework-data/student-history', requireAuth, async (req, res) => {
    const { student_id, semester } = req.query;
    
    if (!student_id) {
        return res.json({ success: false, message: '缺少必要参数' });
    }
    
    try {
        let sql = 'SELECT semester, subject, date, submitted, late FROM homework_data WHERE student_id = ?';
        let params = [student_id];
        
        if (semester) {
            sql += ' AND semester = ?';
            params.push(semester);
        }
        
        sql += ' ORDER BY date DESC';
        
        const data = await database.all(sql, params);
        res.json({ success: true, data: data });
    } catch (err) {
        console.error('获取学生作业历史失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 统计学生每学期未交作业数
app.get('/api/homework-data/student-semester-stats', requireAuth, async (req, res) => {
    const { student_id } = req.query;
    
    if (!student_id) {
        return res.json({ success: false, message: '缺少必要参数' });
    }
    
    try {
        const sql = `
            SELECT 
                semester,
                COUNT(*) as total_count,
                SUM(CASE WHEN submitted = 0 THEN 1 ELSE 0 END) as unsubmitted_count
            FROM homework_data
            WHERE student_id = ?
            GROUP BY semester
            ORDER BY 
                CASE 
                    WHEN semester LIKE '高一上%' THEN 1
                    WHEN semester LIKE '高一下%' THEN 2
                    WHEN semester LIKE '高二上%' THEN 3
                    WHEN semester LIKE '高二下%' THEN 4
                    WHEN semester LIKE '高三上%' THEN 5
                    WHEN semester LIKE '高三下%' THEN 6
                    ELSE 7
                END
        `;
        
        const data = await database.all(sql, [student_id]);
        res.json({ success: true, data: data });
    } catch (err) {
        console.error('统计学生每学期未交作业失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 保存作业数据
app.post('/api/homework-data/save', requireAuth, async (req, res) => {
    const { semester, class_id, subject, date, unsubmitted_student_ids, late_student_ids } = req.body;
    const currentUser = req.session.user;
    
    if (!semester || !class_id || !subject || !date) {
        return res.json({ success: false, message: '缺少必要参数' });
    }
    
    try {
        // 获取该班级的所有学生
        const students = await database.all('SELECT id FROM students WHERE class_id = ?', [class_id]);
        const unsubmittedSet = new Set((unsubmitted_student_ids || []).map(Number));
        const lateSet = new Set((late_student_ids || []).map(Number));
        
        await database.transaction(async () => {
            // 先删除该班级该学科该天的所有旧数据
            await database.run(
                'DELETE FROM homework_data WHERE semester = ? AND class_id = ? AND subject = ? AND date = ?',
                [semester, class_id, subject, date]
            );
            
            // 批量插入新数据
            for (const s of students) {
                const submitted = unsubmittedSet.has(s.id) ? 0 : 1;
                const late = lateSet.has(s.id) ? 1 : 0;
                await database.run(
                    'INSERT INTO homework_data (semester, class_id, subject, date, student_id, submitted, late, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [semester, class_id, subject, date, s.id, submitted, late, currentUser.name || '']
                );
            }
        });
        
        res.json({ success: true, message: '保存成功' });
    } catch (err) {
        console.error('保存作业数据失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 后台管理页面
app.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 清除所有数据（仅限管理员）
app.post('/api/admin/clear-all-data', requireAuth, async (req, res) => {
    const currentUser = req.session.user;
    if (currentUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: '仅管理员可执行此操作' });
    }

    try {
        // 按顺序清除所有业务数据
        await database.run('DELETE FROM scores');
        await database.run('DELETE FROM beauty_scores');
        await database.run('DELETE FROM beauty_events');
        await database.run('DELETE FROM students');
        await database.run('DELETE FROM classes');
        await database.run('DELETE FROM exams');
        // 保留用户表，但清除普通用户（保留管理员）
        await database.run("DELETE FROM users WHERE role != 'admin'");
        // 重置管理员密码确保可用
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await database.run("UPDATE users SET password = ?, plain_password = 'admin123' WHERE employee_id = 'admin'", [hashedPassword]);
        
        res.json({ success: true, message: '所有数据已清除（保留管理员账号）' });
    } catch (err) {
        console.error('清除数据失败:', err);
        res.status(500).json({ success: false, message: '清除数据失败: ' + err.message });
    }
});

// ===== 考勤 API =====

// 获取考勤记录
app.get('/api/attendance', requireAuth, async (req, res) => {
    const { class_id, date } = req.query;
    if (!class_id || !date) {
        return res.json({ success: false, message: '缺少参数' });
    }
    try {
        const rows = await database.all(
            'SELECT * FROM attendance WHERE class_id = ? AND date = ?',
            [class_id, date]
        );
        let dataVersion = null;
        rows.forEach(r => {
            r.late_time = r.late_time || '';
            r.leave_time = r.leave_time || '';
            r.leave_type = r.leave_type || '';
            r.leave_with_note = r.leave_with_note || '0';
            r.leave_duration = r.leave_duration || '';
            r.absent_time = r.absent_time || '';
            if (r.created_at) {
                const ts = new Date(r.created_at).getTime();
                if (dataVersion === null || ts > dataVersion) dataVersion = ts;
            }
        });
        res.json({ success: true, data: rows, data_version: dataVersion });
    } catch (err) {
        console.error('获取考勤记录失败:', err);
        res.status(500).json({ success: false, message: '获取考勤记录失败' });
    }
});

// ===== 请假单图片上传/删除 =====

// 上传请假单图片
app.post('/api/attendance/leave-image/upload', requireAuth, upload.array('images', 20), async (req, res) => {
    try {
        const { class_id, student_id, date } = req.body;
        if (!class_id || !student_id || !date) {
            return res.json({ success: false, message: '缺少参数' });
        }
        const files = req.files || [];
        const images = files.map(f => ({
            filename: f.filename,
            url: '/leave-images/' + f.filename
        }));
        res.json({ success: true, data: images });
    } catch (err) {
        console.error('上传图片失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 删除请假单图片
app.post('/api/attendance/leave-image/delete', requireAuth, async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) return res.json({ success: false, message: '缺少文件名' });
        const filePath = path.join(IMAGE_DIR, path.basename(filename)); // 防止目录穿越
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true });
        } else {
            res.json({ success: false, message: '文件不存在' });
        }
    } catch (err) {
        console.error('删除图片失败:', err);
        res.json({ success: false, message: err.message });
    }
});

// 保存考勤记录
app.post('/api/attendance/save', requireAuth, async (req, res) => {
    const { class_id, date, records, clientId, timestamp, data_version } = req.body;
    if (!class_id || !date || !Array.isArray(records)) {
        return res.json({ success: false, message: '参数错误' });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (date > today) {
        return res.json({ success: false, message: '不允许写入未来日期的考勤数据' });
    }

    const contentHash = crypto.createHash('md5')
        .update(JSON.stringify({ class_id, date, records }))
        .digest('hex');
    if (isDuplicateWrite('attendance', `${class_id}_${date}`, contentHash)) {
        return res.json({ success: true, message: '数据已保存（去重）', deduplicated: true });
    }

    try {
        if (data_version !== undefined && data_version !== null) {
            const existingRows = await database.all(
                'SELECT id, created_at FROM attendance WHERE class_id = ? AND date = ?',
                [class_id, date]
            );
            for (const row of existingRows) {
                if (row.created_at) {
                    const rowTs = new Date(row.created_at).getTime();
                    if (rowTs > data_version) {
                        return res.json({
                            success: false,
                            conflict: true,
                            message: '考勤数据已被其他设备修改，请刷新页面后重试'
                        });
                    }
                }
            }
        } else if (data_version === null) {
            const existingRows = await database.all(
                'SELECT id FROM attendance WHERE class_id = ? AND date = ?',
                [class_id, date]
            );
            if (existingRows.length > 0) {
                return res.json({
                    success: false,
                    conflict: true,
                    message: '考勤数据已被其他设备修改，请刷新页面后重试'
                });
            }
        }

        for (const record of records) {
            const { student_id, status, remark, late_time, leave_time, leave_type, leave_with_note, leave_duration, absent_time } = record;
            const hasLeaveImages = (leave_with_note === '1' || leave_with_note === 1) && remark;
            if (status === 'present' && !hasLeaveImages) {
                await database.run(
                    'DELETE FROM attendance WHERE class_id = ? AND student_id = ? AND date = ?',
                    [class_id, student_id, date]
                );
            } else {
                const existing = await database.get(
                    'SELECT id FROM attendance WHERE class_id = ? AND student_id = ? AND date = ?',
                    [class_id, student_id, date]
                );
                if (existing) {
                    await database.run(
                        'UPDATE attendance SET status = ?, remark = ?, late_time = ?, leave_time = ?, leave_type = ?, leave_with_note = ?, leave_duration = ?, absent_time = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [status || 'present', remark || '', late_time || '', leave_time || '', leave_type || '', leave_with_note || '0', leave_duration || '', absent_time || '', existing.id]
                    );
                } else {
                    await database.run(
                        'INSERT INTO attendance (class_id, student_id, date, status, remark, late_time, leave_time, leave_type, leave_with_note, leave_duration, absent_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [class_id, student_id, date, status || 'present', remark || '', late_time || '', leave_time || '', leave_type || '', leave_with_note || '0', leave_duration || '', absent_time || '']
                    );
                }
            }
        }
        res.json({ success: true, message: '保存成功', data_version: Date.now() });
    } catch (err) {
        console.error('保存考勤记录失败:', err);
        res.status(500).json({ success: false, message: '保存失败: ' + err.message });
    }
});

// 导出考勤表 Excel
app.post('/api/attendance/export', requireAuth, async (req, res) => {
    const { class_id, start_date, end_date, student_ids } = req.body;
    logEvent('导出考勤表', req, 'class_id=' + class_id + ' ' + start_date + '~' + end_date + ' [Worker]');
    if (!class_id || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: '缺少参数' });
    }

    try {
        const attendanceData = await database.all(
            'SELECT * FROM attendance WHERE class_id = ? AND date >= ? AND date <= ? ORDER BY date',
            [class_id, start_date, end_date]
        );

        const result = await workerPool.run({
            type: 'export_attendance',
            data: {
                classId: class_id,
                startDate: start_date,
                endDate: end_date,
                studentIds: student_ids || null,
                attendanceData: attendanceData
            }
        });

        if (result.success) {
            const buf = Buffer.from(result.buffer);
            const filename = '考勤表_' + start_date + '_' + end_date + '.xlsx';
            res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''" + encodeURIComponent(filename));
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buf);
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error('导出考勤表（Worker）失败:', err);
        res.status(500).json({ success: false, message: '导出失败: ' + err.message });
    }
});

// 成绩分析页面
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ===== 学生周期统计 API =====
app.get('/api/student/period-stats', requireAuth, async (req, res) => {
    try {
        const employee_id = req.session.user.employee_id;
        const role = req.session.user.role;
        const startMonth = req.query.start_month || '';
        const endMonth = req.query.end_month || '';

        if (role !== 'student') {
            return res.json({ success: false, message: '仅学生可查看' });
        }
        if (!startMonth || !endMonth) {
            return res.json({ success: false, message: '缺少月份参数' });
        }

        const student = await database.get('SELECT * FROM students WHERE student_id = ?', [employee_id]);
        if (!student) {
            return res.json({ success: false, message: '学生信息不存在' });
        }

        const startDate = startMonth + '-01';
        const today = new Date().toISOString().slice(0, 10);
        const rawEndDate = endMonth + '-31';
        const endDate = rawEndDate > today ? today : rawEndDate;

        function timeToMinutes(timeStr) {
            if (!timeStr) return 0;
            const parts = timeStr.split(':');
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }

        const BASE_MINUTES = 7 * 60 + 50;

        // 查询考勤记录
        const attendanceRows = await database.all(`
            SELECT date, status, late_time, absent_time, leave_type, leave_duration
            FROM attendance
            WHERE student_id = ? AND date >= ? AND date <= ?
            ORDER BY date ASC
        `, [student.id, startDate, endDate]);

        // 查询美丽学分事件
        const beautyRows = await database.all(`
            SELECT entry_date, score, event_name
            FROM beauty_score_events
            WHERE student_id = ? AND entry_date >= ? AND entry_date <= ?
            ORDER BY entry_date ASC
        `, [student.student_id, startDate, endDate]);

        let finalBeautyRows = beautyRows;
        if (beautyRows.length === 0) {
            finalBeautyRows = await database.all(`
                SELECT entry_date, score, events as event_name
                FROM beauty_scores
                WHERE student_id = ? AND entry_date >= ? AND entry_date <= ? AND events != ''
                ORDER BY entry_date ASC
            `, [student.student_id, startDate, endDate]);
        }

        // 查询作业数据
        const homeworkRows = await database.all(`
            SELECT date, subject
            FROM homework_data
            WHERE student_id = ? AND date >= ? AND date <= ? AND submitted = 0
            ORDER BY date ASC
        `, [student.id, startDate, endDate]);

        // 统计考勤
        let totalLateMinutes = 0;
        let totalAbsentMinutes = 0;
        let leaveCount = 0;
        const lateDates = new Set();
        const absentDates = new Set();
        const leaveDates = new Set();
        const attendanceDetails = [];

        attendanceRows.forEach(r => {
            const lateMin = timeToMinutes(r.late_time);
            const absentMin = timeToMinutes(r.absent_time);
            const lateDiff = lateMin > 0 ? Math.max(0, lateMin - BASE_MINUTES) : 0;
            const absentDiff = absentMin > 0 ? Math.max(0, absentMin - BASE_MINUTES) : 0;

            if (r.status === 'late') {
                totalLateMinutes += lateDiff;
                lateDates.add(r.date);
            } else if (r.status === 'absent') {
                totalAbsentMinutes += absentDiff;
                absentDates.add(r.date);
            } else if (r.status === 'leave') {
                leaveCount++;
                leaveDates.add(r.date);
            }
            attendanceDetails.push({
                date: r.date,
                status: r.status,
                late_time: lateDiff > 0 ? String(lateDiff) : '',
                absent_time: absentDiff > 0 ? String(absentDiff) : '',
                leave_type: r.leave_type || '',
                leave_duration: r.leave_duration || ''
            });
        });

        // 计算周期内到今天的总天数
        const startD = new Date(startDate);
        const endD = new Date(endDate);
        const totalDays = Math.max(0, Math.floor((endD - startD) / (1000 * 60 * 60 * 24)) + 1);
        const exceptionDays = new Set([...lateDates, ...absentDates, ...leaveDates]);
        const normalCount = Math.max(0, totalDays - exceptionDays.size);

        // 美丽学分详情
        const beautyDetails = finalBeautyRows.map(r => ({
            date: r.entry_date,
            score: r.score,
            event_name: r.event_name || ''
        }));

        // 按日期合并所有事件
        const dateMap = {};
        attendanceDetails.forEach(a => {
            if (!dateMap[a.date]) dateMap[a.date] = { date: a.date, attendance: [], beauty: [], homework: [] };
            dateMap[a.date].attendance.push(a);
        });
        beautyDetails.forEach(b => {
            if (!dateMap[b.date]) dateMap[b.date] = { date: b.date, attendance: [], beauty: [], homework: [] };
            dateMap[b.date].beauty.push(b);
        });
        homeworkRows.forEach(h => {
            if (!dateMap[h.date]) dateMap[h.date] = { date: h.date, attendance: [], beauty: [], homework: [] };
            dateMap[h.date].homework.push(h);
        });

        const dailyRecords = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

        res.json({
            success: true,
            data: {
                student_name: student.name,
                student_id: student.student_id,
                start_month: startMonth,
                end_month: endMonth,
                stats: {
                    normal_count: normalCount,
                    total_late_minutes: totalLateMinutes,
                    total_absent_minutes: totalAbsentMinutes,
                    leave_count: leaveCount,
                    homework_missing_count: homeworkRows.length
                },
                daily_records: dailyRecords
            }
        });
    } catch (err) {
        console.error('获取周期统计失败:', err);
        res.status(500).json({ success: false, message: '获取周期统计失败' });
    }
});

// ===== 全局错误处理（防崩溃，放最后）=====
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack || err);
    if (!res.headersSent) {
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 404 处理（必须放在所有路由之后）
app.use((req, res) => {
    if (!res.headersSent) {
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ success: false, message: '接口不存在' });
        }
        res.status(404).sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// 启动服务器
async function startServer() {
    await initDatabase();
    
    // 仅在 exams 表为空时插入初始化考试数据（避免每次重启重建导致 ID 错乱）
    const examCount = await database.get('SELECT COUNT(*) as count FROM exams');
    if (examCount.count === 0) {
        const fixedExams = [
        { name: '高一上期中', date: '2024-04-15' },
        { name: '高一上期末', date: '2024-07-01' },

        { name: '高一下期中', date: '2025-04-15' },
        { name: '高一下期末', date: '2025-07-01' },

        { name: '高二上期中', date: '2025-11-15' },
        { name: '高二上期末', date: '2026-01-15' },

        { name: '高二下期中', date: '2026-04-15' },
        { name: '高二下期末', date: '2026-07-01' },

        { name: '高三上期中', date: '2026-11-15' },
        { name: '高三上期末', date: '2027-01-15' },

        { name: '高三下期中', date: '2027-04-15' },
        { name: '高三下期末', date: '2027-06-01' }
    ];

        for (const exam of fixedExams) {
            await database.run(
                'INSERT INTO exams (name, date) VALUES (?, ?)',
                [exam.name, exam.date]
            );
        }
    }
    
    // ===== WebSocket + HTTP 启动 =====
    const { server, io } = createWebSocketServer(app, sessionMiddleware, {
        onSocketActivity(socket) {
            const req = socket.request;
            if (!req.session?.user) return;
            req.session.lastActivityAt = Date.now();
            req.session.save((err) => {
                if (err) console.warn('[Session] WebSocket 活动时间保存失败:', err.message);
            });
        }
    });
    app.set('io', io);

    app.get('/api/worker-pool-stats', (req, res) => {
        try {
            const stats = {
                status: 'running',
                threads: workerPool.threads || 0,
                queueSize: workerPool.queueSize || 0,
                completed: workerPool.completed || 0,
                duration: workerPool.duration || 0,
                utilization: workerPool.utilization || 0
            };
            res.json(stats);
        } catch (err) {
            res.json({ status: 'error', message: err.message });
        }
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('=========================================');
        console.log('  成绩分析系统已启动 (WebSocket 已启用)');
        console.log('  本地访问: http://127.0.0.1:' + PORT);
        console.log('  局域网访问: http://' + LOCAL_IP + ':' + PORT);
        console.log('  WS:    ws://' + LOCAL_IP + ':' + PORT);
        console.log('  班级账号最大连接数: ' + CLASS_MAX_SESSIONS);
        console.log('  会话空闲超时: ' + SESSION_IDLE_MS / 60000 + ' 分钟无操作需重新登录');
        console.log('=========================================');
        console.log('默认管理员: admin / admin123');
    });
}

startServer();
