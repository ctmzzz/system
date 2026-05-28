require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const v8 = require('v8');
const { initDatabase, database, DB_CONFIG } = require('./database-mysql');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const MySQLSessionStore = require('express-mysql-session')(session);
const { createWebSocketServer, getSessionCount, broadcastToClass, kickUserSessions, kickSocketsForSession, CLASS_MAX_SESSIONS, TEACHER_MAX_SESSIONS } = require('./ws-server');
const workerPool = require('./worker-pool');
const http = require('http');

// ===== 全局错误处理：防止EPIPE等错误导致进程崩溃 =====
process.on('uncaughtException', (err) => {
    if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
        console.warn('[安全] 客户端提前断开连接，已忽略错误:', err.message);
    } else {
        console.error('[致命错误] 未捕获的异常:', err);
        console.error(err.stack);
        // 非EPIPE错误可以选择继续运行或重启，根据情况决定
        // process.exit(1); // 如果是致命错误才退出
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.warn('[警告] 未处理的Promise拒绝:', reason);
    // 不要让进程崩溃
});

// ===== 安全发送文件函数：防止客户端断开导致EPIPE =====
function safeSendBuffer(req, res, buffer, filename) {
    return new Promise((resolve, reject) => {
        // 检查客户端是否还连接
        if (req.socket.destroyed) {
            console.warn('[安全] 客户端已断开，取消发送:', req.path);
            resolve(false);
            return;
        }

        // 设置正确的响应头
        res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''" + encodeURIComponent(filename));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        let sent = false;
        
        // 监听响应错误
        res.on('error', (err) => {
            if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
                console.warn('[安全] 客户端在下载过程中断开:', filename);
            } else {
                console.error('[响应错误]', filename, ':', err);
            }
            if (!sent) {
                sent = true;
                resolve(false);
            }
        });

        // 监听socket错误
        req.socket.on('error', (err) => {
            if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
                console.warn('[安全] Socket错误，客户端断开:', filename);
            }
        });

        // 发送数据
        try {
            res.send(buffer);
            sent = true;
            resolve(true);
        } catch (err) {
            if (!sent) {
                sent = true;
                reject(err);
            }
        }
    });
}

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
function logEvent(msg, req, extra = '', level = 'info') {
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
    const logMsg = `[${time}] [${ip}] [${user}] ${msg} ${extra}`.trim();
    if (level === 'warn') {
        // 添加 [警告] 关键词，让 monitor 能正确识别为警告级别
        console.warn(`[警告] ${logMsg}`);
    } else {
        console.log(logMsg);
    }
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
const IMAGE_DIR = 'C:\\serverimage';
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

// ===== 访问控制：只允许通过反向代理访问 =====
app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const isLocalRequest = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
    const isFromProxy = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
    
    if (!isLocalRequest && !isFromProxy) {
        console.warn(`[安全] 拒绝直接访问 3001 端口: ${clientIP}`);
        // 直接关闭连接，模拟连接失败
        res.destroy();
        return;
    }
    next();
});

// 中间件
app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'same-origin' }
}));
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
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

// ===== 滑动验证码系统 =====
const captchaStore = new Map(); // token -> { answer, expires }
const CAPTCHA_EXPIRE_MS = 5 * 60 * 1000; // 5分钟过期
const CHECK_FOLDER_PATH = path.join(__dirname, 'check');
const SLIDE_TOLERANCE = 3; // 允许误差3%

// 读取check文件夹中的图片
function getCheckImages() {
    try {
        const files = fs.readdirSync(CHECK_FOLDER_PATH);
        return files.filter(f => /\.(png|jpg|jpeg)$/i.test(f)).map(f => path.join(CHECK_FOLDER_PATH, f));
    } catch (e) {
        console.error('[验证码] 读取check文件夹失败:', e);
        return [];
    }
}

const checkImages = getCheckImages();
console.log('[验证码] 可用图片:', checkImages.length);

function generateSlideCaptcha() {
    if (checkImages.length === 0) {
        throw new Error('没有可用的验证图片');
    }
    
    const imagePath = checkImages[Math.floor(Math.random() * checkImages.length)];
    const targetXPercent = Math.floor(Math.random() * 40) + 30; // X轴：30%-70%
    const targetYPercent = Math.floor(Math.random() * 40) + 30; // Y轴：30%-70%
    const shapeType = Math.floor(Math.random() * 10);

    // 生成干扰缺口：X/Y均不与正确缺口重叠（差≥20%）
    let decoyXPercent, decoyYPercent;
    do {
        decoyXPercent = Math.floor(Math.random() * 40) + 30;
        decoyYPercent = Math.floor(Math.random() * 40) + 30;
    } while (Math.abs(decoyXPercent - targetXPercent) < 20 || Math.abs(decoyYPercent - targetYPercent) < 20);
    const decoyShapeType = Math.floor(Math.random() * 10);
    
    const token = crypto.randomBytes(16).toString('hex');
    captchaStore.set(token, { 
        answer: targetXPercent, 
        expires: Date.now() + CAPTCHA_EXPIRE_MS,
        yPercent: targetYPercent,
        shapeType: shapeType,
        decoyXPercent: decoyXPercent,
        decoyYPercent: decoyYPercent,
        decoyShapeType: decoyShapeType
    });
    
    return { 
        token, 
        imagePath, 
        targetXPercent, 
        targetYPercent,
        shapeType: shapeType,
        decoyXPercent: decoyXPercent,
        decoyYPercent: decoyYPercent,
        decoyShapeType: decoyShapeType
    };
}

function verifySlideCaptcha(token, userXPercent) {
    const record = captchaStore.get(token);
    if (!record) return false;
    if (Date.now() > record.expires) {
        captchaStore.delete(token);
        return false;
    }
    captchaStore.delete(token);
    return Math.abs(userXPercent - record.answer) <= SLIDE_TOLERANCE;
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
    console.warn('[警告] 账号 ' + employee_id + ' 登录失败 ' + record.count + ' 次');
}

function getAccountFailedCount(employee_id) {
    const record = accountFailedAttempts.get(employee_id);
    return record ? record.count : 0;
}

function clearAccountFailed(employee_id) {
    accountFailedAttempts.delete(employee_id);
}

// ===== IP跟踪和锁定机制 =====
const ipAttempts = new Map(); // ip -> { totalFails, captchaFails, cooldownUntil, locked, lockTime, reason }
const CAPTCHA_FAIL_COOLDOWN_THRESHOLD = 5; // 5次失败后进入冷却（单轮）
const CAPTCHA_FAIL_LOCK_THRESHOLD = 10; // 累计10次失败后锁定IP
const COOLDOWN_TIME_MS = 10 * 60 * 1000; // 10分钟冷却

function getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

function getIpRecord(ip) {
    if (!ipAttempts.has(ip)) {
        ipAttempts.set(ip, { totalFails: 0, captchaFails: 0, cooldownUntil: 0, locked: false, lockTime: 0, reason: '' });
    }
    return ipAttempts.get(ip);
}

function isIpLocked(ip) {
    const record = getIpRecord(ip);
    return record.locked;
}

function isIpInCooldown(ip) {
    const record = getIpRecord(ip);
    return Date.now() < record.cooldownUntil;
}

function recordCaptchaFailed(ip) {
    const record = getIpRecord(ip);
    if (record.cooldownUntil > 0 && Date.now() >= record.cooldownUntil) {
        record.captchaFails = 0;
        record.cooldownUntil = 0;
    }
    record.captchaFails++;
    record.totalFails = (record.totalFails || 0) + 1;
    
    if (record.totalFails >= CAPTCHA_FAIL_LOCK_THRESHOLD) {
        record.locked = true;
        record.lockTime = Date.now();
        record.lockFailCount = record.totalFails;
        record.reason = '累计验证码验证失败次数过多';
        console.warn('[警告] IP已锁定(' + record.totalFails + '次累计失败): ' + ip + ' 原因: ' + record.reason);
        record.captchaFails = 0;
        record.totalFails = 0;
        record.cooldownUntil = 0;
    } else if (record.captchaFails >= CAPTCHA_FAIL_COOLDOWN_THRESHOLD) {
        record.cooldownUntil = Date.now() + COOLDOWN_TIME_MS;
        console.warn('[警告] IP进入冷却(' + record.captchaFails + '/' + record.totalFails + '次失败): ' + ip + ' 冷却结束: ' + new Date(record.cooldownUntil).toLocaleString());
    }
}

function recordCaptchaSuccess(ip) {
    const record = getIpRecord(ip);
    if (!record.locked) {
        record.captchaFails = 0;
        record.totalFails = 0;
        record.cooldownUntil = 0;
    }
}

function unlockIp(ip) {
    const record = getIpRecord(ip);
    record.locked = false;
    record.captchaFails = 0;
    record.totalFails = 0;
    record.cooldownUntil = 0;
    record.lockTime = 0;
    record.reason = '';
    console.log('[安全] IP已解锁: ' + ip);
}

function getLockedIps() {
    const locked = [];
    for (const [ip, record] of ipAttempts.entries()) {
        if (record.locked) {
            locked.push({
                ip: ip,
                lockTime: record.lockTime,
                reason: record.reason,
                captchaFails: record.lockFailCount || CAPTCHA_FAIL_LOCK_THRESHOLD
            });
        }
    }
    return locked;
}

// API 路由禁用缓存（确保删除后其他页面不显示旧数据）
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Session 中间件（必须在路由前面）
const sessionStore = new MySQLSessionStore({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database: DB_CONFIG.database,
    createDatabaseTable: true,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000 * 7
});
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: null,
        httpOnly: true,
        sameSite: 'lax'
    }
});
app.use(sessionMiddleware);
app.use(enforceSessionIdle);

// 定期清理 MemoryStore 中的过期 session，防止内存泄漏
setInterval(() => {
    const sessions = sessionMiddleware.store?.sessions;
    if (!sessions) return;
    const keys = Object.keys(sessions);
    if (keys.length > 50) {
        const now = Date.now();
        const expireThreshold = now - 24 * 60 * 60 * 1000; // 无过期时间的 session 24 小时后清理
        let cleaned = 0;
        for (const sid of keys) {
            try {
                const sess = sessions[sid];
                if (!sess) continue;
                const data = JSON.parse(sess);
                const expires = data.cookie?.expires ? new Date(data.cookie.expires).getTime() : 0;
                const lastActivity = data.lastActivityAt || 0;
                // 有过期时间且已过期的，或无过期时间且 24 小时无活动的
                if ((expires && expires < now) || (!expires && lastActivity && lastActivity < expireThreshold)) {
                    sessionMiddleware.store.destroy(sid);
                    cleaned++;
                }
            } catch (e) {}
        }
        if (cleaned > 0) console.log(`[Session] 清理了 ${cleaned} 个过期 session，剩余 ${keys.length - cleaned} 个`);
    }
}, 5 * 60 * 1000); // 每5分钟清理一次

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
    const pages = { admin: '/admin', teacher: '/dashboard', class: '/total-table', student: '/dashboard', course: '/course-hours' };
    return pages[role] || '/dashboard';
}

// 角色允许的页面
const ROLE_PAGES = {
    admin:   ['/admin'],
    course:  ['/course-hours', '/teacher-detail'],
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
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.sendFile(path.join(__dirname, 'public', htmlFile));
    }];
}

app.get('/admin', ...servePage('/admin', 'admin.html'));
app.get('/course-hours', ...servePage('/course-hours', 'course-hours.html'));
app.get('/teacher-detail', ...servePage('/teacher-detail', 'teacher-detail.html'));
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

// check文件夹静态访问
app.use('/check', express.static(path.join(__dirname, 'check')));

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

// 从monitor访问的自动登录路由（仅允许本地访问）
app.get('/monitor-auto-login', async (req, res) => {
    const clientIP = getClientIP(req);
    // 仅允许本地访问
    if (!clientIP.includes('127.0.0.1') && 
        !clientIP.includes('::1') && 
        !clientIP.includes('localhost') &&
        clientIP !== '::ffff:127.0.0.1') {
        return res.status(403).send('Access denied');
    }
    
    // 查找admin用户
    let adminUser = await database.get('SELECT * FROM users WHERE role = ?', ['admin']);
    if (!adminUser) {
        // 如果没有admin用户，查找第一个用户
        adminUser = await database.get('SELECT * FROM users LIMIT 1');
    }
    
    if (!adminUser) {
        return res.status(404).send('No admin user found');
    }
    
    // 自动登录为admin用户
    req.session.user = {
        id: adminUser.id,
        employee_id: adminUser.employee_id,
        name: adminUser.name,
        role: adminUser.role || 'admin'
    };
    req.session.lastActivityAt = Date.now();
    sessionLastActivity.set(req.sessionID, Date.now());
    userSessions.set(adminUser.id, { sessionId: req.sessionID, ip: clientIP });
    
    logEvent(`[Monitor] 自动登录成功: ${adminUser.name}(${adminUser.employee_id}) [${adminUser.role}]`, req);
    
    // 重定向到admin页面
    res.redirect('/admin');
});

// 获取滑动验证码
app.get('/api/slide-captcha/generate', (req, res) => {
    try {
        const ip = getClientIP(req);

        if (isIpLocked(ip)) {
            return res.status(403).json({ success: false, locked: true, message: '您的IP已被临时禁止访问，请联系管理员' });
        }

        if (isIpInCooldown(ip)) {
            const record = getIpRecord(ip);
            const remaining = Math.ceil((record.cooldownUntil - Date.now()) / 1000);
            return res.status(429).json({ success: false, cooldown: true, remaining: remaining, message: '验证失败次数过多，请等待 ' + remaining + ' 秒后重试' });
        }

        const captcha = generateSlideCaptcha();
        const imageName = path.basename(captcha.imagePath);
        res.json({ 
            success: true, 
            token: captcha.token, 
            imageUrl: '/check/' + imageName,
            targetXPercent: captcha.targetXPercent,
            targetYPercent: captcha.targetYPercent,
            shapeType: captcha.shapeType,
            decoyXPercent: captcha.decoyXPercent,
            decoyYPercent: captcha.decoyYPercent,
            decoyShapeType: captcha.decoyShapeType
        });
    } catch (e) {
        res.status(500).json({ success: false, message: '生成验证码失败' });
    }
});

// 验证滑动验证码
app.post('/api/slide-captcha/verify', (req, res) => {
    const { token, x } = req.body;
    const ip = getClientIP(req);
    
    if (!token || x === undefined) {
        return res.status(400).json({ success: false, message: '参数错误' });
    }
    
    // 检查IP是否被锁定
    if (isIpLocked(ip)) {
        return res.status(403).json({ success: false, message: '您的IP已被临时禁止访问，请联系管理员' });
    }
    
    // 检查IP是否在冷却期
    if (isIpInCooldown(ip)) {
        const record = getIpRecord(ip);
        const remaining = Math.ceil((record.cooldownUntil - Date.now()) / 1000);
        return res.status(429).json({ 
            success: false, 
            message: `验证失败次数过多，请等待 ${remaining} 秒后重试` 
        });
    }
    
    const success = verifySlideCaptcha(token, x);
    
    if (success) {
        recordCaptchaSuccess(ip);
        res.json({ success: true });
    } else {
        recordCaptchaFailed(ip);
        const record = getIpRecord(ip);
        let message = '验证失败，请重试';
        if (record.locked) {
            message = '您的IP已被临时禁止访问，请联系管理员';
        } else if (record.cooldownUntil > Date.now()) {
            const remainingSeconds = Math.ceil((record.cooldownUntil - Date.now()) / 1000);
            message = `验证失败次数过多，请等待 ${remainingSeconds} 秒后重试`;
        } else if (record.captchaFails >= 3) {
            const remaining = CAPTCHA_FAIL_COOLDOWN_THRESHOLD - record.captchaFails;
            message = `验证失败，还可尝试 ${remaining} 次`;
        }
        res.json({ success: false, message });
    }
});

// 获取当前登录用户信息（不需要认证，未登录时返回 null）
app.get('/api/current-user', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ success: true, data: req.session.user });
    } else {
        res.json({ success: true, data: null });
    }
});

