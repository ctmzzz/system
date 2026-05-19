const { Server } = require('socket.io');
const http = require('http');
const crypto = require('crypto');

const CLASS_MAX_SESSIONS = 2;
const TEACHER_MAX_SESSIONS = 1;
const FAST_RECONNECT_MS = 2000; // 2秒内的重连认为是页面刷新

const sessionStore = new Map();

const writeLocks = new Map();

const recentWrites = new Map();

const onlineSockets = new Map(); // employee_id -> socket

const recentDisconnects = new Map(); // employee_id -> { time, sessionId }

let ioInstance = null;

function createWebSocketServer(app, sessionMiddleware, hooks = {}) {
    const onSocketActivity = typeof hooks.onSocketActivity === 'function' ? hooks.onSocketActivity : null;
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: true,
            credentials: true,
            methods: ['GET', 'POST']
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        connectTimeout: 10000,
        maxHttpBufferSize: 1e7
    });

    ioInstance = io;

    io.engine.use(sessionMiddleware);

    io.use((socket, next) => {
        const req = socket.request;
        if (!req.session || !req.session.user) {
            return next(new Error('未登录'));
        }
        socket.userId = req.session.user.id;
        socket.employeeId = req.session.user.employee_id;
        socket.userRole = req.session.user.role;
        socket.userName = req.session.user.name;
        socket.classId = req.session.user.class_id || null;
        socket.sessionId = req.sessionID;
        next();
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        const role = socket.userRole;
        const classId = socket.classId;
        const sessionId = socket.sessionId;
        const employeeId = socket.employeeId;
        const now = Date.now();

        // 检查是否是快速重连（页面刷新）
        const recentDisconnect = recentDisconnects.get(employeeId);
        const isFastReconnect = recentDisconnect && 
                               (now - recentDisconnect.time < FAST_RECONNECT_MS) && 
                               (recentDisconnect.sessionId === sessionId);

        if (!isFastReconnect) {
            console.log(`[WS] 连接: ${socket.userName}(${socket.employeeId}) [${role}] session=${sessionId} socketId=${socket.id}`);
        }

        // 保存到 onlineSockets
        if (employeeId) {
            onlineSockets.set(employeeId, socket);
            if (!isFastReconnect) {
                console.log(`[WS] 已绑定用户: ${socket.userName}(${employeeId}) 到 socket=${socket.id}`);
            }
        }

        // 清理 recentDisconnects
        if (recentDisconnect) {
            recentDisconnects.delete(employeeId);
        }

        if (!sessionStore.has(userId)) {
            sessionStore.set(userId, []);
        }
        const sessions = sessionStore.get(userId);
        
        // 在快速重连时，先移除旧的 socket（防止重复）
        if (isFastReconnect) {
            const idx = sessions.findIndex(s => s.sessionId === sessionId);
            if (idx !== -1) {
                sessions.splice(idx, 1);
            }
        }

        // 清理已经不存在的僵尸会话（socket 已断开但记录还在）
        for (let i = sessions.length - 1; i >= 0; i--) {
            if (!io.sockets.sockets.get(sessions[i].socketId)) {
                sessions.splice(i, 1);
            }
        }
        
        if (!isFastReconnect) {
            console.log(`[WS] userId=${userId} 当前会话数: ${sessions.length}`);
        }

        // 确定最大会话数
        const maxSessions = role === 'class' ? CLASS_MAX_SESSIONS : TEACHER_MAX_SESSIONS;
        
        // 如果会话数已达上限，拒绝新连接
        if (sessions.length >= maxSessions) {
            socket.emit('kicked', { message: `该账号已有${maxSessions}个设备在线，请先退出一个设备后再登录` });
            socket.disconnect(true);
            return;
        }

        sessions.push({
            socketId: socket.id,
            sessionId: sessionId,
            connectedAt: Date.now(),
            ip: socket.handshake.address
        });
        
        if (!isFastReconnect) {
            console.log(`[WS] userId=${userId} 添加新会话, 当前总会话数: ${sessions.length}`);
        }

        if (onSocketActivity) onSocketActivity(socket);

        if (classId && role === 'class') {
            const room = `class_${classId}`;
            socket.join(room);
            socket.emit('room_joined', { room, classId });
            if (!isFastReconnect) {
                console.log(`[WS] ${socket.userName} 加入房间 ${room}`);
            }
        }

        socket.on('collab_edit', (data) => {
            if (onSocketActivity) onSocketActivity(socket);
            if (!classId) return;
            const { docType, docId, content, timestamp, clientId } = data;
            if (!docType || !docId || content === undefined) return;

            const writeKey = `${docType}_${docId}_${clientId}_${timestamp}`;
            const hash = crypto.createHash('md5').update(JSON.stringify(content)).digest('hex');

            if (recentWrites.has(writeKey)) {
                socket.emit('collab_ack', { docType, docId, status: 'duplicate', timestamp });
                return;
            }

            const contentKey = `${docType}_${docId}_${hash}`;
            const now = Date.now();
            if (recentWrites.has(contentKey)) {
                const lastTime = recentWrites.get(contentKey);
                if (now - lastTime < 3000) {
                    socket.emit('collab_ack', { docType, docId, status: 'duplicate_content', timestamp });
                    return;
                }
            }

            recentWrites.set(writeKey, true);
            recentWrites.set(contentKey, now);

            setTimeout(() => {
                recentWrites.delete(writeKey);
            }, 10000);

            const room = `class_${classId}`;
            socket.to(room).emit('collab_update', {
                docType,
                docId,
                content,
                timestamp,
                clientId,
                editorName: socket.userName,
                editorId: socket.employeeId
            });

            socket.emit('collab_ack', { docType, docId, status: 'ok', timestamp });
        });

        socket.on('collab_lock', (data) => {
            if (onSocketActivity) onSocketActivity(socket);
            if (!classId) return;
            const { docType, docId } = data;
            const lockKey = `${classId}_${docType}_${docId}`;

            if (writeLocks.has(lockKey) && writeLocks.get(lockKey) !== socket.id) {
                socket.emit('collab_lock_denied', { docType, docId, lockedBy: writeLocks.get(lockKey) });
                return;
            }

            writeLocks.set(lockKey, socket.id);
            socket.emit('collab_lock_granted', { docType, docId });

            const room = `class_${classId}`;
            socket.to(room).emit('collab_locked', {
                docType,
                docId,
                lockedBy: socket.userName
            });
        });

        socket.on('collab_unlock', (data) => {
            if (onSocketActivity) onSocketActivity(socket);
            if (!classId) return;
            const { docType, docId } = data;
            const lockKey = `${classId}_${docType}_${docId}`;

            if (writeLocks.get(lockKey) === socket.id) {
                writeLocks.delete(lockKey);

                const room = `class_${classId}`;
                socket.to(room).emit('collab_unlocked', {
                    docType,
                    docId,
                    unlockedBy: socket.userName
                });
            }
        });

        socket.on('cursor_move', (data) => {
            if (onSocketActivity) onSocketActivity(socket);
            if (!classId) return;
            const room = `class_${classId}`;
            socket.to(room).emit('cursor_update', {
                clientId: socket.id,
                userName: socket.userName,
                docType: data.docType,
                docId: data.docId,
                position: data.position
            });
        });

        socket.on('disconnect', () => {
            const now = Date.now();
            const employeeId = socket.employeeId;
            const sessionId = socket.sessionId;

            // 先记录断开时间
            if (employeeId) {
                recentDisconnects.set(employeeId, { time: now, sessionId: sessionId });
            }

            // 检查是否是快速重连（延迟判断，因为新连接可能还没到）
            setTimeout(() => {
                const recentDisconnect = recentDisconnects.get(employeeId);
                const isFastReconnect = recentDisconnect && 
                                       (Date.now() - recentDisconnect.time < FAST_RECONNECT_MS + 500);

                if (!isFastReconnect) {
                    console.log(`[WS] 断开: ${socket.userName}(${socket.employeeId}) socketId=${socket.id}`);
                }

                // 从 onlineSockets 移除
                if (socket.employeeId) {
                    const currentSocket = onlineSockets.get(socket.employeeId);
                    if (currentSocket === socket) {
                        onlineSockets.delete(socket.employeeId);
                        if (!isFastReconnect) {
                            console.log(`[WS] 已从 onlineSockets 移除: ${socket.userName}(${socket.employeeId})`);
                        }
                    }
                }

                // 清理 recentDisconnects
                if (recentDisconnect && Date.now() - recentDisconnect.time >= FAST_RECONNECT_MS + 500) {
                    recentDisconnects.delete(employeeId);
                }

                // 从 sessionStore 移除
                if (sessionStore.has(userId)) {
                    const sessions = sessionStore.get(userId);
                    const idx = sessions.findIndex(s => s.socketId === socket.id);
                    if (idx !== -1) {
                        sessions.splice(idx, 1);
                    }
                    if (sessions.length === 0) {
                        sessionStore.delete(userId);
                    }
                }

                // 清理写锁
                for (const [lockKey, socketId] of writeLocks.entries()) {
                    if (socketId === socket.id) {
                        writeLocks.delete(lockKey);
                        if (classId) {
                            const room = `class_${classId}`;
                            const parts = lockKey.split('_');
                            const docType = parts[1];
                            const docId = parts.slice(2).join('_');
                            socket.to(room).emit('collab_unlocked', {
                                docType,
                                docId,
                                unlockedBy: socket.userName
                            });
                        }
                    }
                }
            }, FAST_RECONNECT_MS + 300);
        });
    });

    return { server, io };
}

