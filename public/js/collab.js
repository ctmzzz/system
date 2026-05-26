(function() {
    'use strict';

    if (window.__kickListenerAdded) return;
    window.__kickListenerAdded = true;   // 原来有两个重复判断，修正为一个
    window.__collabInitialized = true;

    var socket = null;
    var connected = false;
    var userId = null;
    var userRole = null;
    var classId = null;
    var sessionId = null;
    var reconnectTimer = null;
    var reconnectAttempts = 0;
    var MAX_RECONNECT_DELAY = 30000;

    var pendingWrites = {};
    var writeTimers = {};

    var eventCallbacks = {
        collab_update: [],
        collab_locked: [],
        collab_unlocked: [],
        cursor_update: [],
        kicked: [],
        room_joined: [],
        connect: [],
        disconnect: []
    };

    function generateClientId() {
        return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    var clientId = localStorage.getItem('__collab_clientId') || generateClientId();
    localStorage.setItem('__collab_clientId', clientId);

    // 状态变量
    var kicked = false;

    // ⭐ 1. 把 goLogin 提到这里（IIFE 顶层），让所有函数都能调用
    function goLogin(type) {

        if (window.__loggingOutDone) return;

        window.__loggingOutDone = true;

        console.log('[Collab] 跳转登录:', type);

        try {

            disconnect();

        } catch(e) {}

        // ⭐ 给 socket 50ms 真正关闭
        setTimeout(function () {

            window.location.replace('/login');

        }, 50);
    }
    // ⭐ 2. 简化 window.__kickExit，直接调用 goLogin
    window.__kickExit = function () {
        console.log('[Collab] 手动触发退出 (window.__kickExit)');
        goLogin('manual');
    };

    // 统一退出清理函数（可选，目前未直接调用，但可保留）
    async function logout(reason) {
        if (window.__loggingOut) return;
        window.__loggingOut = true;

        console.log('[Auth] logout:', reason);

        try {
            if (window.Collab && Collab.disconnect) {
                Collab.disconnect();
            }
        } catch(e) {}

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            console.warn('[Auth] 后端登出失败，但继续退出');
        }

        localStorage.clear();
        sessionStorage.clear();

        goLogin(reason);   // 调用顶层 goLogin
    }

    function showKickModal(message) {
        if (kicked) return;
        kicked = true;
        var body = (message || '已在其他设备登录').toString();
        var text = '账号被踢出\n\n' + body;
        try {
            window.alert(text);
        } catch (e) {
            console.warn('[Collab] alert 失败:', e);
        }
        goLogin('kicked');
    }

    // ---------- 以下为原有 socket 和 API 方法，保持不变 ----------
    function connect() {
        if (socket && socket.connected) return;

        socket = io(window.location.origin, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            timeout: 20000
        });

        socket.on('connect', function() {
            console.log('[Collab] WebSocket 已连接');
            connected = true;
            reconnectAttempts = 0;
            fireCallbacks('connect', {});
        });

        socket.on('disconnect', function(reason) {
            console.log('[Collab] WebSocket 断开:', reason);
            connected = false;
            fireCallbacks('disconnect', { reason: reason });
        });

        socket.on('connect_error', function(err) {
            console.warn('[Collab] 连接错误:', err.message);
            connected = false;
        });

        socket.on('room_joined', function(data) {
            console.log('[Collab] 加入房间:', data.room);
            classId = data.classId;
            fireCallbacks('room_joined', data);
        });

        socket.on('collab_update', function(data) {
            console.log('[Collab] 收到协同更新:', data.docType, data.docId);
            fireCallbacks('collab_update', data);
        });

        socket.on('collab_locked', function(data) {
            console.log('[Collab] 文档被锁定:', data.docType, data.docId, 'by', data.lockedBy);
            fireCallbacks('collab_locked', data);
        });

        socket.on('collab_unlocked', function(data) {
            console.log('[Collab] 文档解锁:', data.docType, data.docId);
            fireCallbacks('collab_unlocked', data);
        });

        socket.on('cursor_update', function(data) {
            fireCallbacks('cursor_update', data);
        });

        socket.on('kicked', function(data) {
            console.warn('[Collab] 收到 kicked 事件:', data);
            fireCallbacks('kicked', data);
            if (socket) socket.disconnect();
            showKickModal(data.message || '连接已被断开');
        });

        socket.on('collab_ack', function(data) {
            if (data.status === 'ok' && pendingWrites[data.docId]) {
                delete pendingWrites[data.docId];
            }
        });

        socket.on('collab_lock_granted', function(data) {
            console.log('[Collab] 获得锁:', data.docType, data.docId);
        });

        socket.on('collab_lock_denied', function(data) {
            console.log('[Collab] 锁被拒绝:', data.docType, data.docId);
        });
    }

    function fireCallbacks(event, data) {
        var cbs = eventCallbacks[event] || [];
        for (var i = 0; i < cbs.length; i++) {
            try { cbs[i](data); } catch(e) { console.error('[Collab] 回调错误:', e); }
        }
    }

    function isClassRole() {
        var currentUser = window.currentUser;
        if (!currentUser) return false;
        return currentUser.role === 'class';
    }

    function sendEdit(docType, docId, content) {
        if (!isClassRole()) {
            console.warn('[Collab] 只有班级账号才能使用协同编辑功能');
            return;
        }
        if (!socket || !connected) {
            console.warn('[Collab] 未连接，编辑将延迟发送');
            queueWrite(docType, docId, content);
            return;
        }
        var timestamp = Date.now();
        socket.emit('collab_edit', {
            docType: docType,
            docId: docId,
            content: content,
            timestamp: timestamp,
            clientId: clientId
        });
    }

    function queueWrite(docType, docId, content) {
        if (!isClassRole()) return;
        var key = docType + '_' + docId;
        if (writeTimers[key]) clearTimeout(writeTimers[key]);
        pendingWrites[key] = { docType: docType, docId: docId, content: content };
        writeTimers[key] = setTimeout(function() {
            if (socket && connected && isClassRole()) {
                var w = pendingWrites[key];
                if (w) {
                    sendEdit(w.docType, w.docId, w.content);
                    delete pendingWrites[key];
                }
            }
            delete writeTimers[key];
        }, 500);
    }

    function lockDocument(docType, docId) {
        if (!isClassRole()) return;
        if (!socket || !connected) return;
        socket.emit('collab_lock', { docType: docType, docId: docId });
    }

    function unlockDocument(docType, docId) {
        if (!isClassRole()) return;
        if (!socket || !connected) return;
        socket.emit('collab_unlock', { docType: docType, docId: docId });
    }

    function sendCursor(docType, docId, position) {
        if (!isClassRole()) return;
        if (!socket || !connected) return;
        socket.emit('cursor_move', {
            docType: docType,
            docId: docId,
            position: position
        });
    }

    function on(event, callback) {
        if (!eventCallbacks[event]) eventCallbacks[event] = [];
        eventCallbacks[event].push(callback);
    }

    function off(event, callback) {
        if (!eventCallbacks[event]) return;
        var idx = eventCallbacks[event].indexOf(callback);
        if (idx !== -1) eventCallbacks[event].splice(idx, 1);
    }

    function isConnected() {
        return connected;
    }

    function getClientId() {
        return clientId;
    }

    function disconnect() {

        window.__loggingOut = true;

        if (socket) {

            // ⭐ 禁止自动重连
            socket.io.opts.reconnection = false;

            // ⭐ 清理所有监听
            socket.removeAllListeners();

            // ⭐ 强制关闭底层连接
            socket.close();

            socket.disconnect();

            socket = null;
        }

        connected = false;
    }

    function getSessionInfo() {
        return {
            clientId: clientId,
            connected: connected,
            classId: classId
        };
    }

    function fetchSessions() {
        return fetch('/api/auth/sessions').then(function(r) { return r.json(); });
    }

    function kickSession(socketId) {
        return fetch('/api/auth/kick-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ socketId: socketId })
        }).then(function(r) { return r.json(); });
    }

    window.Collab = {
        connect: connect,
        disconnect: disconnect,
        sendEdit: sendEdit,
        lockDocument: lockDocument,
        unlockDocument: unlockDocument,
        sendCursor: sendCursor,
        on: on,
        off: off,
        isConnected: isConnected,
        getClientId: getClientId,
        getSessionInfo: getSessionInfo,
        fetchSessions: fetchSessions,
        kickSession: kickSession,
        showKickModal: showKickModal
    };

    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            fetch('/api/auth/check').then(function(r) { return r.json(); }).then(function(data) {
                if (!data.loggedIn) goLogin('bfcache');
            }).catch(function() {});
        }
    });
})();