// 登录API（带 WAF 防暴力破解 + 账户冻结）
app.post('/api/login', rateLimitLogin, async (req, res) => {
    const { employee_id, password, remember_me = false } = req.body;
    const ip = getClientIP(req);

    if (!employee_id || !password) {
        return res.status(400).json({ success: false, message: '请输入账号和密码' });
    }
    
    // 检查IP是否被锁定
    if (isIpLocked(ip)) {
        logEvent(`IP ${ip} 已锁定，拒绝登录请求`, req);
        return res.status(403).json({ success: false, message: '您的IP已被临时禁止访问，请联系管理员' });
    }

    // 检查是否为异常账号
    if (abnormalAccounts.has(employee_id)) {
        const acc = abnormalAccounts.get(employee_id);
        logEvent(`账号 ${acc.name}(${employee_id}) 异常，已被冻结`, req);
        return res.status(403).json({ success: false, message: '账户异常，请联系管理员' });
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

        // 根据实际角色决定多端登录限制
        const maxSessions = user.role === 'class' ? CLASS_MAX_SESSIONS : 1;
        const currentSessions = getSessionCount(user.id);
        if (currentSessions >= maxSessions) {
            logEvent(`${user.role === 'class' ? '班级账号' : '账号'} ${user.name}(${employee_id}) 已达最大连接数 ${maxSessions}，拒绝新登录`, req);
            return res.status(429).json({
                success: false,
                message: `拒绝登录:该账号已有 ${maxSessions} 个设备在线`
            });
        }

        req.session.user = {
            id: user.id,
            employee_id: user.employee_id,
            name: user.name,
            role: user.role,
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
        logEvent(`登录失败（账号不存在）: ${employee_id}`, req, '', 'warn');
        if (getAccountFailedCount(employee_id) >= FREEZE_THRESHOLD) {
            return res.status(403).json({ success: false, message: '账户已被冻结，请联系管理员' });
        }
        return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
        recordFailedLogin(req);
        recordAccountFailed(employee_id);
        logEvent(`登录失败（密码错误）: ${employee_id}`, req, '', 'warn');
        if (getAccountFailedCount(employee_id) >= FREEZE_THRESHOLD) {
            freezeAccount(employee_id, user.id, user.name);
            return res.status(403).json({ success: false, message: '账户已被冻结，请联系管理员' });
        }
        return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    clearFailedLogin(req);
    clearAccountFailed(employee_id);

    if (user.role === 'admin') {
        logEvent('管理员账号 ' + user.name + '(' + employee_id + ') 尝试从登录页面登录，已被拦截', req, '', 'warn');
        return res.status(403).json({ success: false, message: '非法访问', adminBlocked: true });
    }

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
        console.warn('[警告] 账号 ' + name + '(' + employee_id + ') 已被冻结（失败次数过多）');
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

function requireCourseManager(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'course') {
        return res.status(403).json({ success: false, message: '仅课程管理员可操作' });
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
        admin:     { pattern: /^.{1,20}$/, msg: '' }, // 管理员不限
        course:    { pattern: /^.{1,20}$/, msg: '' }  // 课程管理员不限
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
        logEvent('查询用户列表', req, `共${users.length}个用户`);
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
    const validRoles = ['admin', 'teacher', 'student', 'class', 'course'];
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
    logEvent('添加用户', req, `账号=${employee_id}, 姓名=${name}, 角色=${userRole}`);
    
    res.json({ success: true, message: '添加成功', id: result.lastInsertRowid });
});

// 编辑用户
app.put('/api/users/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { employee_id, password, name, role } = req.body;

    if (!employee_id || !password || !name) {
        return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    const validRoles = ['admin', 'teacher', 'student', 'class', 'course'];
    const userRole = validRoles.includes(role) ? role : 'teacher';

    const idCheck = validateAccountId(String(employee_id), userRole);
    if (!idCheck.valid) {
        return res.status(400).json({ success: false, message: idCheck.message });
    }

    const existing = await database.get('SELECT * FROM users WHERE employee_id = ? AND id != ?', [employee_id, id]);
    if (existing) {
        return res.status(400).json({ success: false, message: '工号/学号已被其他用户使用' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await database.run('UPDATE users SET employee_id = ?, password = ?, plain_password = ?, name = ?, role = ? WHERE id = ?',
        [employee_id, hashedPassword, password, name, userRole, id]);
    logEvent('编辑用户', req, `id=${id}, 账号=${employee_id}, 姓名=${name}, 角色=${userRole}`);

    res.json({ success: true, message: '修改成功' });
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
                    const roleMap = { '教师': 'teacher', '管理员': 'admin', '学生': 'student', '班级': 'class', '课程管理员': 'course', '课程': 'course', 'teacher': 'teacher', 'admin': 'admin', 'student': 'student', 'class': 'class', 'course': 'course' };
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

    logEvent('批量导入用户', req, `成功${success}条，失败${failed}条`);
    res.json({ success: true, message: `导入完成：成功${success}条，失败${failed}条` });
});

// 删除用户（级联删除所有关联数据）
app.delete('/api/users/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    
    if (parseInt(id) === req.session.user.id) {
        return res.status(400).json({ success: false, message: '不能删除当前登录用户' });
    }

    try {
        // 先获取用户信息
        const user = await database.get('SELECT * FROM users WHERE id = ?', [id]);
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

        logEvent('删除用户', req, user ? `账号=${user.employee_id}, 姓名=${user.name}` : `id=${id}`);
        res.json({ success: true, message: '删除成功，该用户的所有关联数据已清除' });
    } catch (err) {
        console.error('删除用户失败:', err);
        res.status(500).json({ success: false, message: '删除失败: ' + err.message });
    }
});

function readCourseCell(row, col) {
    if (!col) return '';
    const cell = row.getCell(col);
    const value = cell.value;
    if (value === null || value === undefined) return '';
    if (value instanceof Date) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    if (typeof value === 'object') {
        if (value.text) return String(value.text).trim();
        if (value.result !== undefined) return String(value.result).trim();
        if (Array.isArray(value.richText)) return value.richText.map(t => t.text || '').join('').trim();
    }
    return String(value).trim();
}

function isYellowFill(cell) {
    const fill = cell && cell.fill ? cell.fill : {};
    const fg = fill.fgColor || {};
    const argb = String(fg.argb || '').toUpperCase();
    return argb === 'FFFFFF00' || argb === 'FFFFF3CA' || argb.startsWith('FFFFF');
}

function parseCourseHeaderDate(header) {
    const text = String(header || '').trim();
    const m = text.match(/(\d{4})[\/\-.年](\d{1,2})[\/\-.月](\d{1,2})/);
    if (!m) return '';
    return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
}

function parseActivityFromHeader(header) {
    const m = String(header || '').match(/[（(]([^）)]+)[）)]/);
    return m ? m[1].trim() : '社团';
}

function getRosterActivities(person) {
    const activities = [];
    if (person.club) {
        activities.push({ activityType: '社团', courseName: person.club });
    }
    [person.second1, person.second2].filter(Boolean).forEach(courseName => {
        activities.push({ activityType: '第二课堂', courseName });
    });
    return activities;
}

// 下载教师人员导入样表
app.get('/api/download-template/club', requireAuth, requireCourseManager, async (req, res) => {
    try {
        const ExcelJS = require('exceljs');
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('教师人员名单');
        ws.columns = [
            { header: '教师姓名', key: 'name', width: 14 },
            { header: '是否可代课', key: 'can_sub', width: 14 },
            { header: '当前安排', key: 'assignments', width: 42 }
        ];
        var headerRow = ws.getRow(1);
        headerRow.font = { bold: true, size: 11 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        headerRow.height = 36;

        // 示例行 — 可代课教师
        ws.addRow({ name: '张老师', can_sub: '可代课', assignments: '篮球社' });
        ws.addRow({ name: '李老师', can_sub: '可代课', assignments: '合唱团；舞蹈社' });
        // 示例行 — 不可代课教师
        ws.addRow({ name: '王老师', can_sub: '不可代课', assignments: '编程社' });
        ws.addRow({ name: '赵老师', can_sub: '可代课', assignments: '美术社；摄影社；书法社' });

        // 示例说明行灰色
        for (var r = 2; r <= 5; r++) {
            ws.getRow(r).font = { color: { argb: 'FF6B7280' }, italic: true };
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename*=UTF-8\'\'%E6%95%99%E5%B8%88%E4%BA%BA%E5%91%98%E5%AF%BC%E5%85%A5%E6%A0%B7%E8%A1%A8.xlsx');
        await wb.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/substitute-teachers/import', requireAuth, requireCourseManager, upload.single('file'), async (req, res) => {
    if (!req.file) return res.json({ success: false, message: '请上传Excel文件' });
    try {
        const ExcelJS = require('exceljs');
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(req.file.path);
        const ws = wb.worksheets[0];
        if (!ws) {
            fs.unlinkSync(req.file.path);
            return res.json({ success: false, message: 'Excel文件格式错误：找不到工作表' });
        }

        let imported = 0;
        let available = 0;
        const sourceFile = Buffer.from(req.file.originalname || '', 'latin1').toString('utf8');
        await database.transaction(async () => {
            await database.run('DELETE FROM substitute_teachers');
            for (let i = 2; i <= ws.rowCount; i++) {
                const row = ws.getRow(i);
                const name = readCourseCell(row, 1);
                if (!name) continue;
                const canSubText = readCourseCell(row, 2);
                const canSubstitute = (canSubText === '不可代课') ? 0 : 1;
                const assignments = [];
                const assignRaw = readCourseCell(row, 3);
                if (assignRaw) assignments.push(assignRaw);
                // 也读取后续列作为额外安排
                for (let c = 4; c <= ws.columnCount; c++) {
                    const value = readCourseCell(row, c);
                    if (value) assignments.push(value);
                }
                await database.run(
                    'INSERT INTO substitute_teachers (teacher_name, can_substitute, current_assignments, source_file) VALUES (?, ?, ?, ?)',
                    [name, canSubstitute, assignments.join('；'), sourceFile]
                );
                imported++;
                if (canSubstitute) available++;
            }
        });
        fs.unlinkSync(req.file.path);
        res.json({ success: true, message: `导入完成：共${imported}名老师，可代课${available}名，不可代课${imported - available}名`, imported, available });
    } catch (err) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch(e) {}
        }
        res.json({ success: false, message: err.message || '导入失败' });
    }
});

app.get('/api/substitute-teachers', requireAuth, requireCourseManager, async (req, res) => {
    const rows = await database.all('SELECT id, teacher_name, can_substitute, current_assignments FROM substitute_teachers ORDER BY can_substitute DESC, teacher_name ASC');
    res.json({ success: true, data: rows, available: rows.filter(r => Number(r.can_substitute) === 1) });
});

app.post('/api/substitute-teachers', requireAuth, requireCourseManager, async (req, res) => {
    const { teacher_name, can_substitute, current_assignments } = req.body || {};
    if (!teacher_name || !teacher_name.trim()) return res.json({ success: false, message: '教师姓名不能为空' });
    const dup = await database.get('SELECT id FROM substitute_teachers WHERE teacher_name = ?', [teacher_name.trim()]);
    if (dup) return res.json({ success: false, message: '已存在同名教师' });
    const result = await database.run(
        'INSERT INTO substitute_teachers (teacher_name, can_substitute, current_assignments) VALUES (?, ?, ?)',
        [teacher_name.trim(), can_substitute || 0, current_assignments || '']
    );
    res.json({ success: true, message: teacher_name.trim() + ' 已添加', id: result.lastInsertRowid });
});

app.put('/api/substitute-teachers/:id/toggle', requireAuth, requireCourseManager, async (req, res) => {
    const { id } = req.params;
    const teacher = await database.get('SELECT id, teacher_name, can_substitute FROM substitute_teachers WHERE id = ?', [id]);
    if (!teacher) return res.json({ success: false, message: '教师不存在' });
    const newVal = Number(teacher.can_substitute) === 1 ? 0 : 1;
    await database.run('UPDATE substitute_teachers SET can_substitute = ? WHERE id = ?', [newVal, id]);
    res.json({ success: true, message: teacher.teacher_name + ' 已' + (newVal === 1 ? '设为可代课' : '设为不可代课'), can_substitute: newVal });
});

app.put('/api/substitute-teachers/:id', requireAuth, requireCourseManager, async (req, res) => {
    const { id } = req.params;
    const { teacher_name, can_substitute, current_assignments } = req.body || {};
    if (!teacher_name || !teacher_name.trim()) return res.json({ success: false, message: '教师姓名不能为空' });
    const teacher = await database.get('SELECT id FROM substitute_teachers WHERE id = ?', [id]);
    if (!teacher) return res.json({ success: false, message: '教师不存在' });
    // 检查是否有同名其他教师
    const dup = await database.get('SELECT id FROM substitute_teachers WHERE teacher_name = ? AND id != ?', [teacher_name.trim(), id]);
    if (dup) return res.json({ success: false, message: '已存在同名教师' });
    await database.run('UPDATE substitute_teachers SET teacher_name = ?, can_substitute = ?, current_assignments = ? WHERE id = ?',
        [teacher_name.trim(), can_substitute || 0, current_assignments || '', id]);
    res.json({ success: true, message: teacher_name.trim() + ' 信息已更新' });
});

app.delete('/api/substitute-teachers/:id', requireAuth, requireCourseManager, async (req, res) => {
    const { id } = req.params;
    const teacher = await database.get('SELECT id, teacher_name FROM substitute_teachers WHERE id = ?', [id]);
    if (!teacher) return res.json({ success: false, message: '教师不存在' });
    await database.run('DELETE FROM substitute_teachers WHERE id = ?', [id]);
    res.json({ success: true, message: teacher.teacher_name + ' 已从名单中删除' });
});

// 教师详情：上课次数/代课次数/请假次数/社团活动/总课时 + 明细
app.get('/api/teacher-detail', requireAuth, requireCourseManager, async (req, res) => {
    const { teacher_name, start_date, end_date } = req.query;
    if (!teacher_name) return res.json({ success: false, message: '缺少教师姓名' });

    let dateFilter = '';
    let dateParams = [teacher_name];
    if (start_date && end_date) {
        dateFilter = ' AND course_date >= ? AND course_date <= ?';
        dateParams = [teacher_name, start_date, end_date];
    } else if (start_date) {
        dateFilter = ' AND course_date >= ?';
        dateParams = [teacher_name, start_date];
    } else if (end_date) {
        dateFilter = ' AND course_date <= ?';
        dateParams = [teacher_name, end_date];
    }

    // 上课次数 + 总课时（教师课时表）
    const classStats = await database.get(
        `SELECT COUNT(*) AS class_count, COALESCE(SUM(hours), 0) AS total_hours FROM teacher_course_hours WHERE teacher_name = ?${dateFilter.replace(/course_date/g, 'course_date')}`,
        dateParams
    );

    // 代课次数（代课记录表，作为代课老师）
    const subStats = await database.get(
        `SELECT COUNT(*) AS substitute_count FROM substitute_requests WHERE substitute_teacher = ?${dateFilter}`,
        dateParams
    );

    // 请假次数（代课记录表，作为请假老师）
    const leaveStats = await database.get(
        `SELECT COUNT(*) AS leave_count FROM substitute_requests WHERE original_teacher = ?${dateFilter}`,
        dateParams
    );

    // 社团活动（社团活动表，作为安排老师或代课老师）
    const activityParams = [teacher_name, teacher_name];
    let activityDateFilter = '';
    if (start_date && end_date) {
        activityDateFilter = ' AND course_date >= ? AND course_date <= ?';
        activityParams.push(start_date, end_date);
    } else if (start_date) {
        activityDateFilter = ' AND course_date >= ?';
        activityParams.push(start_date);
    } else if (end_date) {
        activityDateFilter = ' AND course_date <= ?';
        activityParams.push(end_date);
    }
    const activityStats = await database.get(
        `SELECT COUNT(*) AS activity_count FROM club_activity_sessions WHERE (scheduled_teacher = ? OR substitute_teacher = ?)${activityDateFilter}`,
        activityParams
    );

    // 明细：合并课时记录、代课记录
    const classRecords = await database.all(
        `SELECT course_date, subject AS name, '上课' AS type, class_name AS detail, hours FROM teacher_course_hours WHERE teacher_name = ?${dateFilter} ORDER BY course_date DESC LIMIT 200`,
        dateParams
    );
    const subRecords = await database.all(
        `SELECT course_date, course_name AS name, '代课' AS type, CONCAT('代 ', original_teacher) AS detail, NULL AS hours FROM substitute_requests WHERE substitute_teacher = ?${dateFilter} ORDER BY course_date DESC LIMIT 200`,
        dateParams
    );
    const leaveRecords = await database.all(
        `SELECT course_date, course_name AS name, '请假' AS type, CONCAT('由 ', substitute_teacher, ' 代') AS detail, NULL AS hours FROM substitute_requests WHERE original_teacher = ?${dateFilter} ORDER BY course_date DESC LIMIT 200`,
        dateParams
    );

    // 合并、排序
    const details = [...classRecords, ...subRecords, ...leaveRecords]
        .sort((a, b) => b.course_date.localeCompare(a.course_date))
        .slice(0, 300);

    // 教师基本信息
    const teacherInfo = await database.get(
        'SELECT id, teacher_name, can_substitute, current_assignments FROM substitute_teachers WHERE teacher_name = ?',
        [teacher_name]
    );

    res.json({
        success: true,
        data: {
            teacher: teacherInfo || { teacher_name, can_substitute: 1, current_assignments: '' },
            stats: {
                class_count: classStats ? Number(classStats.class_count) || 0 : 0,
                total_hours: classStats ? Number(classStats.total_hours) || 0 : 0,
                substitute_count: subStats ? Number(subStats.substitute_count) || 0 : 0,
                leave_count: leaveStats ? Number(leaveStats.leave_count) || 0 : 0,
                activity_count: activityStats ? Number(activityStats.activity_count) || 0 : 0
            },
            details
        }
    });
});

app.post('/api/substitute-requests', requireAuth, requireCourseManager, async (req, res) => {
    const { activity_type, course_name, course_date, original_teacher, substitute_teacher, reason, location, notes } = req.body || {};
    if (!original_teacher || !substitute_teacher) return res.json({ success: false, message: '请填写请假老师和代课老师' });
    const sub = await database.get('SELECT can_substitute FROM substitute_teachers WHERE teacher_name = ?', [substitute_teacher]);
    if (!sub || Number(sub.can_substitute) !== 1) return res.json({ success: false, message: '该老师不可代课或不在可选名单中' });
    await database.run(
        'INSERT INTO substitute_requests (activity_type, course_name, course_date, original_teacher, substitute_teacher, reason, location, notes, requested_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [activity_type || '社团', course_name || '', course_date || '', original_teacher, substitute_teacher, reason || '', location || '', notes || '', req.session.user.name || req.session.user.employee_id || '']
    );
    res.json({ success: true, message: '代课申请已记录' });
});

function buildSubstituteWhere(query) {
    const { start_date, end_date, teacher, course_name } = query;
    const where = [];
    const params = [];
    if (start_date) { where.push('course_date >= ?'); params.push(start_date); }
    if (end_date) { where.push('course_date <= ?'); params.push(end_date); }
    if (teacher) { where.push('(original_teacher LIKE ? OR substitute_teacher LIKE ?)'); params.push(`%${teacher}%`, `%${teacher}%`); }
    if (course_name) { where.push('course_name LIKE ?'); params.push(`%${course_name}%`); }
    return { whereSql: where.length ? ' WHERE ' + where.join(' AND ') : '', params };
}

function buildActivityWhere(query) {
    const { start_date, end_date, teacher, course_name } = query;
    const where = [];
    const params = [];
    if (start_date) { where.push('course_date >= ?'); params.push(start_date); }
    if (end_date) { where.push('course_date <= ?'); params.push(end_date); }
    if (teacher) { where.push('(scheduled_teacher LIKE ? OR substitute_teacher LIKE ?)'); params.push(`%${teacher}%`, `%${teacher}%`); }
    if (course_name) { where.push('course_name LIKE ?'); params.push(`%${course_name}%`); }
    return { whereSql: where.length ? ' WHERE ' + where.join(' AND ') : '', params };
}

app.get('/api/substitute-requests', requireAuth, requireCourseManager, async (req, res) => {
    const { whereSql, params } = buildSubstituteWhere(req.query);
    const records = await database.all(`SELECT * FROM substitute_requests${whereSql} ORDER BY course_date DESC, id DESC`, params);
    const byCourse = await database.all(`SELECT course_name, COUNT(*) AS substitute_count FROM substitute_requests${whereSql} GROUP BY course_name ORDER BY substitute_count DESC, course_name ASC`, params);
    const byTeacher = await database.all(`SELECT substitute_teacher, COUNT(*) AS substitute_count FROM substitute_requests${whereSql} GROUP BY substitute_teacher ORDER BY substitute_count DESC, substitute_teacher ASC`, params);
    res.json({ success: true, data: { records, byCourse, byTeacher } });
});

app.get('/api/substitute-dashboard', requireAuth, requireCourseManager, async (req, res) => {
    const { whereSql, params } = buildSubstituteWhere(req.query);
    const { whereSql: activityWhereSql, params: activityParams } = buildActivityWhere(req.query);
    const records = await database.all(`SELECT id, activity_type, course_name, course_date, original_teacher, substitute_teacher, reason, notes FROM substitute_requests${whereSql} ORDER BY course_date DESC, id DESC`, params);
    const teacherStats = await database.all(`SELECT substitute_teacher, COUNT(*) AS substitute_count, GROUP_CONCAT(CONCAT(COALESCE(course_date, ''), ' ', COALESCE(course_name, ''), '（代', COALESCE(original_teacher, ''), '）') ORDER BY course_date DESC SEPARATOR '；') AS details FROM substitute_requests${whereSql} GROUP BY substitute_teacher ORDER BY substitute_count DESC, substitute_teacher ASC`, params);
    const originalTeacherStats = await database.all(`SELECT original_teacher, COUNT(*) AS leave_count FROM substitute_requests${whereSql} GROUP BY original_teacher ORDER BY leave_count DESC, original_teacher ASC`, params);
    const courseStats = await database.all(`SELECT course_name, activity_type, COUNT(*) AS session_count, COUNT(DISTINCT course_date) AS date_count, MIN(course_date) AS first_date, MAX(course_date) AS last_date FROM club_activity_sessions${activityWhereSql} GROUP BY course_name, activity_type ORDER BY session_count DESC, course_name ASC`, activityParams);
    const dateStats = await database.all(`SELECT course_date, COUNT(*) AS session_count, COUNT(DISTINCT course_name) AS course_count FROM club_activity_sessions${activityWhereSql} GROUP BY course_date ORDER BY course_date DESC`, activityParams);
    const activityRecords = await database.all(`SELECT id, activity_type, course_name, course_date, scheduled_teacher, substitute_teacher, location, source_file FROM club_activity_sessions${activityWhereSql} ORDER BY course_date DESC, course_name ASC, scheduled_teacher ASC`, activityParams);
    const teachers = await database.all('SELECT id, teacher_name, can_substitute, current_assignments FROM substitute_teachers ORDER BY can_substitute DESC, teacher_name ASC');
    const teacherCountMap = new Map(teacherStats.map(row => [row.substitute_teacher, Number(row.substitute_count) || 0]));
    const leaveCountMap = new Map(originalTeacherStats.map(row => [row.original_teacher, Number(row.leave_count) || 0]));
    const teacherRoster = teachers.map(row => ({
        ...row,
        substitute_count: teacherCountMap.get(row.teacher_name) || 0,
        leave_count: leaveCountMap.get(row.teacher_name) || 0
    }));
    const totals = {
        available_teachers: teachers.filter(row => Number(row.can_substitute) === 1).length,
        teacher_count: teachers.length,
        substitute_count: records.length,
        course_count: courseStats.filter(row => row.course_name).length,
        date_count: dateStats.length,
        activity_count: activityRecords.length
    };
    res.json({ success: true, data: { totals, records, teacherStats, courseStats, dateStats, activityRecords, teacherRoster } });
});

function styleWorksheetHeader(sheet) {
    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FF111827' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF1F5' } };
    header.alignment = { vertical: 'middle' };
    header.height = 24;
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columnCount }
    };
}