function getSessionCount(userId) {
    if (!sessionStore.has(userId)) return 0;
    return sessionStore.get(userId).length;
}

function getUserSessions(userId) {
    return sessionStore.get(userId) || [];
}

function broadcastToClass(io, classId, event, data) {
    io.to(`class_${classId}`).emit(event, data);
}

function kickSocketsForSession(sessionId, message) {
    if (!sessionId) return;
    if (!ioInstance) return;
    const msg = message || '会话已失效';
    let n = 0;
    for (const s of ioInstance.sockets.sockets.values()) {
        if (s && s.sessionId === sessionId) {
            n++;
            try {
                s.emit('kicked', { message: msg });
                s.disconnect(true);
            } catch (e) {
                console.warn('[WS] kickSocketsForSession disconnect 异常:', e && e.message);
            }
        }
    }
    if (n > 0) {
        console.log(`[WS] 按 session 断开 ${n} 个 socket sessionId=${sessionId}`);
    }
}

function kickUserSessions(employeeId, message) {
    console.log(`[WS] kickUserSessions 被调用, employeeId=${employeeId}, message=${message}`);
    if (!ioInstance) {
        console.log('[WS] kickUserSessions 失败: ioInstance 未初始化');
        return;
    }
    const msg = message || '账号已在其他设备登录';
    const socketsToKick = [];
    for (const s of ioInstance.sockets.sockets.values()) {
        if (s && s.employeeId === employeeId) {
            socketsToKick.push(s);
        }
    }
    if (socketsToKick.length === 0) {
        console.log(`[WS] 没有找到在线 socket: ${employeeId}`);
        return;
    }
    console.log(`[WS] 找到 ${socketsToKick.length} 个在线 socket (${employeeId})，发送 kicked`);
    for (const s of socketsToKick) {
        s.emit('kicked', { message: msg });
    }
    setTimeout(() => {
        for (const s of socketsToKick) {
            try {
                s.disconnect(true);
            } catch (e) {
                console.warn('[WS] disconnect 异常:', e && e.message);
            }
        }
        console.log(`[WS] 已断开 ${socketsToKick.length} 个 socket: ${employeeId}`);
    }, 1000);
}

module.exports = {
    createWebSocketServer,
    getSessionCount,
    getUserSessions,
    broadcastToClass,
    kickUserSessions,
    kickSocketsForSession,
    CLASS_MAX_SESSIONS,
    TEACHER_MAX_SESSIONS
};