function addSheet(workbook, name, columns, rows) {
    const sheet = workbook.addWorksheet(name);
    sheet.columns = columns;
    rows.forEach(row => sheet.addRow(row));
    styleWorksheetHeader(sheet);
    sheet.eachRow(row => {
        row.eachCell(cell => {
            cell.alignment = { vertical: 'middle', wrapText: true };
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        });
    });
    return sheet;
}

app.get('/api/substitute-dashboard/export', requireAuth, requireCourseManager, async (req, res) => {
    const ExcelJS = require('exceljs');
    const teachers = await database.all('SELECT teacher_name, can_substitute, current_assignments FROM substitute_teachers ORDER BY can_substitute DESC, teacher_name ASC');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '学生管理系统';
    workbook.created = new Date();

    addSheet(workbook, '教师人员名单', [
        { header: '教师姓名', key: 'teacher_name', width: 16 },
        { header: '是否可代课', key: 'can_substitute_text', width: 14 },
        { header: '当前安排', key: 'current_assignments', width: 42 }
    ], teachers.map(row => ({
        ...row,
        can_substitute_text: Number(row.can_substitute) === 1 ? '可代课' : '不可代课'
    })));

    const filename = `教师人员名单_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    await safeSendBuffer(req, res, Buffer.from(buffer), filename);
});

app.delete('/api/substitute-requests/:id', requireAuth, requireCourseManager, async (req, res) => {
    await database.run('DELETE FROM substitute_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
});

// 清空全部社团/代课数据
app.delete('/api/club-data/clear-all', requireAuth, requireCourseManager, async (req, res) => {
    await database.run('DELETE FROM substitute_requests');
    await database.run('DELETE FROM club_activity_sessions');
    await database.run('DELETE FROM substitute_teachers');
    logEvent('清空社团代课数据', req, '已清空教师名单、代课记录、活动记录');
    res.json({ success: true, message: '已清空全部教师名单、代课记录和活动记录' });
});

// ============ 每日看板 ============

// 获取每日看板数据
app.get('/api/daily-board', requireAuth, requireCourseManager, async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: '请选择日期' });

    // 当天所有活动安排（含正常和代课）
    const sessions = await database.all(
        `SELECT id, activity_type, course_name, course_date, scheduled_teacher, substitute_teacher, location
         FROM club_activity_sessions WHERE course_date = ? ORDER BY scheduled_teacher, course_name`,
        [date]
    );

    // 当天所有请假/代课记录
    const requests = await database.all(
        `SELECT id, course_name, course_date, original_teacher, substitute_teacher, reason, notes
         FROM substitute_requests WHERE course_date = ?`,
        [date]
    );

    // 建立请假索引：original_teacher -> request
    const leaveMap = {};
    requests.forEach(r => { leaveMap[r.original_teacher] = r; });

    // 合并数据：每个 session 标记状态
    const teacherSessions = sessions.map(s => {
        const leave = leaveMap[s.scheduled_teacher];
        return {
            id: s.id,
            activity_type: s.activity_type,
            course_name: s.course_name,
            course_date: s.course_date,
            scheduled_teacher: s.scheduled_teacher,
            substitute_teacher: s.substitute_teacher || (leave ? leave.substitute_teacher : ''),
            location: s.location || '',
            status: leave ? '请假' : '正常',
            reason: leave ? leave.reason : '',
            notes: leave ? leave.notes : '',
            leave_id: leave ? leave.id : null
        };
    });

    // 统计
    const stats = {
        normal: 0, substitute: 0, leave: 0, total: teacherSessions.length
    };
    teacherSessions.forEach(s => {
        if (s.status === '请假') { stats.leave++; stats.substitute++; }
        else stats.normal++;
    });

    // 教师名单（下拉用）
    const teachers = await database.all(
        'SELECT teacher_name FROM substitute_teachers ORDER BY teacher_name ASC'
    );

    res.json({ success: true, data: { stats, teacherSessions, teachers, date } });
});

// 添加/更新每日安排
app.post('/api/daily-board/session', requireAuth, requireCourseManager, async (req, res) => {
    const { course_date, scheduled_teacher, activity_type, course_name, location, status, substitute_teacher, reason } = req.body || {};
    if (!course_date || !scheduled_teacher) {
        return res.status(400).json({ success: false, message: '日期和教师为必填项' });
    }

    await database.transaction(async () => {
        // 检查是否已存在（同日期+同老师+同课程）
        const existing = await database.get(
            'SELECT id FROM club_activity_sessions WHERE course_date = ? AND scheduled_teacher = ? AND course_name = ?',
            [course_date, scheduled_teacher, course_name || '']
        );

        let sessionId;
        if (existing) {
            await database.run(
                'UPDATE club_activity_sessions SET activity_type = ?, substitute_teacher = ?, location = ? WHERE id = ?',
                [activity_type || '社团', substitute_teacher || '', location || '', existing.id]
            );
            sessionId = existing.id;
        } else {
            const result = await database.run(
                'INSERT INTO club_activity_sessions (activity_type, course_name, course_date, scheduled_teacher, substitute_teacher, location) VALUES (?, ?, ?, ?, ?, ?)',
                [activity_type || '社团', course_name || '', course_date, scheduled_teacher, substitute_teacher || '', location || '']
            );
            sessionId = result.lastInsertRowid;
        }

        // 处理请假/代课记录
        if (status === '请假') {
            const existingReq = await database.get(
                'SELECT id FROM substitute_requests WHERE course_date = ? AND original_teacher = ?',
                [course_date, scheduled_teacher]
            );
            if (existingReq) {
                await database.run(
                    'UPDATE substitute_requests SET substitute_teacher = ?, reason = ?, course_name = ?, activity_type = ? WHERE id = ?',
                    [substitute_teacher || '', reason || '', course_name || '', activity_type || '社团', existingReq.id]
                );
            } else {
                await database.run(
                    'INSERT INTO substitute_requests (activity_type, course_name, course_date, original_teacher, substitute_teacher, reason, requested_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [activity_type || '社团', course_name || '', course_date, scheduled_teacher, substitute_teacher || '', reason || '', req.session.user.name || '']
                );
            }
        } else {
            // 正常上课：删除可能存在的旧请假记录
            await database.run(
                'DELETE FROM substitute_requests WHERE course_date = ? AND original_teacher = ?',
                [course_date, scheduled_teacher]
            );
        }
    });

    logEvent('更新每日安排', req, `日期=${course_date}, 老师=${scheduled_teacher}, 状态=${status || '正常'}`);
    res.json({ success: true, message: '保存成功' });
});

// 删除每日安排
app.delete('/api/daily-board/session/:id', requireAuth, requireCourseManager, async (req, res) => {
    const session = await database.get('SELECT * FROM club_activity_sessions WHERE id = ?', [req.params.id]);
    if (!session) return res.status(404).json({ success: false, message: '记录不存在' });

    await database.transaction(async () => {
        await database.run('DELETE FROM club_activity_sessions WHERE id = ?', [req.params.id]);
        await database.run(
            'DELETE FROM substitute_requests WHERE course_date = ? AND original_teacher = ?',
            [session.course_date, session.scheduled_teacher]
        );
    });

    logEvent('删除每日安排', req, `日期=${session.course_date}, 老师=${session.scheduled_teacher}`);
    res.json({ success: true, message: '删除成功' });
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
    logEvent('查询班级列表', req, `共${classes.length}个班级`);
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

// 获取当前学生最新有成绩的考试ID（用于默认选中）
app.get('/api/student/latest-exam-with-data', requireAuth, async (req, res) => {
    const employee_id = req.session.user.employee_id;
    try {
        const student = await database.get('SELECT * FROM students WHERE student_id = ?', [employee_id]);
        if (!student) return res.json({ success: false, message: '学生信息不存在' });

        const exam = await database.get(`
            SELECT e.id, e.name FROM exams e
            WHERE EXISTS (
                SELECT 1 FROM scores sc
                WHERE sc.exam_id = e.id AND sc.student_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修')
                  AND sc.subject IS NOT NULL AND sc.subject != ''
                  AND CAST(sc.total_score AS REAL) > 0
            )
            ORDER BY e.date DESC
            LIMIT 1
        `, [student.id]);

        res.json({ success: true, data: exam || null });
    } catch (err) {
        console.error('查询最新有成绩考试错误:', err.message);
        res.json({ success: false, message: err.message });
    }
});

// 获取指定班级最新有成绩的考试ID（教师端默认选中）
app.get('/api/teacher/latest-exam-for-class', requireAuth, async (req, res) => {
    const { class_id } = req.query;
    if (!class_id) {
        return res.json({ success: false, message: '缺少班级ID' });
    }
    try {
        const exam = await database.get(`
            SELECT e.id, e.name FROM exams e
            WHERE EXISTS (
                SELECT 1 FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = e.id AND s.class_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修')
                  AND sc.subject IS NOT NULL AND sc.subject != ''
                  AND CAST(sc.total_score AS REAL) > 0
            )
            ORDER BY e.date DESC
            LIMIT 1
        `, [class_id]);

        res.json({ success: true, data: exam || null });
    } catch (err) {
        console.error('查询班级最新有成绩考试错误:', err.message);
        res.json({ success: false, message: err.message });
    }
});

// ===== 监控用：获取在线用户数 =====
app.get('/api/monitor/online-count', (req, res) => {
    res.json({ count: userSessions.size });
});

// ===== 异常IP管理API =====
// 获取所有锁定IP
app.get('/api/monitor/locked-ips', (req, res) => {
    try {
        const lockedIps = getLockedIps();
        res.json({ success: true, data: lockedIps });
    } catch (e) {
        console.error('获取锁定IP列表错误:', e);
        res.status(500).json({ success: false, message: '获取失败' });
    }
});

// 解锁IP
app.post('/api/monitor/unlock-ip', (req, res) => {
    const { ip } = req.body;
    if (!ip) {
        return res.status(400).json({ success: false, message: 'IP地址不能为空' });
    }
    try {
        unlockIp(ip);
        logEvent(`管理员解锁IP: ${ip}`, req);
        res.json({ success: true, message: 'IP已解锁' });
    } catch (e) {
        console.error('解锁IP错误:', e);
        res.status(500).json({ success: false, message: '解锁失败' });
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
            await safeSendBuffer(req, res, buf, filename);
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
            
            // 辅助函数：把时间字符串转换为相对于7:50的分钟数
            const timeToMinutes = (timeStr) => {
                if (!timeStr) return null;
                const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
                if (!match) return null;
                const h = parseInt(match[1]);
                const m = parseInt(match[2]);
                const totalMinutes = h * 60 + m;
                const base = 7 * 60 + 50;
                return totalMinutes - base;
            };
            
            let eventLabel = '';
            if (r.status === 'late') {
                if (r.late_time) {
                    const minutes = timeToMinutes(r.late_time);
                    if (minutes !== null) {
                        eventLabel = `迟到 (${minutes}分钟)`;
                    } else {
                        eventLabel = `迟到 (${r.late_time})`;
                    }
                } else {
                    eventLabel = '迟到';
                }
            } else if (r.status === 'leave') {
                eventLabel = r.leave_type ? `请假 (${r.leave_type})` : '请假';
            } else if (r.status === 'absent') {
                if (r.absent_time) {
                    const minutes = timeToMinutes(r.absent_time);
                    if (minutes !== null) {
                        eventLabel = `旷课 (${minutes}分钟)`;
                    } else {
                        eventLabel = `旷课 (${r.absent_time})`;
                    }
                } else {
                    eventLabel = '旷课';
                }
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
            await safeSendBuffer(req, res, buf, filename);
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

// ===== AI 主动分析上下文接口 =====
app.get('/api/ai/context', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const role = user.role;
        const page = req.query.page || '';
        const selection = req.query;
        let contextText = '';

        console.log(`[AI] 📋 获取上下文 → 账号: ${user.name}(${user.employee_id}), 角色: ${role}, 页面: ${page}`);

        if (role === 'teacher') {
            if (page === '/homework-data') {
                console.log('[AI] 📝 使用作业数据专门上下文');
                contextText = await buildHomeworkDataContext(user, selection);
            } else {
                contextText = await buildTeacherContext(user, page, selection);
            }
        } else if (role === 'student') {
            contextText = await buildStudentContext(user, page, selection);
        }

        // 保护：prompt 上限 40KB，超过则截断
        const MAX_PROMPT = 40000;
        if (contextText.length > MAX_PROMPT) {
            contextText = contextText.substring(0, MAX_PROMPT) + '\n\n[提示内容过长已截断，优先保留最关键的数据]';
            console.warn(`[AI] Prompt 过长 (${contextText.length} 字符)，已截断至 ${MAX_PROMPT}`);
        }

        res.json({ success: true, data: { role, page, context: contextText } });
    } catch (err) {
        console.error('AI上下文采集失败:', err);
        res.status(500).json({ success: false, message: 'AI上下文采集失败' });
    }
});

async function buildTeacherContext(user, page, selection) {
    const classId = selection.class_id || user.class_id;
    if (!classId) return buildDefaultTeacherContext(user);

    const classInfo = await database.get('SELECT * FROM classes WHERE id = ?', [classId]);
    if (!classInfo) return buildDefaultTeacherContext(user);

    const pageLabel = pageToLabel(page);
    const lines = [];

    lines.push(`【当前用户】${user.name}`);
    lines.push(`【当前班级】${classInfo.name}`);
    lines.push(`【当前页面】${pageLabel}`);
    lines.push('');

    const isDetailAnalysis = page === '/detail-analysis' && selection.student_id;
    let studentName = '';
    if (isDetailAnalysis) {
        const student = await database.get('SELECT * FROM students WHERE id = ?', [selection.student_id]);
        if (student) {
            studentName = student.name;
            lines.push(`=== 当前学生：${student.name} ===`);
            lines.push(...(await buildStudentDetailLines(selection.student_id)));
            lines.push('');
        }
    }

    lines.push('=== 班级美丽学分数据 ===');
    lines.push(...(await buildCompactBeautyLines(classId, selection, pageLabel)));
    lines.push('=== 班级考试成绩数据 ===');
    lines.push(...(await buildCompactExamLines(classId)));
    lines.push('=== 班级作业未提交数据 ===');
    lines.push(...(await buildCompactHomeworkLines(classId, selection)));

    lines.push('');
    lines.push('【智能路由规则】');
    if (isDetailAnalysis) {
        lines.push(`- 默认分析选定学生(${studentName})的个人成绩数据`);
        lines.push('- 用户说"再次分析/重新分析/分析"→基于以上当前学生数据重新分析，忽略对话历史中的旧学生名');
        lines.push('- 用户说"班级/全班/整体/美丽学分"→切换至班级数据');
        lines.push('- 用户说"成绩/考试/排名/单科"→用学生成绩数据回答');
        lines.push('【重要】如果对话历史中出现了不同于当前学生的姓名，请完全忽略，只分析以上显示的当前学生数据。');
    } else {
        lines.push(`- 默认分析【当前页面】(${pageLabel})的数据`);
        lines.push('- 用户说"成绩/考试/排名/平均分/科目/总分"→用【考试成绩数据】回答');
        lines.push('- 用户说"美丽学分/学分/积分/事件/扣分/加分"→用【美丽学分数据】回答');
        lines.push('- 用户说"作业/提交/缺交/未交/补交"→用【作业未提交数据】回答，禁止输出美丽学分');
        lines.push('- 回答作业问题时：只输出未提交统计，不要建议联系班主任、德育组等');
        lines.push('- 回答美丽学分问题时：只输出班级名单中的数据，学生在则展示积分，不在则告知"班级名单中无此人，请核对姓名或学号"。不要建议联系班主任、德育组等');
    }
    lines.push('- 用户说"再次分析/重新分析"→请基于以上当前数据重新分析，不要沿用对话历史中的旧数据');
    lines.push('- 用户说"作业/提交/缺交"→用作业数据回答');
    lines.push('【回复要求】简洁精炼，只输出核心结论与可行建议，控制篇幅不啰嗦。');

    const contextText = lines.join('\n');
    console.log('[DEBUG buildTeacherContext] 返回上下文长度:', contextText.length);
    console.log('[DEBUG buildTeacherContext] 前2500字符预览:', contextText.substring(0, 2500));
    return contextText;
}

function pageToLabel(page) {
    const map = {
        '/dashboard': '成绩分析', '/': '成绩分析',
        '/detail-analysis': '详细汇总',
        '/events': '美丽学分事件',
        '/total-table': '美丽学分总表',
        '/homework-data': '作业数据'
    };
    return map[page] || page || '首页';
}

async function buildCompactBeautyLines(classId, selection, pageLabel) {
    const lines = [];
    const students = await database.all(
        'SELECT id, student_id, name FROM students WHERE class_id = ? ORDER BY student_id', [classId]
    );
    if (!students.length) { lines.push('暂无学生'); return lines; }

    const studentMap = {};
    students.forEach(s => { studentMap[s.student_id] = s; });

    const allScoreByMonth = await database.all(
        'SELECT month, student_id, SUM(score) as total, COUNT(*) as cnt FROM beauty_scores WHERE class_id=? GROUP BY month, student_id ORDER BY month, student_id',
        [classId]
    );

    const allEventCounts = await database.all(
        'SELECT month, COUNT(*) as cnt FROM beauty_score_events WHERE class_id=? GROUP BY month ORDER BY month',
        [classId]
    );

    const monthSet = new Set();
    allScoreByMonth.forEach(r => monthSet.add(r.month));
    allEventCounts.forEach(r => monthSet.add(r.month));
    const allMonths = Array.from(monthSet).sort();

    if (!allMonths.length) { lines.push('暂无美丽学分数据'); return lines; }

    const eventCountMap = {};
    allEventCounts.forEach(r => { eventCountMap[r.month] = r.cnt; });

    const monthSummary = {};
    allMonths.forEach(m => {
        monthSummary[m] = { label: m.substring(0, 7), total: 0, students: {} };
    });
    allScoreByMonth.forEach(r => {
        const ms = monthSummary[r.month];
        if (!ms) return;
        const sc = parseFloat(r.total || 0);
        ms.total += sc;
        ms.students[r.student_id] = (ms.students[r.student_id] || 0) + sc;
    });

    lines.push('【各月总览】');
    allMonths.forEach(m => {
        const d = monthSummary[m];
        const s = d.total >= 0 ? '+' : '';
        const evtCnt = eventCountMap[m] || 0;
        const top = Object.entries(d.students).sort((a, b) => b[1] - a[1]).slice(0, 2)
            .map(([sid, sc]) => `${sid} ${sc >= 0 ? '+' : ''}${sc.toFixed(0)}`).join(', ');
        const bottom = Object.entries(d.students).sort((a, b) => a[1] - b[1]).slice(0, 2)
            .map(([sid, sc]) => `${sid} ${sc >= 0 ? '+' : ''}${sc.toFixed(0)}`).join(', ');
        lines.push(`${d.label}: ${s}${d.total.toFixed(1)}分 ${evtCnt}事件 | 最高${top} | 最低${bottom}`);
    });

    if (allMonths.length >= 2) {
        lines.push('【各学生月度趋势】');
        students.map(s => s.student_id).sort().forEach(sid => {
            const t = allMonths.map(m => {
                const sc = monthSummary[m].students[sid] || 0;
                return `${monthSummary[m].label}:${sc >= 0 ? '+' : ''}${sc.toFixed(0)}`;
            }).join(' ');
            const name = studentMap[sid] ? studentMap[sid].name : sid;
            lines.push(`${name}(${sid}) ${t}`);
        });
    }
    return lines;
}

async function buildCompactHomeworkLines(classId, selection) {
    const lines = [];
    const semester = selection.semester || '';
    const subject = selection.subject || '';

    let query = 'SELECT hd.*, s.name as student_name, s.student_id FROM homework_data hd JOIN students s ON hd.student_id = s.id WHERE s.class_id = ?';
    const params = [classId];

    if (semester) {
        query += ' AND hd.semester = ?';
        params.push(semester);
    }
    if (subject) {
        query += ' AND hd.subject = ?';
        params.push(subject);
    }

    console.log('[DEBUG buildCompactHomeworkLines] SQL:', query);
    console.log('[DEBUG buildCompactHomeworkLines] params:', params);
    const allData = await database.all(query + ' ORDER BY hd.date DESC', params);
    console.log('[DEBUG buildCompactHomeworkLines] 结果条数:', allData ? allData.length : 'null');

    if (!allData.length) {
        lines.push('暂无作业数据');
        return lines;
    }

    const unsubmitted = allData.filter(d => d.submitted === 0);
    const total = allData.length;
    const submittedCount = total - unsubmitted.length;
    const rate = total > 0 ? ((submittedCount / total) * 100).toFixed(1) : '0';

    lines.push(`总体：${total}条记录，已提交${submittedCount}条，未提交${unsubmitted.length}条，提交率${rate}%`);

    if (unsubmitted.length > 0) {
        const byStudent = {};
        unsubmitted.forEach(d => {
            const key = d.student_name || d.student_id;
            if (!byStudent[key]) byStudent[key] = { count: 0, student_id: d.student_id, subjects: {} };
            byStudent[key].count++;
            byStudent[key].subjects[d.subject] = (byStudent[key].subjects[d.subject] || 0) + 1;
        });

        const sorted = Object.entries(byStudent).sort((a, b) => b[1].count - a[1].count);
        lines.push('');
        lines.push('【未提交作业学生统计】');
        sorted.forEach(([name, info]) => {
            const subjectStr = Object.entries(info.subjects).map(([s, c]) => `${s}×${c}`).join(', ');
            lines.push(`${name}(${info.student_id})：缺交${info.count}次 [${subjectStr}]`);
        });
    }

    return lines;
}

async function buildCompactExamLines(classId) {
    const lines = [];
    const EXAM_ORDER = [
        '高一上期中', '高一上期末', '高一下期中', '高一下期末',
        '高二上期中', '高二上期末', '高二下期中', '高二下期末',
        '高三上期中', '高三上期末', '高三下期中', '高三下期末'
    ];

    const exams = await database.all(`
        SELECT DISTINCT e.id, e.name, e.date
        FROM exams e WHERE EXISTS (
            SELECT 1 FROM scores sc
            JOIN students s ON sc.student_id = s.id
            WHERE sc.exam_id = e.id AND s.class_id = ?
              AND sc.total_score NOT IN ('缺考','免修')
              AND CAST(sc.total_score AS REAL) > 0
        ) ORDER BY e.date
    `, [classId]);

    if (!exams.length) { lines.push('暂无考试成绩数据'); return lines; }

    exams.sort((a, b) => {
        const ia = EXAM_ORDER.indexOf(a.name), ib = EXAM_ORDER.indexOf(b.name);
        if (ia === -1 && ib === -1) return new Date(a.date) - new Date(b.date);
        if (ia === -1) return 1; if (ib === -1) return -1;
        return ia - ib;
    });

    lines.push(`【考试列表】${exams.map(e => e.name).join(' → ')}`);
    lines.push('');
    lines.push('【重要说明】每次考试的满分不一样，**禁止直接对比总分数值的变化**！');
    lines.push('【核心分析方式】必须优先使用**学生排名**进行对比分析，分析学生在班级中的位置上升或下降。');
    lines.push('');

    // 先获取所有考试的所有学生排名数据，用于生成"排名变化对比表"
    const examRankingMap = {};
    const allStudentNames = new Set();
    for (const exam of exams) {
        const rankings = await database.all(`
            SELECT s.name, s.student_id,
                   ROUND(SUM(CAST(sc.total_score AS REAL)),1) as total
            FROM scores sc JOIN students s ON sc.student_id=s.id
            WHERE s.class_id=? AND sc.exam_id=?
              AND sc.total_score NOT IN ('缺考','免修')
              AND CAST(sc.total_score AS REAL)>0
            GROUP BY s.id ORDER BY total DESC
        `, [classId, exam.id]);
        
        examRankingMap[exam.id] = {
            examName: exam.name,
            rankings: rankings.map((r, idx) => ({ ...r, rank: idx + 1 }))
        };
        rankings.forEach(r => allStudentNames.add(r.name));
    }

    // 生成每一场考试的详细数据
    for (const exam of exams) {
        const examData = examRankingMap[exam.id];
        const rankings = examData.rankings;
        
        const stats = await database.get(`
            SELECT COUNT(*) as cnt, ROUND(AVG(total),1) as avg,
                   ROUND(MAX(total),1) as max, ROUND(MIN(total),1) as min
            FROM (SELECT SUM(CAST(sc.total_score AS REAL)) as total
                  FROM scores sc JOIN students s ON sc.student_id=s.id
                  WHERE s.class_id=? AND sc.exam_id=?
                    AND sc.total_score NOT IN ('缺考','免修')
                    AND CAST(sc.total_score AS REAL)>0
                  GROUP BY sc.student_id) t
        `, [classId, exam.id]);

        if (!stats || !stats.cnt) continue;

        lines.push(`---【${exam.name}】---`);
        lines.push(`参考${stats.cnt}人 | 总分均${stats.avg} | 最高${stats.max} | 最低${stats.min}`);
        
        const top3 = rankings.slice(0, 3).map((r) => `${r.rank}.${r.name}${r.total}`);
        const bot3 = rankings.slice(-3).map((r) => `${r.rank}.${r.name}${r.total}`);
        lines.push(`前三:${top3.join(' ')} | 末三:${bot3.join(' ')}`);
        
        // 显示所有学生排名（最多35人）
        if (rankings.length <= 35) {
            const allRankingParts = rankings.map(r => `${r.rank}.${r.name}${r.total}`);
            lines.push(`完整排名: ${allRankingParts.join(' | ')}`);
        }
        lines.push('');
    }

    // 生成"学生排名变化对比表"（如果有至少两场考试）
    if (exams.length >= 2) {
        lines.push('---【学生排名变化对比表】---');
        lines.push('（只列出参加了最近两场考试的学生，用于对比排名升降）');
        
        // 取最近两场考试
        const recent2 = exams.slice(-2);
        const exam1 = recent2[0];
        const exam2 = recent2[1];
        const data1 = examRankingMap[exam1.id];
        const data2 = examRankingMap[exam2.id];
        
        // 构建两场考试的学生排名映射
        const nameToRank1 = {};
        data1.rankings.forEach(r => nameToRank1[r.name] = r.rank);
        const nameToRank2 = {};
        data2.rankings.forEach(r => nameToRank2[r.name] = r.rank);
        
        // 列出同时参加两场考试的学生
        const commonStudents = data2.rankings.filter(r => nameToRank1[r.name]);
        const changeLines = [];
        
        for (const s of commonStudents) {
            const rank1 = nameToRank1[s.name];
            const rank2 = s.rank;
            const delta = rank1 - rank2;
            const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
            const changeText = delta !== 0 ? `${arrow}${Math.abs(delta)}名` : '不变';
            changeLines.push(`${s.name}: ${exam1.name}第${rank1}名 → ${exam2.name}第${rank2}名 (${changeText})`);
        }
        
        changeLines.forEach(l => lines.push(l));
        lines.push('');
    }

    lines.push('【禁止事项】');
    lines.push('1. 禁止直接对比不同考试的总分值变化！');
    lines.push('2. 必须优先使用排名变化来分析学生进步/退步！');

    return lines;
}

async function buildStudentDetailLines(studentId) {
    const lines = [];
    const student = await database.get('SELECT * FROM students WHERE id = ?', [studentId]);
    const classId = student ? student.class_id : null;

    const allScores = await database.all(`
        SELECT e.name as exam_name, e.id as exam_id, e.date, s.subject, CAST(s.total_score AS REAL) as score
        FROM scores s JOIN exams e ON s.exam_id = e.id
        WHERE s.student_id = ? AND s.total_score NOT IN ('缺考','免修')
          AND CAST(s.total_score AS REAL) > 0
        ORDER BY e.date, s.subject
    `, [studentId]);

    if (!allScores.length) {
        lines.push('暂无考试成绩');
        return lines;
    }

    const examOrder = [];
    const examMap = {};
    allScores.forEach(sc => {
        const key = `${sc.exam_name}(${sc.date})`;
        if (!examMap[key]) {
            examMap[key] = { exam_name: sc.exam_name, exam_date: sc.date, exam_id: sc.exam_id, subjects: {}, total: 0 };
            examOrder.push(key);
        }
        examMap[key].subjects[sc.subject] = sc.score;
        examMap[key].total += sc.score;
    });

    lines.push('【历次考试总分趋势】');
    const totals = examOrder.map(k => examMap[k].total);
    for (let i = 0; i < examOrder.length; i++) {
        const k = examOrder[i];
        const d = examMap[k];
        const subjects = Object.entries(d.subjects).map(([s, sc]) => `${s}${sc}`).join(' ');
        const change = i > 0 ? (d.total - totals[i - 1]).toFixed(0) : '—';
        const arrow = i > 0 ? (d.total >= totals[i - 1] ? '↑' : '↓') : '';
        lines.push(`${d.exam_name}(${d.exam_date}): 总分${d.total.toFixed(0)} 较前次${change >= 0 ? '+' : ''}${change}${arrow} | ${subjects}`);
    }
    lines.push('');

    lines.push('【各科个人均分】');
    const subjectStats = {};
    allScores.forEach(sc => {
        if (!subjectStats[sc.subject]) subjectStats[sc.subject] = [];
        subjectStats[sc.subject].push(sc.score);
    });
    for (const sub in subjectStats) {
        const arr = subjectStats[sub];
        const avg = (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
        const max = Math.max(...arr).toFixed(1);
        const min = Math.min(...arr).toFixed(1);
        lines.push(`${sub}均分${avg}（${arr.length}次, 最高${max}, 最低${min})`);
    }

    if (classId) {
        const hwMissing = await database.all(
            'SELECT date, subject FROM homework_data WHERE student_id=? AND submitted=0 ORDER BY date DESC LIMIT 20',
            [studentId]
        );
        if (hwMissing.length) {
            const bySubject = {};
            hwMissing.forEach(hw => { bySubject[hw.subject] = (bySubject[hw.subject] || 0) + 1; });
            lines.push('');
            lines.push(`【缺交作业】${Object.entries(bySubject).map(([k, v]) => `${k}${v}次`).join(' ')}；最近: ${hwMissing.slice(0, 3).map(h => `${h.date}${h.subject}`).join(', ')}`);
        }
    }

    return lines;
}

async function buildDashboardContext(user, selection) {
    const lines = [];
    lines.push('【当前用户信息】');
    lines.push(`姓名：${user.name}，角色：教师（班主任）`);
    lines.push('');

    const examId = selection.exam_id;
    const classId = selection.class_id;

    if (!classId) {
        return buildDefaultTeacherContext(user);
    }

    const classInfo = await database.get('SELECT * FROM classes WHERE id = ?', [classId]);

    if (!classInfo) {
        return buildDefaultTeacherContext(user);
    }

    lines.push(`【当前页面】成绩分析`);
    lines.push(`【当前班级】${classInfo.name}`);
    lines.push('');

    // 获取班级所有学生信息
    const students = await database.all(`
        SELECT id, name, student_id
        FROM students
        WHERE class_id = ?
        ORDER BY student_id
    `, [classId]);

    if (students.length > 0) {
        const studentList = students.map(s => `${s.name}(${s.student_id})`).join('，');
        lines.push(`【班级学生列表】${studentList}`);
        lines.push('');
    }

    // 定义考试顺序（同前端）
    const EXAM_ORDER = [
        '高一上期中', '高一上期末',
        '高一下期中', '高一下期末',
        '高二上期中', '高二上期末',
        '高二下期中', '高二下期末',
        '高三上期中', '高三上期末',
        '高三下期中', '高三下期末'
    ];

    // 获取该班级所有有数据的考试
    const allExamsWithData = await database.all(`
        SELECT DISTINCT e.id, e.name, e.date
        FROM exams e
        WHERE EXISTS (
            SELECT 1 FROM scores sc
            JOIN students s ON sc.student_id = s.id
            WHERE sc.exam_id = e.id AND s.class_id = ?
              AND sc.total_score NOT IN ('缺考', '免修')
              AND sc.subject IS NOT NULL AND sc.subject != ''
              AND CAST(sc.total_score AS REAL) > 0
        )
        ORDER BY e.date
    `, [classId]);

    // 按 EXAM_ORDER 排序考试
    const sortedExams = allExamsWithData.sort((a, b) => {
        const idxA = EXAM_ORDER.indexOf(a.name);
        const idxB = EXAM_ORDER.indexOf(b.name);
        if (idxA === -1 && idxB === -1) return new Date(a.date) - new Date(b.date);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    if (sortedExams.length > 0) {
        lines.push(`【考试序列】按时间顺序：${sortedExams.map(e => e.name).join(' → ')}`);
        lines.push('');

        // 获取当前选择的考试索引
        let currentExamIndex = -1;
        if (examId) {
            currentExamIndex = sortedExams.findIndex(e => e.id == examId);
        }

        if (currentExamIndex >= 0) {
            lines.push(`【当前选择】第${currentExamIndex + 1}场考试：${sortedExams[currentExamIndex].name}`);
            lines.push('');
        }

        // 为每一场考试提供摘要数据（非当前考试仅统计，当前考试提供详细学生数据+排名）
        for (let i = 0; i < sortedExams.length; i++) {
            const exam = sortedExams[i];
            const isCurrent = (i === currentExamIndex);

            // 获取学生总分列表并计算排名
            const examStudentScores = await database.all(`
                SELECT s.name, s.student_id,
                       ROUND(SUM(CAST(sc.total_score AS REAL)), 1) as total_score
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE s.class_id = ? AND sc.exam_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修')
                  AND CAST(sc.total_score AS REAL) > 0
                GROUP BY s.id
                ORDER BY total_score DESC, s.student_id
            `, [classId, exam.id]);

            if (examStudentScores && examStudentScores.length > 0) {
                // 计算统计数据
                const studentCount = examStudentScores.length;
                const avgScore = examStudentScores.reduce((sum, s) => sum + s.total_score, 0) / studentCount;
                const maxScore = examStudentScores[0].total_score;
                const minScore = examStudentScores[studentCount - 1].total_score;

                // 为每个学生添加排名
                const rankedStudents = examStudentScores.map((s, idx) => ({
                    ...s,
                    rank: idx + 1
                }));

                lines.push(`---【第${i + 1}场：${exam.name}${isCurrent ? '（当前选择）' : ''}】参考${studentCount}人，均分${avgScore.toFixed(1)}，最高${maxScore}，最低${minScore}`);

                // 仅对当前考试提供详细学生成绩+排名，其他考试仅统计
                if (isCurrent) {
                    const studentParts = rankedStudents.map(s => `${s.name}第${s.rank}名${s.total_score}分`);
                    lines.push(`学生成绩（按排名）：${studentParts.join('，')}`);
                } else {
                    // 非当前考试，只保留前3名和末3名作为参考
                    const top3 = rankedStudents.slice(0, 3).map(s => `${s.name}第${s.rank}名`);
                    const bottom3 = rankedStudents.slice(-3).map(s => `${s.name}第${s.rank}名`);
                    lines.push(`前3名：${top3.join('、')} | 末3名：${bottom3.join('、')}`);
                }
            }
            lines.push('');
        }
    }

    lines.push('');
    lines.push('=== 以下是最重要的规则，违反即为错误 ===');
    lines.push('');

    lines.push('【绝对禁止】');
    lines.push('1. 禁编造任何数字：只能引用上面明确写出的平均分、最高分、最低分；');
    lines.push('2. 禁提"年级"：上面只提供了一个班级的数据，无年级数据，禁止说"年级排名""年级均值""位列年级X%""年级中上"等任何含"年级"的表述；');
    lines.push('3. 禁提"及格率""优秀率"：上面没有提供任何比率数据，禁止编造；');
    lines.push('4. 禁提任何单科（语文、数学、英语等）：只有总分数据，没有单科数据，禁止分析或提及任何单科；');
    lines.push('5. 禁提其他班级学生：只需分析上面列出的当前班级学生；');
    lines.push('');

    lines.push('【你拥有的数据】');
    if (sortedExams.length > 0) {
        lines.push(`你拥有：1个班级、${sortedExams.length}场考试的成绩数据。`);
        lines.push(`考试按时间顺序排列：${sortedExams.map((e, i) => `第${i+1}场${e.name}`).join('、')}`);
        lines.push('当前选择的考试有学生详细排名和总分，其他考试只有班级统计和前3/末3名。');
        lines.push('注意：没有单科成绩数据，只分析总分。');
        lines.push('【重要说明】每次考试的满分不一样，**禁止直接对比总分数值的变化**！');
        lines.push('【核心分析方式】必须优先使用**学生排名**进行对比分析，分析学生在班级中的位置上升或下降。');
    } else {
        lines.push('你只有：1个班级的学生名单。没有考试成绩数据。');
    }
    lines.push('');

    lines.push('【回答要求】');
    if (sortedExams.length > 0) {
        lines.push('- 只分析总分情况，不要提到任何单科；');
        lines.push('- 必须优先使用排名进行分析，不要对比总分数值的变化；');
        lines.push('- 可以提及均分、最高/最低分作为背景参考，但核心分析必须围绕排名展开；');
        lines.push('- 用户说"这学期""当前考试"或类似：请使用当前选择的那一场考试的数据；');
        lines.push('- 用户说"跟上次考试""跟上一次对比"或类似：请使用当前选择的考试和它的前一场考试进行对比；');
        lines.push('- 用户说"跟下一次对比"或类似：请使用当前选择的考试和它的后一场考试进行对比；');
        lines.push('- 用户没有指定考试：默认使用当前选择的那一场考试的数据；');
        lines.push('- 提到学生时，只能用上面列出的学生姓名和成绩/排名；');
        lines.push('- 如果数据不足以得出某个结论，就说"当前数据不足以判断"，不要编造；');
        lines.push('- 回答控制在150-300字，简洁专业。');
    } else {
        lines.push('- 请提醒用户先选择考试场次；');
        lines.push('- 可以简单介绍当前班级的基本信息（学生人数和名单）；');
        lines.push('- 回答控制在100字以内。');
    }
    lines.push('');
    lines.push('注意：输出文本结尾不要加上"柯宇"这个教师名字。');

    return lines.join('\n');
}

async function buildDetailAnalysisContext(user, selection) {
    const lines = [];
    lines.push('【当前用户信息】');
    lines.push(`姓名：${user.name}，角色：教师（班主任）`);
    lines.push('');

    const classId = selection.class_id;
    const studentId = selection.student_id;

    if (!classId || !studentId) {
        lines.push('【提示】请先在页面上选择班级和学生，我才能为您提供分析服务。');
        lines.push('');
        lines.push('【你的任务】请提示用户先选择班级和学生，不要进行任何分析。');
        return lines.join('\n');
    }

    const classInfo = await database.get('SELECT * FROM classes WHERE id = ?', [classId]);
    const student = await database.get('SELECT * FROM students WHERE id = ?', [studentId]);

    if (!classInfo || !student) {
        lines.push('【提示】请先在页面上选择班级和学生，我才能为您提供分析服务。');
        lines.push('');
        lines.push('【你的任务】请提示用户先选择班级和学生，不要进行任何分析。');
        return lines.join('\n');
    }

    lines.push(`【当前页面】详细汇总`);
    lines.push(`【当前班级】${classInfo.name}`);
    lines.push(`【当前学生】${student.name}，学号：${student.student_id}`);
    lines.push('');

    // 查询所有考试成绩
    const allScores = await database.all(`
        SELECT e.name as exam_name, e.date as exam_date, s.subject, CAST(s.total_score AS REAL) as score
        FROM scores s
        JOIN exams e ON s.exam_id = e.id
        WHERE s.student_id = ?
          AND s.total_score NOT IN ('缺考', '免修')
          AND CAST(s.total_score AS REAL) > 0
        ORDER BY e.date DESC, s.subject
    `, [studentId]);

    if (allScores.length > 0) {
        lines.push('【所有学期成绩数据】');
        
        // 按学科汇总
        const subjectStats = {};
        allScores.forEach(score => {
            if (!subjectStats[score.subject]) {
                subjectStats[score.subject] = { scores: [], count: 0, total: 0 };
            }
            subjectStats[score.subject].scores.push(score);
            subjectStats[score.subject].count++;
            subjectStats[score.subject].total += score.score;
        });

        for (const subject in subjectStats) {
            const stats = subjectStats[subject];
            const avg = (stats.total / stats.count).toFixed(1);
            const max = Math.max(...stats.scores.map(s => s.score)).toFixed(1);
            const min = Math.min(...stats.scores.map(s => s.score)).toFixed(1);
            lines.push(`${subject}：共${stats.count}次考试，平均分${avg}，最高分${max}，最低分${min}`);
        }
        lines.push('');

        // 按考试展示详细成绩
        const examMap = {};
        allScores.forEach(score => {
            const key = `${score.exam_name}_${score.exam_date}`;
            if (!examMap[key]) {
                examMap[key] = { name: score.exam_name, date: score.exam_date, scores: [] };
            }
            examMap[key].scores.push(score);
        });

        lines.push('【历次考试详情】');
        const exams = Object.values(examMap).sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const exam of exams.slice(0, 5)) { // 最多显示最近5次
            const scoreParts = exam.scores.map(s => `${s.subject}${s.score}分`);
            const total = exam.scores.reduce((sum, s) => sum + s.score, 0).toFixed(1);
            lines.push(`${exam.name}（${exam.date}）：${scoreParts.join('，')}，总分${total}`);
        }
        if (exams.length > 5) {
            lines.push(`...还有${exams.length - 5}次考试记录`);
        }
        lines.push('');
    } else {
        lines.push('暂无考试成绩数据。');
        lines.push('');
    }

    // 查询作业未提交记录
    const allHomeworkMissing = await database.all(`
        SELECT date, subject, semester
        FROM homework_data
        WHERE student_id = ? AND submitted = 0
        ORDER BY date DESC
    `, [studentId]);

    if (allHomeworkMissing.length > 0) {
        lines.push('【作业未提交记录】');
        
        // 按学科统计
        const hwSubjectStats = {};
        allHomeworkMissing.forEach(hw => {
            if (!hwSubjectStats[hw.subject]) {
                hwSubjectStats[hw.subject] = 0;
            }
            hwSubjectStats[hw.subject]++;
        });

        for (const subject in hwSubjectStats) {
            lines.push(`${subject}：缺交${hwSubjectStats[subject]}次`);
        }
        lines.push('');

        // 展示最近的未提交记录
        lines.push('【最近缺交作业详情】');
        allHomeworkMissing.slice(0, 10).forEach(hw => {
            lines.push(`${hw.date}：${hw.subject}${hw.semester ? '（' + hw.semester + '）' : ''}`);
        });
        if (allHomeworkMissing.length > 10) {
            lines.push(`...还有${allHomeworkMissing.length - 10}条记录`);
        }
        lines.push('');
    } else {
        lines.push('【作业情况】暂无未提交作业记录，表现很好！');
        lines.push('');
    }

    lines.push('【你的任务】');
    lines.push('你是一位经验丰富的教育数据分析师。请基于以上学生的所有学期成绩数据和作业记录，为这位班主任老师提供：');
    lines.push('1. 首先概述该学生的整体学习情况');
    lines.push('2. 分析各学科的成绩表现，指出优势学科和需要加强的学科');
    lines.push('3. 如果有多次考试成绩，分析成绩趋势（进步/退步/稳定）');
    lines.push('4. 分析作业完成情况，如果有缺交记录给出针对性建议');
    lines.push('5. 肯定做得好的方面，指出需要改进的地方');
    lines.push('6. 给出具体的学习改进建议和教育策略');
    lines.push('请用中文回答，语言专业但亲切，控制在300字以内。注意：输出文本结尾不要加上"柯宇"这个教师名字。');

    return lines.join('\n');
}

async function buildEventsContext(user, selection) {
    const lines = [];
    lines.push('【当前用户信息】');
    lines.push(`姓名：${user.name}，角色：教师（班主任）`);
    lines.push('');

    const userClassId = user.class_id;
    if (!userClassId) {
        lines.push('暂无事件记录');
        return lines.join('\n');
    }

    const classInfo = await database.get('SELECT * FROM classes WHERE id = ?', [userClassId]);
    const className = classInfo ? classInfo.name : '未知班级';
    lines.push(`【当前班级】${className}`);
    lines.push('');

    const year = parseInt(selection.year) || new Date().getFullYear();
    const month = parseInt(selection.month) || new Date().getMonth() + 1;
    const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

    const allScoreMonths = await database.all(`
        SELECT DISTINCT month, class_id FROM beauty_scores
        WHERE class_id = ?
        UNION
        SELECT DISTINCT month, class_id FROM beauty_score_events
        WHERE class_id = ?
        ORDER BY month
    `, [userClassId, userClassId]);

    if (allScoreMonths.length === 0) {
        lines.push('暂无任何美丽学分事件记录');
        lines.push('');
        lines.push('【回复要求】简洁精炼，只输出核心结论与可行建议，不必重复数据表格。');
        return lines.join('\n');
    }

    const allMonthsData = await database.all(`
        SELECT month, student_id, SUM(score) as total, COUNT(*) as event_count
        FROM beauty_score_events
        WHERE class_id = ?
        GROUP BY month, student_id
        ORDER BY month, student_id
    `, [userClassId]);

    const allScoreEventMonths = await database.all(`
        SELECT month, student_id, SUM(score) as total, COUNT(*) as entry_count
        FROM beauty_scores
        WHERE class_id = ? AND events IS NOT NULL AND events != ''
        GROUP BY month, student_id
        ORDER BY month, student_id
    `, [userClassId]);

    const monthMap = {};
    allScoreMonths.forEach(m => {
        const label = m.month.substring(0, 7);
        monthMap[m.month] = { label, count: 0, totalScore: 0, positiveCount: 0, negativeCount: 0, students: {} };
    });

    allMonthsData.forEach(r => {
        const m = monthMap[r.month];
        if (!m) return;
        m.count += r.event_count;
        m.totalScore += parseFloat(r.total || 0);
        if (r.total >= 0) m.positiveCount += r.event_count;
        else m.negativeCount += r.event_count;
        m.students[r.student_id] = (m.students[r.student_id] || 0) + parseFloat(r.total || 0);
    });

    allScoreEventMonths.forEach(r => {
        const m = monthMap[r.month];
        if (!m) {
            const label = r.month.substring(0, 7);
            monthMap[r.month] = { label, count: 0, totalScore: 0, positiveCount: 0, negativeCount: 0, students: {} };
        }
        monthMap[r.month].count += r.entry_count;
    });

    lines.push('【所有月份事件总览】');
    const sortedMonths = Object.keys(monthMap).sort();
    sortedMonths.forEach(m => {
        const d = monthMap[m];
        const s = d.totalScore >= 0 ? '+' : '';
        const top = Object.entries(d.students).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([sid, sc]) => `${sid} ${sc >= 0 ? '+' : ''}${sc.toFixed(0)}`).join(', ');
        const bottom = Object.entries(d.students).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([sid, sc]) => `${sid} ${sc >= 0 ? '+' : ''}${sc.toFixed(0)}`).join(', ');
        lines.push(`${d.label}: ${d.count}条 ${s}${d.totalScore.toFixed(1)}分 | 最高 ${top} | 最低 ${bottom}`);
    });
    lines.push('');

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    let events = await database.all(`
        SELECT bse.entry_date, bse.month, bse.student_id, bse.row_index, bse.score, bse.event_name,
               s.name as student_name, s.student_id as sid
        FROM beauty_score_events bse
        JOIN students s ON bse.student_id = s.student_id
        WHERE bse.entry_date BETWEEN ? AND ? AND s.class_id = ?
        ORDER BY bse.entry_date, bse.student_id
    `, [startDate, endDate, userClassId]);

    if (!events || events.length === 0) {
        events = await database.all(`
            SELECT bs.entry_date, bs.month, bs.student_id, bs.row_index, bs.score, bs.events as event_name,
                   s.name as student_name, s.student_id as sid
            FROM beauty_scores bs
            JOIN students s ON bs.student_id = s.student_id
            WHERE bs.entry_date BETWEEN ? AND ? AND s.class_id = ?
              AND bs.events IS NOT NULL AND bs.events != ''
            ORDER BY bs.entry_date, bs.student_id
        `, [startDate, endDate, userClassId]);
    }

    if (events && events.length > 0) {
        const positiveEvents = events.filter(e => parseFloat(e.score) >= 0);
        const negativeEvents = events.filter(e => parseFloat(e.score) < 0);
        const totalScore = events.reduce((sum, e) => sum + parseFloat(e.score || 0), 0);

        lines.push(`【当前页面：${year}年${month}月 - 详细事件】`);
        lines.push(`事件${events.length}条（加分${positiveEvents.length}/扣分${negativeEvents.length}），净分${totalScore >= 0 ? '+' : ''}${totalScore.toFixed(1)}`);
        lines.push('');

        const dailyEvents = {};
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            dailyEvents[dateStr] = [];
        }
        events.forEach(e => { if (e.entry_date && dailyEvents[e.entry_date]) dailyEvents[e.entry_date].push(e); });
        const activeDays = Object.entries(dailyEvents).filter(([date, evts]) => evts.length > 0);

        activeDays.forEach(([date, evts]) => {
            const dayScore = evts.reduce((sum, e) => sum + parseFloat(e.score || 0), 0);
            const p = dayScore >= 0 ? '+' : '';
            const names = evts.map(e => `${e.student_name}(${e.event_name || '事件'} ${parseFloat(e.score) >= 0 ? '+' : ''}${parseFloat(e.score).toFixed(0)})`).join('; ');
            lines.push(`${date}（${evts.length}条 ${p}${dayScore.toFixed(1)}）：${names}`);
        });
        lines.push('');

        const studentStats = {};
        events.forEach(e => {
            const sid = e.student_id;
            if (!studentStats[sid]) {
                studentStats[sid] = { name: e.student_name, sid: e.sid, total: 0, pos: 0, neg: 0 };
            }
            const sc = parseFloat(e.score || 0);
            studentStats[sid].total += sc;
            if (sc >= 0) studentStats[sid].pos++; else studentStats[sid].neg++;
        });
        const ranked = Object.values(studentStats).sort((a, b) => b.total - a.total);
        lines.push(`【${year}年${month}月学生排名】`);
        ranked.forEach((s, i) => {
            const si = s.total >= 0 ? '+' : '';
            lines.push(`${i + 1}.${s.name}(${s.sid}) ${si}${s.total.toFixed(1)}（+${s.pos}/-${s.neg}）`);
        });
        lines.push('');
    } else {
        lines.push(`【当前页面：${year}年${month}月】暂无事件记录`);
        lines.push('');
    }

    lines.push('【说明】用户可能要求分析任意月份或月份范围（如"4月到5月"），请基于上方各月份总览数据回答。');
    lines.push('【回复要求】简洁精炼，只输出核心结论与可行建议，不重复数据表格。使用短句和要点列表，控制篇幅。');
    return lines.join('\n');
}

async function buildTotalTableContext(user, selection) {
    const lines = [];
    lines.push('【当前用户信息】');
    lines.push(`姓名：${user.name}，角色：教师（班主任）`);
    lines.push('');

    let classId = user.class_id;
    if (!classId) {
        classId = selection.class_id;
    }

    if (!classId) {
        return buildDefaultTeacherContext(user);
    }

    const classInfo = await database.get('SELECT * FROM classes WHERE id = ?', [classId]);
    if (!classInfo) {
        return buildDefaultTeacherContext(user);
    }

    const year = parseInt(selection.year);
    const month = parseInt(selection.month);
    const currentMonthStr = year && month ? `${year}-${String(month).padStart(2, '0')}` : null;
    const displayMonth = currentMonthStr ? `${year}年${month}月` : '当前月份';

    lines.push(`【当前页面】美丽学分总表`);
    lines.push(`【当前班级】${classInfo.name}（ID:${classId}）`);
    if (currentMonthStr) lines.push(`【当前页面月份】${displayMonth}`);
    lines.push('');

    const students = await database.all(`
        SELECT id, student_id, name FROM students WHERE class_id = ? ORDER BY student_id
    `, [classId]);

    if (students.length === 0) {
        lines.push('该班级暂无学生');
        lines.push('【回复要求】简洁精炼。');
        return lines.join('\n');
    }

    const studentMap = {};
    students.forEach(s => { studentMap[s.student_id] = s; });

    const allScoreMonths = await database.all(`
        SELECT DISTINCT month FROM beauty_scores WHERE class_id = ? ORDER BY month
    `, [classId]);

    const allEventMonths = await database.all(`
        SELECT month, student_id, SUM(score) as total, COUNT(*) as cnt
        FROM beauty_score_events
        WHERE class_id = ?
        GROUP BY month, student_id
        ORDER BY month, student_id
    `, [classId]);

    const allScoreByMonth = await database.all(`
        SELECT month, student_id, SUM(score) as total, COUNT(*) as indicator_count
        FROM beauty_scores WHERE class_id = ?
        GROUP BY month, student_id
        ORDER BY month, student_id
    `, [classId]);

    const monthSet = new Set();
    allScoreMonths.forEach(m => monthSet.add(m.month));
    allEventMonths.forEach(m => monthSet.add(m.month));
    const allMonths = Array.from(monthSet).sort();

    const monthSummary = {};
    allMonths.forEach(m => {
        const label = m.substring(0, 7);
        monthSummary[m] = { label, totalScore: 0, eventCount: 0, studentScores: {} };
    });

    allScoreByMonth.forEach(r => {
        const ms = monthSummary[r.month];
        if (!ms) return;
        const sc = parseFloat(r.total || 0);
        ms.totalScore += sc;
        ms.studentScores[r.student_id] = (ms.studentScores[r.student_id] || 0) + sc;
    });

    allEventMonths.forEach(r => {
        const ms = monthSummary[r.month];
        if (!ms) return;
        ms.eventCount += r.cnt;
    });

    lines.push('【美丽学分指标体系】（共4大类54项观察点）');
    const l0Groups = {};
    INDICATOR_TREE.forEach(item => {
        if (!l0Groups[item.l0]) l0Groups[item.l0] = [];
        l0Groups[item.l0].push(item);
    });
    for (const [l0, items] of Object.entries(l0Groups)) {
        lines.push(`  ${l0}（${items.length}项）`);
    }
    lines.push('');

    if (allMonths.length > 0) {
        lines.push('【所有月份班级总览】');
        allMonths.forEach(m => {
            const d = monthSummary[m];
            const s = d.totalScore >= 0 ? '+' : '';
            const top = Object.entries(d.studentScores).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([sid, sc]) => `${sid} ${sc >= 0 ? '+' : ''}${sc.toFixed(0)}`).join(', ');
            const bottom = Object.entries(d.studentScores).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([sid, sc]) => `${sid} ${sc >= 0 ? '+' : ''}${sc.toFixed(0)}`).join(', ');
            lines.push(`${d.label}: 总分${s}${d.totalScore.toFixed(1)} 事件${d.eventCount}条 | 最高 ${top} | 最低 ${bottom}`);
        });
        lines.push('');

        if (allMonths.length >= 2) {
            lines.push('【各学生月度趋势】');
            const sortedStudents = students.map(s => s.student_id).sort();
            sortedStudents.forEach(sid => {
                const trends = allMonths.map(m => {
                    const sc = monthSummary[m].studentScores[sid] || 0;
                    const si = sc >= 0 ? '+' : '';
                    return `${monthSummary[m].label}:${si}${sc.toFixed(0)}`;
                }).join(' ');
                const name = studentMap[sid] ? studentMap[sid].name : sid;
                lines.push(`${name}(${sid}) ${trends}`);
            });
            lines.push('');
        }
    }

    let beautyScores = [];
    let eventDetails = [];
    if (currentMonthStr) {
        beautyScores = await database.all(`
            SELECT bs.student_id, bs.row_index, bs.score, bs.events
            FROM beauty_scores bs
            WHERE bs.class_id = ? AND bs.month = ?
            ORDER BY bs.student_id, bs.row_index
        `, [classId, currentMonthStr]);

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
        eventDetails = await database.all(`
            SELECT bse.student_id, bse.row_index, bse.score, bse.event_name, bse.entry_date,
                   s.name as student_name, s.student_id as sid
            FROM beauty_score_events bse
            JOIN students s ON bse.student_id = s.student_id
            WHERE bse.class_id = ? AND bse.entry_date BETWEEN ? AND ?
            ORDER BY bse.entry_date, bse.student_id
        `, [classId, startDate, endDate]);
    }

    if (currentMonthStr && (beautyScores.length > 0 || eventDetails.length > 0)) {
        const studentScoreMap = {};
        students.forEach(s => {
            studentScoreMap[s.student_id] = {
                name: s.name,
                student_id: s.student_id,
                total: 0,
                indicatorScores: {},
                events: []
            };
        });

        beautyScores.forEach(row => {
            const s = studentScoreMap[row.student_id];
            if (!s) return;
            const score = parseFloat(row.score) || 0;
            s.total += score;
            const rowIdx = row.row_index;
            if (!s.indicatorScores[rowIdx]) s.indicatorScores[rowIdx] = { score: 0, events: [] };
            s.indicatorScores[rowIdx].score += score;
            if (row.events) s.indicatorScores[rowIdx].events.push(row.events);
        });

        eventDetails.forEach(row => {
            const s = studentScoreMap[row.student_id];
            if (!s) return;
            s.events.push({ date: row.entry_date, name: row.event_name, score: parseFloat(row.score || 0) });
        });

        const rankedStudents = Object.values(studentScoreMap)
            .filter(s => s.total !== 0 || s.events.length > 0)
            .sort((a, b) => b.total - a.total);

        lines.push(`【当前页面：${displayMonth} - 详细数据】`);
        rankedStudents.forEach((s, i) => {
            const eventSummary = s.events.length > 0 ? `，事件${s.events.length}条` : '';
            lines.push(`${i + 1}.${s.name}(${s.student_id}) 总分${s.total.toFixed(1)}${eventSummary}`);
            const scoredIndicators = Object.entries(s.indicatorScores)
                .filter(([idx, data]) => data.score !== 0);
            if (scoredIndicators.length > 0 && scoredIndicators.length <= 10) {
                const parts = scoredIndicators.map(([idx, data]) => {
                    const indicator = INDICATOR_TREE[parseInt(idx)];
                    const pn = indicator ? indicator.point : '未知';
                    return `${pn} ${data.score >= 0 ? '+' : ''}${data.score}`;
                });
                lines.push(`  > ${parts.join('; ')}`);
            }
        });
        lines.push('');

        const allEvents = rankedStudents.flatMap(s => s.events.map(e => ({
            ...e,
            student_name: s.name,
            student_id: s.student_id
        })));
        if (allEvents.length > 0) {
            const sorted = allEvents.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
            lines.push(`【${displayMonth}事件明细】（${sorted.length}条）`);
            const compact = {};
            sorted.forEach(e => {
                const key = `${e.date || '未知'}_${e.name}`;
                if (!compact[key]) compact[key] = { date: e.date, name: e.name, students: [], score: e.score };
                compact[key].students.push(e.student_name);
            });
            Object.values(compact).forEach(e => {
                const p = e.score >= 0 ? '+' : '';
                lines.push(`${e.date || '未知'} ${e.name} ${p}${e.score}分 → ${e.students.join('、')}`);
            });
            lines.push('');
        }
    } else if (currentMonthStr) {
        lines.push(`【当前页面：${displayMonth}】暂无美丽学分数据`);
        lines.push('');
    }

    lines.push('【说明】用户可能要求分析任意月份或月份范围（如"4月"或"3-5月"），请基于上方各月份总览和月度趋势数据回答。');
    lines.push('【回复要求】简洁精炼，只输出核心结论与可行建议，不重复数据表格。使用短句和要点列表，控制篇幅。');
    return lines.join('\n');
}

async function buildHomeworkDataContext(user, selection) {
    return `【系统要求】
无论用户问什么，你只回复这一句话：功能正在开发，敬请期待`;
}

async function buildDefaultTeacherContext(user) {
    const lines = [];
    lines.push('【当前用户信息】');
    lines.push(`姓名：${user.name}，角色：教师（班主任）`);
    lines.push('');

    const classes = await database.all('SELECT * FROM classes WHERE user_id = ? ORDER BY id', [user.id]);
    lines.push(`【管辖班级】共${classes.length}个班级：${classes.map(c => c.name).join('、') || '无'}`);
    lines.push('');

    const exams = await database.all('SELECT * FROM exams ORDER BY date DESC');
    if (exams.length > 0) {
        const latestExam = exams[0];
        lines.push(`【最近考试】${latestExam.name}（${latestExam.date}）`);
        lines.push('');

        for (const cls of classes) {
            const stats = await database.get(`
                SELECT COUNT(DISTINCT sc.student_id) as student_count,
                       ROUND(AVG(CAST(sc.total_score AS REAL)), 1) as avg_score,
                       ROUND(MAX(CAST(sc.total_score AS REAL)), 1) as max_score,
                       ROUND(MIN(CAST(sc.total_score AS REAL)), 1) as min_score
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE s.class_id = ? AND sc.exam_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修')
                  AND CAST(sc.total_score AS REAL) > 0
            `, [cls.id, latestExam.id]);

            if (stats && stats.student_count > 0) {
                lines.push(`【${cls.name}】参考${stats.student_count}人，平均分${stats.avg_score}，最高${stats.max_score}，最低${stats.min_score}`);

                const subjectStats = await database.all(`
                    SELECT sc.subject,
                           ROUND(AVG(CAST(sc.total_score AS REAL)), 1) as avg_score,
                           COUNT(*) as cnt
                    FROM scores sc
                    JOIN students s ON sc.student_id = s.id
                    WHERE s.class_id = ? AND sc.exam_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修')
                      AND CAST(sc.total_score AS REAL) > 0
                    GROUP BY sc.subject
                    ORDER BY sc.subject
                `, [cls.id, latestExam.id]);

                if (subjectStats.length > 0) {
                    const parts = subjectStats.map(sub => `${sub.subject}均分${sub.avg_score}`);
                    lines.push(`  各科均分：${parts.join('，')}`);
                }

                const topStudents = await database.all(`
                    SELECT s.name, s.student_id,
                           ROUND(SUM(CAST(sc.total_score AS REAL)), 1) as total
                    FROM scores sc
                    JOIN students s ON sc.student_id = s.id
                    WHERE s.class_id = ? AND sc.exam_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修')
                      AND CAST(sc.total_score AS REAL) > 0
                    GROUP BY s.id
                    ORDER BY total DESC
                    LIMIT 5
                `, [cls.id, latestExam.id]);

                if (topStudents.length > 0) {
                    const topParts = topStudents.map((s, i) => `第${i + 1}名：${s.name}(${s.student_id}) 总分${s.total}`);
                    lines.push(`  前5名：${topParts.join('；')}`);
                }

                const bottomStudents = await database.all(`
                    SELECT s.name, s.student_id,
                           ROUND(SUM(CAST(sc.total_score AS REAL)), 1) as total
                    FROM scores sc
                    JOIN students s ON sc.student_id = s.id
                    WHERE s.class_id = ? AND sc.exam_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修')
                      AND CAST(sc.total_score AS REAL) > 0
                    GROUP BY s.id
                    ORDER BY total ASC
                    LIMIT 5
                `, [cls.id, latestExam.id]);

                if (bottomStudents.length > 0) {
                    const bottomParts = bottomStudents.map((s, i) => `${s.name}(${s.student_id}) 总分${s.total}`);
                    lines.push(`  后5名：${bottomParts.join('；')}`);
                }
            }
            lines.push('');
        }

        if (classes.length >= 2) {
            lines.push('【班级对比分析】');
            const classAvgs = [];
            for (const cls of classes) {
                const avg = await database.get(`
                    SELECT ROUND(AVG(CAST(sc.total_score AS REAL)), 1) as avg_score
                    FROM scores sc
                    JOIN students s ON sc.student_id = s.id
                    WHERE s.class_id = ? AND sc.exam_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修')
                      AND CAST(sc.total_score AS REAL) > 0
                `, [cls.id, latestExam.id]);
                if (avg && avg.avg_score) {
                    classAvgs.push({ name: cls.name, avg: avg.avg_score });
                }
            }
            if (classAvgs.length >= 2) {
                classAvgs.sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
                const comparison = classAvgs.map(c => `${c.name}均分${c.avg}`).join('，');
                lines.push(`各班均分排名：${comparison}`);
                lines.push('');
            }
        }
    }

    lines.push('【你的任务】');
    lines.push('你是一位经验丰富的教育数据分析师。请基于以上班级成绩数据，为这位班主任老师提供：');
    lines.push('1. 简要概述当前各班级学生成绩的整体情况和特点；');
    lines.push('2. 指出需要重点关注的学生类型（如成绩落后的、偏科的、下滑的等）；');
    lines.push('3. 给出具体的督促学生学习的管理建议和教学策略。');
    lines.push('请用中文回答，语言专业但亲切，控制在300字以内。注意：输出文本结尾不要加上"柯宇"这个教师名字。');

    return lines.join('\n');
}

async function buildPeriodStatsContext(user, selection) {
    const lines = [];
    lines.push('【当前用户信息】');
    lines.push(`姓名：${user.name}，学号：${user.employee_id}，角色：学生`);
    lines.push('');

    const startMonth = selection.start_month;
    const endMonth = selection.end_month;

    if (!startMonth || !endMonth) {
        lines.push('【说明】请先在页面上选择时间范围，然后AI将为您提供分析建议。');
        lines.push('');
        lines.push('【你的任务】');
        lines.push('你是一位关心学生成长的AI助手。请友好地提醒用户先选择时间范围，然后为其提供分析建议。');
        lines.push('请用中文回答，语言亲切，控制在200字以内。');
        return lines.join('\n');
    }

    lines.push(`【分析时间范围】${startMonth} 至 ${endMonth}`);
    lines.push('');

    // 获取周期统计数据
    try {
        const student = await database.get('SELECT * FROM students WHERE student_id = ?', [user.employee_id]);
        if (!student) {
            lines.push('暂无学籍信息，请联系班主任完善资料。');
            return lines.join('\n');
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

        const BASE_MINUTES = 7 * 60 + 50; // 7:50

        // 查询考勤记录
        const attendanceRows = await database.all(`
            SELECT date, status, late_time, absent_time, leave_type, leave_duration
            FROM attendance
            WHERE student_id = ? AND date >= ? AND date <= ?
            ORDER BY date ASC
        `, [student.id, startDate, endDate]);

        // 查询美丽学分事件
        let beautyRows = await database.all(`
            SELECT entry_date, score, event_name
            FROM beauty_score_events
            WHERE student_id = ? AND entry_date >= ? AND entry_date <= ?
            ORDER BY entry_date ASC
        `, [student.student_id, startDate, endDate]);

        if (beautyRows.length === 0) {
            beautyRows = await database.all(`
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
        const presentDates = new Set();
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
            } else if (r.status === 'present') {
                presentDates.add(r.date);
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

        const normalCount = presentDates.size;
        const homeworkMissingCount = homeworkRows.length;

        lines.push('【统计数据】');
        lines.push(`- 正常出勤：${normalCount} 次`);
        lines.push(`- 总共迟到：${totalLateMinutes} 分钟`);
        lines.push(`- 总共旷课：${totalAbsentMinutes} 分钟`);
        lines.push(`- 请假：${leaveCount} 次`);
        lines.push(`- 缺交作业：${homeworkMissingCount} 次`);
        lines.push('');

        // 组织每日数据
        const dailyMap = new Map();

        attendanceDetails.forEach(a => {
            if (!dailyMap.has(a.date)) {
                dailyMap.set(a.date, { date: a.date, attendance: [], beauty: [], homework: [] });
            }
            dailyMap.get(a.date).attendance.push(a);
        });

        beautyRows.forEach(b => {
            if (!dailyMap.has(b.entry_date)) {
                dailyMap.set(b.entry_date, { date: b.entry_date, attendance: [], beauty: [], homework: [] });
            }
            dailyMap.get(b.entry_date).beauty.push({ event_name: b.event_name, score: b.score });
        });

        homeworkRows.forEach(h => {
            if (!dailyMap.has(h.date)) {
                dailyMap.set(h.date, { date: h.date, attendance: [], beauty: [], homework: [] });
            }
            dailyMap.get(h.date).homework.push({ subject: h.subject });
        });

        const dailyRecords = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        // 获取详细记录
        lines.push('【详细记录】');

        if (dailyRecords && dailyRecords.length > 0) {
            for (const record of dailyRecords) {
                const date = record.date;
                let hasContent = false;
                let recordText = date + '：';
                const details = [];

                if (record.attendance && record.attendance.length > 0) {
                    for (const a of record.attendance) {
                        if (a.status === 'late' && a.late_time) {
                            details.push(`迟到${a.late_time}分钟`);
                            hasContent = true;
                        } else if (a.status === 'absent' && a.absent_time) {
                            details.push(`旷课${a.absent_time}分钟`);
                            hasContent = true;
                        } else if (a.status === 'leave') {
                            let leaveText = '请假';
                            if (a.leave_type) leaveText += `（${a.leave_type}）`;
                            if (a.leave_duration) leaveText += ` ${a.leave_duration}`;
                            details.push(leaveText);
                            hasContent = true;
                        }
                    }
                }

                if (record.beauty && record.beauty.length > 0) {
                    for (const b of record.beauty) {
                        const score = parseFloat(b.score) || 0;
                        const prefix = score >= 0 ? '+' : '';
                        details.push(`${b.event_name || '美丽学分'} ${prefix}${score}分`);
                        hasContent = true;
                    }
                }

                if (record.homework && record.homework.length > 0) {
                    for (const h of record.homework) {
                        details.push(`缺交${h.subject || '未知科目'}作业`);
                        hasContent = true;
                    }
                }

                if (hasContent) {
                    lines.push(`- ${recordText} ${details.join('；')}`);
                }
            }
        } else {
            lines.push('- 该时间段内暂无记录');
        }
        lines.push('');
    } catch (err) {
        console.error('获取周期统计数据失败:', err);
        lines.push('获取数据时出错，请稍后重试。');
        lines.push('');
    }

    lines.push('【你的任务】');
    lines.push('你是一位关心学生成长的AI助手。请基于以上学生的周期统计数据，为这位学生提供详细的分析和建议：');
    lines.push('1. 首先概述该学生在这段时间内的整体表现情况');
    lines.push('2. 详细分析各项数据：正常出勤次数、迟到分钟数、旷课分钟数、请假次数、缺交作业次数');
    lines.push('3. 结合详细记录中的具体事件（如某日迟到、某日缺交作业等）进行针对性点评');
    lines.push('4. 肯定做得好的方面，指出需要改进的地方');
    lines.push('5. 给出具体、可行的改进建议');
    lines.push('6. 最后给予鼓励和期望');
    lines.push('请用中文回答，语言亲切、鼓励，内容要丰富具体，控制在300字以内。');

    return lines.join('\n');
}

async function buildStudentDetailAnalysisContext(user, selection) {
    const lines = [];
    lines.push('【当前用户信息】');
    lines.push(`姓名：${user.name}，学号：${user.employee_id}，角色：学生`);
    lines.push('');

    const student = await database.get('SELECT * FROM students WHERE student_id = ?', [user.employee_id]);
    if (!student) {
        lines.push('暂无学籍信息，请联系班主任完善资料。');
        return lines.join('\n');
    }

    const classInfo = await database.get('SELECT * FROM classes WHERE id = ?', [student.class_id]);
    lines.push(`班级：${classInfo ? classInfo.name : '未知'}`);
    lines.push('');

    // 查询所有考试成绩
    const allScores = await database.all(`
        SELECT e.name as exam_name, e.date as exam_date, s.subject, CAST(s.total_score AS REAL) as score
        FROM scores s
        JOIN exams e ON s.exam_id = e.id
        WHERE s.student_id = ?
          AND s.total_score NOT IN ('缺考', '免修')
          AND CAST(s.total_score AS REAL) > 0
        ORDER BY e.date DESC, s.subject
    `, [student.id]);

    if (allScores.length > 0) {
        lines.push('【所有学期成绩数据】');
        
        // 按学科汇总
        const subjectStats = {};
        allScores.forEach(score => {
            if (!subjectStats[score.subject]) {
                subjectStats[score.subject] = { scores: [], count: 0, total: 0 };
            }
            subjectStats[score.subject].scores.push(score);
            subjectStats[score.subject].count++;
            subjectStats[score.subject].total += score.score;
        });

        for (const subject in subjectStats) {
            const stats = subjectStats[subject];
            const avg = (stats.total / stats.count).toFixed(1);
            const max = Math.max(...stats.scores.map(s => s.score)).toFixed(1);
            const min = Math.min(...stats.scores.map(s => s.score)).toFixed(1);
            lines.push(`${subject}：共${stats.count}次考试，平均分${avg}，最高分${max}，最低分${min}`);
        }
        lines.push('');

        // 按考试展示详细成绩
        const examMap = {};
        allScores.forEach(score => {
            const key = `${score.exam_name}_${score.exam_date}`;
            if (!examMap[key]) {
                examMap[key] = { name: score.exam_name, date: score.exam_date, scores: [] };
            }
            examMap[key].scores.push(score);
        });

        lines.push('【历次考试详情】');
        const exams = Object.values(examMap).sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const exam of exams.slice(0, 5)) { // 最多显示最近5次
            const scoreParts = exam.scores.map(s => `${s.subject}${s.score}分`);
            const total = exam.scores.reduce((sum, s) => sum + s.score, 0).toFixed(1);
            lines.push(`${exam.name}（${exam.date}）：${scoreParts.join('，')}，总分${total}`);
        }
        if (exams.length > 5) {
            lines.push(`...还有${exams.length - 5}次考试记录`);
        }
        lines.push('');
    } else {
        lines.push('暂无考试成绩数据。');
        lines.push('');
    }

    // 查询作业未提交记录
    const allHomeworkMissing = await database.all(`
        SELECT date, subject, semester
        FROM homework_data
        WHERE student_id = ? AND submitted = 0
        ORDER BY date DESC
    `, [student.id]);

    if (allHomeworkMissing.length > 0) {
        lines.push('【作业未提交记录】');
        
        // 按学科统计
        const hwSubjectStats = {};
        allHomeworkMissing.forEach(hw => {
            if (!hwSubjectStats[hw.subject]) {
                hwSubjectStats[hw.subject] = 0;
            }
            hwSubjectStats[hw.subject]++;
        });

        for (const subject in hwSubjectStats) {
            lines.push(`${subject}：缺交${hwSubjectStats[subject]}次`);
        }
        lines.push('');

        // 展示最近的未提交记录
        lines.push('【最近缺交作业详情】');
        allHomeworkMissing.slice(0, 10).forEach(hw => {
            lines.push(`${hw.date}：${hw.subject}${hw.semester ? '（' + hw.semester + '）' : ''}`);
        });
        if (allHomeworkMissing.length > 10) {
            lines.push(`...还有${allHomeworkMissing.length - 10}条记录`);
        }
        lines.push('');
    } else {
        lines.push('【作业情况】暂无未提交作业记录，表现很好！');
        lines.push('');
    }

    lines.push('【你的任务】');
    lines.push('你是一位贴心的AI学习助手。请基于以上学生的所有学期成绩数据和作业记录，为这位同学提供详细的分析和建议：');
    lines.push('1. 首先概述该学生的整体学习情况');
    lines.push('2. 分析各学科的成绩表现，指出优势学科和需要加强的学科');
    lines.push('3. 如果有多次考试成绩，分析成绩趋势（进步/退步/稳定）');
    lines.push('4. 分析作业完成情况，如果有缺交记录给出针对性建议');
    lines.push('5. 肯定做得好的方面，指出需要改进的地方');
    lines.push('6. 给出具体、可行的学习建议');
    lines.push('7. 最后给予鼓励和期望');
    lines.push('请用中文回答，用"你"称呼，语言亲切、鼓励，内容要丰富具体，控制在300字以内。');

    return lines.join('\n');
}

async function buildStudentContext(user, page, selection) {
    if (page === '/period-stats') {
        return await buildPeriodStatsContext(user, selection);
    }
    if (page === '/detail-analysis') {
        return await buildStudentDetailAnalysisContext(user, selection);
    }
    const lines = [];
    lines.push('【当前用户信息】');
    lines.push(`姓名：${user.name}，学号：${user.employee_id}，角色：学生`);
    lines.push('');

    const student = await database.get('SELECT * FROM students WHERE student_id = ?', [user.employee_id]);
    if (!student) {
        lines.push('暂无学籍信息，请联系班主任完善资料。');
        return lines.join('\n');
    }

    const classInfo = await database.get('SELECT * FROM classes WHERE id = ?', [student.class_id]);
    lines.push(`班级：${classInfo ? classInfo.name : '未知'}`);
    lines.push('');

    const exams = await database.all('SELECT * FROM exams ORDER BY date DESC');
    const examsWithData = [];

    for (const exam of exams) {
        const hasData = await database.get(`
            SELECT COUNT(*) as cnt FROM scores
            WHERE student_id = ? AND exam_id = ?
              AND total_score NOT IN ('缺考', '免修')
              AND CAST(total_score AS REAL) > 0
        `, [student.id, exam.id]);
        if (hasData && hasData.cnt > 0) {
            examsWithData.push(exam);
        }
    }

    if (examsWithData.length > 0) {
        const latestExam = examsWithData[0];
        lines.push(`【最近考试】${latestExam.name}（${latestExam.date}）`);
        lines.push('');

        const scores = await database.all(`
            SELECT subject, CAST(total_score AS REAL) as score
            FROM scores
            WHERE student_id = ? AND exam_id = ?
              AND total_score NOT IN ('缺考', '免修')
              AND CAST(total_score AS REAL) > 0
            ORDER BY subject
        `, [student.id, latestExam.id]);

        if (scores.length > 0) {
            const total = scores.reduce((sum, s) => sum + s.score, 0);
            const avg = total / scores.length;
            const scoreParts = scores.map(s => `${s.subject}：${s.score}分`);
            lines.push(`各科成绩：${scoreParts.join('，')}`);
            lines.push(`总分为${total.toFixed(1)}分，平均分${avg.toFixed(1)}分`);
            lines.push('');

            const ranking = await database.get(`
                SELECT COUNT(*) + 1 as rank
                FROM (
                    SELECT sc.student_id, SUM(CAST(sc.total_score AS REAL)) as total
                    FROM scores sc
                    JOIN students s ON sc.student_id = s.id
                    WHERE s.class_id = ? AND sc.exam_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修')
                      AND CAST(sc.total_score AS REAL) > 0
                    GROUP BY sc.student_id
                    HAVING total > ?
                ) t
            `, [student.class_id, latestExam.id, total]);

            const totalStudents = await database.get(`
                SELECT COUNT(DISTINCT student_id) as cnt
                FROM scores
                WHERE exam_id = ?
                  AND total_score NOT IN ('缺考', '免修')
                  AND CAST(total_score AS REAL) > 0
                  AND student_id IN (SELECT id FROM students WHERE class_id = ?)
            `, [latestExam.id, student.class_id]);

            if (ranking && totalStudents && totalStudents.cnt > 0) {
                const pct = ((ranking.rank / totalStudents.cnt) * 100).toFixed(1);
                lines.push(`班级排名：第${ranking.rank}名/共${totalStudents.cnt}人（前${pct}%）`);
            }
        }

        if (examsWithData.length >= 2) {
            lines.push('');
            lines.push('【历次考试趋势】');
            for (const exam of examsWithData) {
                const examTotal = await database.get(`
                    SELECT SUM(CAST(total_score AS REAL)) as total
                    FROM scores
                    WHERE student_id = ? AND exam_id = ?
                      AND total_score NOT IN ('缺考', '免修')
                      AND CAST(total_score AS REAL) > 0
                `, [student.id, exam.id]);

                const examRank = await database.get(`
                    SELECT COUNT(*) + 1 as rank
                    FROM (
                        SELECT sc.student_id, SUM(CAST(sc.total_score AS REAL)) as total
                        FROM scores sc
                        JOIN students s ON sc.student_id = s.id
                        WHERE s.class_id = ? AND sc.exam_id = ?
                          AND sc.total_score NOT IN ('缺考', '免修')
                          AND CAST(sc.total_score AS REAL) > 0
                        GROUP BY sc.student_id
                        HAVING total > ?
                    ) t
                `, [student.class_id, exam.id, examTotal ? examTotal.total : 0]);

                if (examTotal && examTotal.total > 0 && examRank) {
                    lines.push(`${exam.name}：总分${examTotal.total.toFixed(1)}，班级第${examRank.rank}名`);
                }
            }
        }
    } else {
        lines.push('暂无考试成绩数据。');
    }

    lines.push('');
    lines.push('【你的任务】');
    lines.push('你是一位贴心的AI学习助手。请基于以上学生成绩数据，为这位同学提供：');
    lines.push('1. 简要分析当前各科成绩的整体水平；');
    lines.push('2. 指出优势和薄弱学科；');
    lines.push('3. 如果有多次考试成绩，分析成绩趋势（进步/退步/稳定）；');
    lines.push('4. 给出具体的学习改进建议和努力方向。');
    lines.push('请用中文回答，语气亲切鼓励，控制在300字以内。注意：输出文本结尾不要加上"柯宇"这个教师名字。');

    return lines.join('\n');
}

// ===== Qwen AI 代理端点 (使用阿里云 DashScope API) =====
app.post('/api/ollama/chat', requireAuth, async (req, res) => {
    try {
        const { model, messages, stream } = req.body;
        const apiKey = 'sk-79d6dec0d9704699be000aa0d14d5b55';
        const qwenHost = 'dashscope.aliyuncs.com';

        const user = req.session && req.session.user;
        const userLabel = user ? `${user.name}(${user.employee_id})[${user.role}]` : '未知用户';
        console.log(`[AI] 💬 开始对话 → 账号: ${userLabel}, 模型: ${model || 'qwen-max'}`);
        
        let headersSent = false;
        let connectionClosed = false;

        // 监听客户端连接关闭事件，防止 EPIPE 错误
        const onClientClose = () => {
            console.log('[AI] 客户端连接已关闭');
            connectionClosed = true;
        };

        const onClientError = (err) => {
            console.log('[AI] 客户端连接错误:', err.message);
            connectionClosed = true;
        };

        res.on('close', onClientClose);
        res.on('error', onClientError);

        // 安全写入函数，先检查连接状态
        const safeWrite = (chunk) => {
            if (connectionClosed || res.destroyed || !res.writable) {
                return false;
            }
            try {
                res.write(chunk);
                return true;
            } catch (err) {
                console.log('[AI] 写入失败:', err.message);
                connectionClosed = true;
                return false;
            }
        };

        const safeEnd = () => {
            if (!connectionClosed && res.writable) {
                try {
                    res.end();
                } catch (err) {
                    console.log('[AI] 结束连接失败:', err.message);
                }
            }
        };

        // 准备请求体，兼容 OpenAI 格式
        const requestBody = JSON.stringify({
            model: model || 'qwen-max', // ai 模型
            messages: messages || [],
            stream: stream !== false
        });

        const https = require('https');
        const qwenReq = https.request({
            hostname: qwenHost,
            port: 443,
            path: '/compatible-mode/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        }, (qwenRes) => {
            if (connectionClosed) {
                qwenRes.destroy();
                return;
            }

            if (stream !== false) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
            }
            headersSent = true;

            qwenRes.on('data', (chunk) => {
                if (!connectionClosed) {
                    safeWrite(chunk);
                } else {
                    qwenRes.destroy();
                }
            });

            qwenRes.on('end', () => {
                safeEnd();
            });
        });

        qwenReq.on('error', (err) => {
            console.error('Qwen API 连接失败:', err);
            if (!headersSent && !connectionClosed) {
                res.status(500).json({ success: false, message: '无法连接到 Qwen API: ' + err.message });
            } else {
                safeEnd();
            }
        });

        // 如果客户端已关闭，直接销毁 Qwen 请求
        if (connectionClosed) {
            qwenReq.destroy();
            return;
        }

        qwenReq.write(requestBody);
        qwenReq.end();

    } catch (err) {
        console.error('AI 代理错误:', err);
        if (!res.headersSent && res.writable) {
            res.status(500).json({ success: false, message: 'AI 代理错误: ' + err.message });
        }
    }
});

// ===== 进程级错误监听，防止崩溃 =====
process.on('uncaughtException', (err) => {
    console.error('[FATAL] 未捕获的异常:', err);
    console.error('[FATAL] 错误堆栈:', err.stack);
    // 不要让进程崩溃，继续运行
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] 未处理的 Promise 拒绝:', reason);
    console.error('[FATAL] Promise:', promise);
    // 不要让进程崩溃，继续运行
});

// 启动服务器
async function startServer() {
    await initDatabase();

    // 为已存在的 club_activity_sessions 表补充 location 列
    try { await database.exec('ALTER TABLE club_activity_sessions ADD COLUMN location VARCHAR(200) DEFAULT \'\''); } catch(e) {}

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
    
    // ===== 通用错误处理中间件：捕获socket错误 =====
    app.use((req, res, next) => {
        // 给每个请求的socket添加错误处理（仅一次）
        if (!req.socket._hasErrorHandler) {
            req.socket._hasErrorHandler = true;
            req.socket.on('error', (err) => {
                if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
                    console.warn('[安全] 客户端提前断开连接:', req.path);
                } else {
                    console.error('[Socket错误]', req.path, ':', err);
                }
            });
        }
        next();
    });

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
    
    // 设置服务器超时时间为5分钟（300000毫秒），避免导出大文件时超时
    server.setTimeout(300000);
    console.log('[配置] 服务器超时时间已设置为5分钟');
    
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

    // 监控用：获取数据库状态
    app.get('/api/monitor/db-status', async (req, res) => {
        try {
            const { database, DB_CONFIG } = require('./database-mysql');
            const config = DB_CONFIG || { host: 'localhost', port: 3306 };
            let connected = false;
            try {
                const result = await database.get('SELECT 1');
                connected = result !== null;
            } catch (err) {
                connected = false;
            }
            res.json({
                connected: connected,
                host: config.host,
                port: config.port
            });
        } catch (err) {
            res.json({ connected: false, host: 'unknown', port: 3306, error: err.message });
        }
    });

    // 备份数据库
    const BACKUP_DIR = path.join(__dirname, 'database');
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    app.post('/api/monitor/backup', async (req, res) => {
        console.log('[BACKUP] 收到备份请求');
        try {
            const { getPool, DB_CONFIG: bakDB_CONFIG } = require('./database-mysql');
            const DB_CONFIG = bakDB_CONFIG || { host: 'localhost', port: 3306 };
            const pool = getPool();
            
            console.log('[BACKUP] DB_CONFIG:', { host: DB_CONFIG.host, port: DB_CONFIG.port, database: DB_CONFIG.database });
            
            const now = new Date();
            const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            const backupFile = path.join(BACKUP_DIR, `${dateStr}.sql`);
            console.log('[BACKUP] 备份文件路径:', backupFile);

            console.log('[BACKUP] 正在获取数据库连接...');
            const conn = await pool.getConnection();
            console.log('[BACKUP] 数据库连接成功');
            
            let sqlContent = `-- 备份时间: ${now.toLocaleString()}\n`;
            sqlContent += `-- 数据库: ${DB_CONFIG.database}\n`;
            sqlContent += `-- 主机: ${DB_CONFIG.host}:${DB_CONFIG.port}\n\n`;
            sqlContent += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
            sqlContent += `SET AUTOCOMMIT = 0;\n`;
            sqlContent += `START TRANSACTION;\n`;
            sqlContent += `SET time_zone = "+00:00";\n\n`;
            sqlContent += `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
            sqlContent += `USE \`${DB_CONFIG.database}\`;\n\n`;

            console.log('[BACKUP] 正在获取表列表...');
            const [tables] = await conn.query('SHOW TABLES');
            console.log('[BACKUP] 找到表数量:', tables.length);
            
            for (const tableObj of tables) {
                const tableName = Object.values(tableObj)[0];
                console.log('[BACKUP] 正在处理表:', tableName);
                sqlContent += `-- 表: ${tableName}\n`;

                const [createTable] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
                sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
                sqlContent += `${createTable[0]['Create Table']};\n\n`;

                const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
                if (rows.length > 0) {
                    console.log(`[BACKUP] 表 ${tableName} 有 ${rows.length} 行数据`);
                    sqlContent += `LOCK TABLES \`${tableName}\` WRITE;\n`;

                    for (const row of rows) {
                        const values = Object.values(row).map(v => {
                            if (v === null) return 'NULL';
                            if (typeof v === 'number') return v;
                            const str = String(v);
                            return `'${str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\x00/g, '\\0')}'`;
                        });
                        sqlContent += `INSERT INTO \`${tableName}\` VALUES (${values.join(', ')});\n`;
                    }
                    sqlContent += `UNLOCK TABLES;\n\n`;
                }
            }

            sqlContent += 'COMMIT;\n';

            console.log('[BACKUP] 正在写入文件...');
            fs.writeFileSync(backupFile, sqlContent, 'utf8');
            console.log('[BACKUP] 文件写入成功，大小:', (fs.statSync(backupFile).size / 1024).toFixed(2), 'KB');
            conn.release();

            const response = { success: true, filename: path.basename(backupFile) };
            console.log('[BACKUP] 响应:', response);
            res.json(response);
        } catch (err) {
            console.error('[BACKUP] 备份失败:', err);
            console.error('[BACKUP] 错误堆栈:', err.stack);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // 获取备份列表
    app.get('/api/monitor/backups', (req, res) => {
        try {
            if (!fs.existsSync(BACKUP_DIR)) return res.json({ success: true, backups: [] });
            const files = fs.readdirSync(BACKUP_DIR);
            const backups = files
                .filter(f => f.endsWith('.sql'))
                .map(f => {
                    const fullPath = path.join(BACKUP_DIR, f);
                    const stat = fs.statSync(fullPath);
                    return {
                        name: f,
                        date: new Date(stat.mtime).toLocaleString('zh-CN'),
                        size: (stat.size / 1024).toFixed(2) + ' KB'
                    };
                })
                .sort((a, b) => b.name.localeCompare(a.name));
            res.json({ success: true, backups });
        } catch (err) {
            res.json({ success: true, backups: [] });
        }
    });

    // 恢复数据库
    app.post('/api/monitor/restore', async (req, res) => {
        try {
            const { filename } = req.body;
            if (!filename) {
                return res.status(400).json({ success: false, error: '请选择备份文件' });
            }
            const backupFile = path.join(BACKUP_DIR, filename);
            if (!fs.existsSync(backupFile)) {
                return res.status(400).json({ success: false, error: '备份文件不存在' });
            }

            const { getPool, DB_CONFIG: restDB_CONFIG } = require('./database-mysql');
            const DB_CONFIG = restDB_CONFIG || { host: 'localhost', port: 3306 };

            const sqlContent = fs.readFileSync(backupFile, 'utf8');
            const pool = getPool();
            const conn = await pool.getConnection();

            const statements = sqlContent
                .split(';')
                .map(s => s.trim())
                .filter(s => s && !s.startsWith('--'));

            for (const stmt of statements) {
                if (stmt) {
                    try {
                        await conn.query(stmt);
                    } catch (e) {
                        console.log('执行SQL警告:', e.message);
                    }
                }
            }

            conn.release();
            res.json({ success: true });
        } catch (err) {
            console.error('恢复失败:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // 删除备份
    app.delete('/api/monitor/backup', async (req, res) => {
        try {
            const { filename } = req.body;
            if (!filename) {
                return res.status(400).json({ success: false, error: '请选择备份文件' });
            }
            const backupFile = path.join(BACKUP_DIR, filename);
            if (fs.existsSync(backupFile)) {
                fs.unlinkSync(backupFile);
            }
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // 监控用：系统资源信息（供远程monitor拉取）
    const monitorLogs = [];
    const MAX_MONITOR_LOGS = 200;
    let _monitorLastCpuUsage = process.cpuUsage();
    let _monitorLastCpuTime = 0;
    let _monitorLastNetworkStats = {};
    let _monitorLastNetworkTime = 0;

    function addMonitorLog(message, type) {
        const time = new Date().toISOString();
        monitorLogs.push({ id: Date.now() + Math.random(), time, message: `[${new Date().toLocaleString('zh-CN')}] ${message}`, type: type || 'info', source: 'main' });
        if (monitorLogs.length > MAX_MONITOR_LOGS) monitorLogs.shift();
    }

    function getNetworkUsage() {
        try {
            const os = require('os');
            const ifaces = os.networkInterfaces();
            let totalRx = 0, totalTx = 0;
            
            // 用wmic获取网络使用率
            const { execSync } = require('child_process');
            try {
                const result = execSync('wmic path Win32_PerfRawData_Tcpip_NetworkInterface get BytesReceivedPersec,BytesSentPersec', { timeout: 2000, windowsHide: true }).toString();
                const lines = result.trim().split('\n');
                if (lines.length >= 2) {
                    const values = lines[1].trim().split(/\s+/).map(v => parseInt(v) || 0);
                    totalRx = values[0] || 0;
                    totalTx = values[1] || 0;
                }
            } catch (e) {}

            const now = Date.now();
            let networkStats = null;
            if (_monitorLastNetworkTime > 0 && Object.keys(_monitorLastNetworkStats).length > 0) {
                const elapsed = (now - _monitorLastNetworkTime) / 1000;
                if (elapsed > 0) {
                    const rxDiff = totalRx - (_monitorLastNetworkStats.rx || 0);
                    const txDiff = totalTx - (_monitorLastNetworkStats.tx || 0);
                    networkStats = {
                        rx: parseFloat((rxDiff / elapsed / 1024).toFixed(1)),
                        tx: parseFloat((txDiff / elapsed / 1024).toFixed(1))
                    };
                }
            }
            _monitorLastNetworkStats = { rx: totalRx, tx: totalTx };
            _monitorLastNetworkTime = now;
            return networkStats;
        } catch (e) {
            return null;
        }
    }

    app.get('/api/monitor/system-info', (req, res) => {
        try {
            const os = require('os');
            const { execSync } = require('child_process');

            const cpus = os.cpus();
            const cpuModel = cpus[0] ? cpus[0].model : 'Unknown';
            const cpuCores = cpus.length;

            let cpuUsage = 0;
            if (_monitorLastCpuTime > 0) {
                const elapsed = Date.now() - _monitorLastCpuTime;
                const cpuDiff = process.cpuUsage(_monitorLastCpuUsage);
                cpuUsage = elapsed > 0 ? parseFloat(((cpuDiff.user + cpuDiff.system) / (elapsed * 1000)).toFixed(1)) : 0;
            }
            _monitorLastCpuUsage = process.cpuUsage();
            _monitorLastCpuTime = Date.now();

            const totalMem = os.totalmem();
            const freeMem = os.freemem();

            let diskInfo = null;
            try {
                const result = execSync('wmic logicaldisk where "Caption=\'C:\'" get size,freespace /format:csv', { timeout: 3000, windowsHide: true }).toString();
                const lines = result.trim().split('\n');
                if (lines.length >= 2) {
                    const cols = lines[1].split(',');
                    const size = parseInt(cols[1]);
                    const free = parseInt(cols[2]);
                    if (size > 0) {
                        diskInfo = {
                            total: (size / 1024 / 1024 / 1024).toFixed(2),
                            free: (free / 1024 / 1024 / 1024).toFixed(2),
                            used: ((size - free) / 1024 / 1024 / 1024).toFixed(2),
                            usage: parseFloat(((size - free) / size * 100).toFixed(1))
                        };
                    }
                }
            } catch (e) {}

            const memUsageProc = process.memoryUsage();
            const networkStats = getNetworkUsage();

            res.json({
                success: true,
                data: {
                    timestamp: Date.now(),
                    dbHost: DB_CONFIG.host,
                    dbPort: DB_CONFIG.port,
                    dbConnected: true,
                    onlineUsers: userSessions.size,
                    abnormalAccountsCount: lockedIPs.size,
                    attackDetected: lockedIPs.size > 0,
                    cpu: { 
                        model: cpuModel, 
                        cores: cpuCores, 
                        usage: Math.max(0, Math.min(100, cpuUsage * 100))
                    },
                    memory: {
                        total: parseFloat((totalMem / 1024 / 1024 / 1024).toFixed(2)),
                        free: parseFloat((freeMem / 1024 / 1024 / 1024).toFixed(2)),
                        used: parseFloat(((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(2)),
                        usage: parseFloat(((totalMem - freeMem) / totalMem * 100).toFixed(1))
                    },
                    disk: diskInfo,
                    network: networkStats,
                    os: { hostname: os.hostname(), platform: os.platform(), uptime: os.uptime() },
                    process: {
                        uptime: parseFloat((process.uptime() / 3600).toFixed(2)),
                        cpu: Math.max(0, Math.min(100, cpuUsage * 100)),
                        memory: {
                            rss: parseFloat((memUsageProc.rss / 1024 / 1024).toFixed(1)),
                            heapUsed: parseFloat((memUsageProc.heapUsed / 1024 / 1024).toFixed(1)),
                            heapTotal: parseFloat((memUsageProc.heapTotal / 1024 / 1024).toFixed(1))
                        }
                    }
                }
            });
        } catch (err) {
            res.json({ success: false, error: err.message });
        }
    });

    // 监控用：主服务器日志（支持增量拉取）
    app.get('/api/monitor/logs', (req, res) => {
        const sinceId = req.query.since_id ? parseFloat(req.query.since_id) : 0;
        const newLogs = monitorLogs.filter(log => log.id > sinceId);
        res.json({ success: true, logs: newLogs });
    });

    // 监控用：停止主服务器
    app.post('/api/monitor/shutdown', (req, res) => {
        res.json({ success: true, message: '正在关闭主服务器...' });
        addMonitorLog('收到远程关闭请求', 'warn');
        setTimeout(() => {
            process.exit(0);
        }, 500);
    });

    // 重写console.log以捕获日志
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = function() {
        const msg = Array.from(arguments).join(' ');
        addMonitorLog(msg, 'info');
        originalLog.apply(console, arguments);
    };
    console.error = function() {
        const msg = Array.from(arguments).join(' ');
        addMonitorLog(msg, 'error');
        originalError.apply(console, arguments);
    };
    console.warn = function() {
        const msg = Array.from(arguments).join(' ');
        addMonitorLog(msg, 'warning');
        originalWarn.apply(console, arguments);
    };

    // ===== 全局错误处理（防崩溃，放最后）=====
    app.use((err, req, res, next) => {
        console.error('[ERROR]', err.stack || err);
        if (!res.headersSent && res.writable) {
            try {
                res.status(500).json({ success: false, message: '服务器内部错误' });
            } catch (writeErr) {
                console.error('[ERROR] 发送错误响应失败:', writeErr.message);
            }
        }
    });

    // 404 处理（必须放在所有路由之后）
    app.use((req, res) => {
        if (!res.headersSent && res.writable) {
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ success: false, message: '接口不存在' });
            }
            res.status(404).sendFile(path.join(__dirname, 'public', 'login.html'));
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
        console.log('  内存限制: ' + (v8.getHeapStatistics().heap_size_limit / 1048576).toFixed(0) + 'MB');
        console.log('=========================================');
        console.log('[安全] 3001端口已限制，仅允许通过反向代理访问');
        
        // 每10分钟打印一次内存使用情况
        setInterval(() => {
            const used = process.memoryUsage();
            const sessions = sessionMiddleware.store?.sessions;
            const sessionCount = sessions ? Object.keys(sessions).length : 0;
            console.log(`[内存] 堆:${(used.heapUsed/1048576).toFixed(1)}MB/${(used.heapTotal/1048576).toFixed(1)}MB | RSS:${(used.rss/1048576).toFixed(1)}MB | 外部:${(used.external/1048576).toFixed(1)}MB | Session:${sessionCount}`);
        }, 10 * 60 * 1000);
        
        // ===== 定时备份：每天6点和22点 =====
        function scheduleBackup() {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // 计算下次备份时间
            let nextBackupHour = 6;
            if (currentHour >= 6 && currentHour < 22) {
                nextBackupHour = 22;
            }
            
            let nextBackup = new Date(now);
            nextBackup.setHours(nextBackupHour, 0, 0, 0);
            
            // 如果今天的时间已过，安排到明天
            if (nextBackup <= now) {
                nextBackup.setDate(nextBackup.getDate() + 1);
            }
            
            const delay = nextBackup.getTime() - now.getTime();
            const nextBackupStr = nextBackup.toLocaleString();
            
            console.log(`[备份] 下次备份计划: ${nextBackupStr}`);
            
            setTimeout(async () => {
                console.log('[备份] 开始自动备份...');
                try {
                    const { getPool, DB_CONFIG: bakDB_CONFIG } = require('./database-mysql');
                    const DB_CONFIG = bakDB_CONFIG || { host: 'localhost', port: 3306 };
                    const pool = getPool();
                    const BACKUP_DIR = path.join(__dirname, 'database');
                    if (!fs.existsSync(BACKUP_DIR)) {
                        fs.mkdirSync(BACKUP_DIR, { recursive: true });
                    }
                    
                    const backupTime = new Date();
                    const dateStr = `${backupTime.getFullYear()}${String(backupTime.getMonth() + 1).padStart(2, '0')}${String(backupTime.getDate()).padStart(2, '0')}_${String(backupTime.getHours()).padStart(2, '0')}${String(backupTime.getMinutes()).padStart(2, '0')}${String(backupTime.getSeconds()).padStart(2, '0')}`;
                    const backupFile = path.join(BACKUP_DIR, `${dateStr}.sql`);
                    
                    const conn = await pool.getConnection();
                    let sqlContent = `-- 备份时间: ${backupTime.toLocaleString()}\n`;
                    sqlContent += `-- 数据库: ${DB_CONFIG.database}\n`;
                    sqlContent += `-- 主机: ${DB_CONFIG.host}:${DB_CONFIG.port}\n\n`;
                    sqlContent += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
                    sqlContent += `SET AUTOCOMMIT = 0;\n`;
                    sqlContent += `START TRANSACTION;\n`;
                    sqlContent += `SET time_zone = "+00:00";\n\n`;
                    sqlContent += `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
                    sqlContent += `USE \`${DB_CONFIG.database}\`;\n\n`;
                    
                    const [tables] = await conn.query('SHOW TABLES');
                    for (const tableObj of tables) {
                        const tableName = Object.values(tableObj)[0];
                        sqlContent += `-- 表: ${tableName}\n`;
                        const [createTable] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
                        sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
                        sqlContent += `${createTable[0]['Create Table']};\n\n`;
                        
                        const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
                        if (rows.length > 0) {
                            sqlContent += `LOCK TABLES \`${tableName}\` WRITE;\n`;
                            for (const row of rows) {
                                const values = Object.values(row).map(v => {
                                    if (v === null) return 'NULL';
                                    if (typeof v === 'number') return v;
                                    const str = String(v);
                                    return `'${str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\x00/g, '\\0')}'`;
                                });
                                sqlContent += `INSERT INTO \`${tableName}\` VALUES (${values.join(', ')});\n`;
                            }
                            sqlContent += `UNLOCK TABLES;\n\n`;
                        }
                    }
                    sqlContent += 'COMMIT;\n';
                    
                    fs.writeFileSync(backupFile, sqlContent, 'utf8');
                    conn.release();
                    console.log(`[备份] 自动备份完成: ${path.basename(backupFile)} (${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB)`);
                } catch (err) {
                    console.error('[备份] 自动备份失败:', err);
                }
                
                // 安排下一次备份
                scheduleBackup();
            }, delay);
        }
        
        scheduleBackup();
        console.log('[备份] 定时备份功能已启用（每天6:00 和 22:00）');
    });
}

startServer();
