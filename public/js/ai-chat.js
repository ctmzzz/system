(function () {
    var messages = [];
    var PROXY_URL = '/api/ollama/chat';
    var MODEL_NAME = 'qwen2.5:3b';
    var hasInitialAnalysis = false;
    var isAnalyzing = false;
    var userRole = '';
    var currentPage = '';
    var chatOverlay = null;
    var isDragging = false;
    var isResizing = false;
    var resizeDirection = 'se';
    var dragStartX = 0;
    var dragStartY = 0;
    var startLeft = 0;
    var startTop = 0;
    var startWidth = 0;
    var startHeight = 0;

    function createFloatBtn() {
        var btn = document.createElement('button');
        btn.id = 'aiFloatBtn';
        btn.title = 'AI助手';
        btn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);box-shadow:0 4px 16px rgba(79,70,229,0.4);border:none;cursor:pointer;z-index:99999;font-size:20px;color:#fff;font-weight:bold;display:flex;align-items:center;justify-content:center;';
        btn.textContent = '🤖';
        btn.onclick = toggleChat;
        document.body.appendChild(btn);
    }

    function createChatBox() {
        chatOverlay = document.createElement('div');
        chatOverlay.id = 'aiChatOverlay';
        chatOverlay.style.cssText = 'position:fixed;bottom:100px;right:30px;width:400px;height:560px;background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.2);display:none;flex-direction:column;z-index:100000;overflow:hidden;min-width:300px;min-height:400px;';

        var header = document.createElement('div');
        header.style.cssText = 'background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;cursor:move;user-select:none;';

        var title = document.createElement('span');
        title.id = 'aiChatTitle';
        title.style.cssText = 'font-size:16px;font-weight:600;';
        title.textContent = 'AI分析助手';

        var closeBtn = document.createElement('button');
        closeBtn.id = 'aiChatClose';
        closeBtn.style.cssText = 'background:none;border:none;color:#fff;font-size:24px;cursor:pointer;padding:0;line-height:1;';
        closeBtn.textContent = '×';
        closeBtn.onclick = closeChat;

        header.appendChild(title);
        header.appendChild(closeBtn);

        var msgArea = document.createElement('div');
        msgArea.id = 'aiChatMessages';
        msgArea.style.cssText = 'flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;background:#f9fafb;';

        var sysMsg = document.createElement('div');
        sysMsg.id = 'aiSystemHint';
        sysMsg.style.cssText = 'align-self:center;background:#eef2ff;color:#6366f1;font-size:12px;padding:8px 16px;border-radius:12px;';
        sysMsg.textContent = '打开对话框将自动分析当前页面数据';
        msgArea.appendChild(sysMsg);

        var inputArea = document.createElement('div');
        inputArea.style.cssText = 'padding:14px 16px;border-top:1px solid #e5e7eb;display:flex;gap:12px;background:#fff;';

        var input = document.createElement('input');
        input.id = 'aiChatInput';
        input.type = 'text';
        input.placeholder = '输入消息...';
        input.maxLength = 500;
        input.style.cssText = 'flex:1;border:1px solid #e5e7eb;border-radius:20px;padding:12px 16px;font-size:14px;outline:none;transition:border-color 0.2s;';
        input.onfocus = function() {
            this.style.borderColor = '#4F46E5';
        };
        input.onblur = function() {
            this.style.borderColor = '#e5e7eb';
        };
        input.onkeydown = function(e) {
            if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
        };

        var sendBtn = document.createElement('button');
        sendBtn.id = 'aiChatSend';
        sendBtn.title = '发送';
        sendBtn.style.cssText = 'width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;transition:transform 0.15s;';
        sendBtn.textContent = '➤';
        sendBtn.onclick = sendMessage;
        sendBtn.onmouseover = function() {
            this.style.transform = 'scale(1.05)';
        };
        sendBtn.onmouseout = function() {
            this.style.transform = 'scale(1)';
        };

        inputArea.appendChild(input);
        inputArea.appendChild(sendBtn);

        var resizeHandleSE = document.createElement('div');
        resizeHandleSE.style.cssText = 'position:absolute;bottom:0;right:0;width:20px;height:20px;cursor:se-resize;';
        resizeHandleSE.onmousedown = function(e) {
            e.stopPropagation();
            isResizing = true;
            resizeDirection = 'se';
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startWidth = chatOverlay.offsetWidth;
            startHeight = chatOverlay.offsetHeight;
        };

        var resizeHandleSW = document.createElement('div');
        resizeHandleSW.style.cssText = 'position:absolute;bottom:0;left:0;width:20px;height:20px;cursor:sw-resize;';
        resizeHandleSW.onmousedown = function(e) {
            e.stopPropagation();
            isResizing = true;
            resizeDirection = 'sw';
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startLeft = chatOverlay.offsetLeft;
            startWidth = chatOverlay.offsetWidth;
            startHeight = chatOverlay.offsetHeight;
            chatOverlay.style.bottom = 'auto';
            chatOverlay.style.right = 'auto';
            if (!chatOverlay.style.left) chatOverlay.style.left = (window.innerWidth - 30 - startWidth) + 'px';
            if (!chatOverlay.style.top) chatOverlay.style.top = (window.innerHeight - 100 - startHeight) + 'px';
        };

        chatOverlay.appendChild(header);
        chatOverlay.appendChild(msgArea);
        chatOverlay.appendChild(inputArea);
        chatOverlay.appendChild(resizeHandleSE);
        chatOverlay.appendChild(resizeHandleSW);
        document.body.appendChild(chatOverlay);

        header.onmousedown = function(e) {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startLeft = chatOverlay.offsetLeft;
            startTop = chatOverlay.offsetTop;
            chatOverlay.style.bottom = 'auto';
            chatOverlay.style.right = 'auto';
            if (!chatOverlay.style.left) chatOverlay.style.left = (window.innerWidth - 30 - chatOverlay.offsetWidth) + 'px';
            if (!chatOverlay.style.top) chatOverlay.style.top = (window.innerHeight - 100 - chatOverlay.offsetHeight) + 'px';
            startLeft = chatOverlay.offsetLeft;
            startTop = chatOverlay.offsetTop;
        };

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                var dx = e.clientX - dragStartX;
                var dy = e.clientY - dragStartY;
                chatOverlay.style.left = (startLeft + dx) + 'px';
                chatOverlay.style.top = (startTop + dy) + 'px';
            } else if (isResizing) {
                var dx = e.clientX - dragStartX;
                var dy = e.clientY - dragStartY;
                if (resizeDirection === 'se') {
                    chatOverlay.style.width = Math.max(300, startWidth + dx) + 'px';
                    chatOverlay.style.height = Math.max(400, startHeight + dy) + 'px';
                } else if (resizeDirection === 'sw') {
                    var newWidth = Math.max(300, startWidth - dx);
                    chatOverlay.style.width = newWidth + 'px';
                    chatOverlay.style.left = (startLeft + startWidth - newWidth) + 'px';
                    chatOverlay.style.height = Math.max(400, startHeight + dy) + 'px';
                }
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            isResizing = false;
        });
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getCurrentPageSelection() {
        var selection = {};
        var path = window.location.pathname;

        if (path === '/dashboard' || path === '/') {
            // 成绩分析页面
            if (typeof currentExamId !== 'undefined') selection.exam_id = currentExamId;
            if (typeof currentClassId !== 'undefined') selection.class_id = currentClassId;
        } else if (path === '/detail-analysis') {
            // 详细汇总页面
            if (typeof currentClassId !== 'undefined') selection.class_id = currentClassId;
            if (typeof currentStudentId !== 'undefined') selection.student_id = currentStudentId;
        } else if (path === '/events') {
            // 事件页面
            if (typeof calYear !== 'undefined') selection.year = calYear;
            if (typeof calMonth !== 'undefined') selection.month = calMonth + 1;
        } else if (path === '/total-table') {
            // 总表页面
            if (typeof currentClassId !== 'undefined') selection.class_id = currentClassId;
            var monthPicker = document.getElementById('monthPicker');
            if (monthPicker && monthPicker.value) {
                var parts = monthPicker.value.split('-');
                selection.year = parseInt(parts[0]);
                selection.month = parseInt(parts[1]);
            }
        } else if (path === '/homework-data') {
            // 作业数据页面
            var semesterSelect = document.getElementById('semesterSelect');
            var classSelect = document.getElementById('classSelect');
            var subjectSelect = document.getElementById('subjectSelect');
            var dateInput = document.getElementById('dateInput');

            if (semesterSelect && semesterSelect.value) selection.semester = semesterSelect.value;
            if (classSelect && classSelect.value) selection.class_id = classSelect.value;
            if (subjectSelect && subjectSelect.value) selection.subject = subjectSelect.value;
            if (dateInput && dateInput.value) selection.date = dateInput.value;
        } else if (path === '/period-stats') {
            // 周期统计页面
            var startMonth = document.getElementById('startMonth');
            var endMonth = document.getElementById('endMonth');
            if (startMonth && startMonth.value) selection.start_month = startMonth.value;
            if (endMonth && endMonth.value) selection.end_month = endMonth.value;
        }

        return selection;
    }

    function formatText(text) {
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    function addUserMessage(text) {
        var container = document.getElementById('aiChatMessages');
        var el = document.createElement('div');
        el.style.cssText = 'align-self:flex-end;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;max-width:85%;padding:12px 16px;border-radius:16px 16px 4px 16px;font-size:14px;line-height:1.6;word-break:break-word;box-shadow:0 2px 6px rgba(79,70,229,0.2);';
        el.innerHTML = formatText(text);
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
    }

    function createBotBubble() {
        var container = document.getElementById('aiChatMessages');
        var el = document.createElement('div');
        el.className = 'aiBotBubble';
        el.style.cssText = 'align-self:flex-start;background:#fff;color:#374151;border:1px solid #e5e7eb;max-width:85%;padding:14px 18px;border-radius:16px;font-size:14px;line-height:1.7;word-break:break-word;box-shadow:0 2px 4px rgba(0,0,0,0.05);';
        el.textContent = '正在思考...';
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
        return el;
    }

    function scrollToBottom() {
        var container = document.getElementById('aiChatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }

    function updateHint(text) {
        var hintEl = document.getElementById('aiSystemHint');
        if (hintEl) hintEl.textContent = text;
    }

    async function doInitialAnalysis() {
        if (isAnalyzing || hasInitialAnalysis) return;
        isAnalyzing = true;

        updateHint('正在获取数据...');
        console.log('[AI分析] 开始自动分析，当前页面:', currentPage);

        var botBubble = null;

        try {
            var selection = getCurrentPageSelection();
            console.log('[AI分析] 当前页面选择:', selection);

            var queryParams = new URLSearchParams();
            queryParams.append('page', currentPage);
            for (var key in selection) {
                if (selection[key] !== null && selection[key] !== undefined) {
                    queryParams.append(key, selection[key]);
                }
            }

            var ctxRes = await fetch('/api/ai/context?' + queryParams.toString());
            var ctxData = await ctxRes.json();
            console.log('[AI分析] 上下文接口返回:', ctxData.success, ctxData.data ? '有数据' : '无数据');

            if (!ctxData.success || !ctxData.data || !ctxData.data.context) {
                updateHint('暂无数据可分析，您可以自由提问');
                isAnalyzing = false;
                hasInitialAnalysis = true;
                return;
            }

            var contextText = ctxData.data.context;
            console.log('[AI分析] 上下文长度:', contextText.length, '字符');

            messages = [{ role: 'system', content: contextText }];

            botBubble = createBotBubble();
            botBubble.textContent = '正在分析...';
            updateHint('AI正在分析数据...');

            var response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error('AI服务返回错误: ' + response.status);
            }

            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var botText = '';

            while (true) {
                var result = await reader.read();
                if (result.done) break;

                var chunk = decoder.decode(result.value, { stream: true });
                var lines = chunk.split('\n').filter(function(line) { return line.trim(); });

                for (var i = 0; i < lines.length; i++) {
                    try {
                        var data = JSON.parse(lines[i]);
                        if (data.message && data.message.content) {
                            botText += data.message.content;
                            botBubble.innerHTML = formatText(botText);
                            scrollToBottom();
                        }
                    } catch (e) {}
                }
            }

            if (!botText) {
                botBubble.textContent = 'AI返回了空内容，请稍后重试或手动输入问题。';
            } else {
                messages.push({ role: 'assistant', content: botText });
            }

            updateHint('以上为自动分析结果，您可继续提问');

        } catch (error) {
            console.error('[AI分析] 失败:', error.message || error);
            if (botBubble) {
                botBubble.textContent = '分析失败，请检查AI服务是否正常运行。\n您也可以在下方手动输入问题。';
            }
            updateHint('自动分析失败，您可手动输入问题');
        }

        hasInitialAnalysis = true;
        isAnalyzing = false;
    }

    async function refreshContext() {
        try {
            var selection = getCurrentPageSelection();
            console.log('[AI分析] 获取最新选择:', selection);

            var queryParams = new URLSearchParams();
            queryParams.append('page', currentPage);
            for (var key in selection) {
                if (selection[key] !== null && selection[key] !== undefined) {
                    queryParams.append(key, selection[key]);
                }
            }

            var ctxRes = await fetch('/api/ai/context?' + queryParams.toString());
            var ctxData = await ctxRes.json();

            if (ctxData.success && ctxData.data && ctxData.data.context) {
                var systemMessage = { role: 'system', content: ctxData.data.context };
                // 替换或添加系统消息
                if (messages.length > 0 && messages[0].role === 'system') {
                    messages[0] = systemMessage;
                } else {
                    messages.unshift(systemMessage);
                }
                return true;
            }
        } catch (e) {
            console.error('[AI分析] 刷新上下文失败:', e);
        }
        return false;
    }

    async function sendMessage() {
        var input = document.getElementById('aiChatInput');
        var text = input.value.trim();
        if (!text) return;

        if (messages.length === 0) {
            await doInitialAnalysis();
            if (messages.length === 0) return;
        }

        // 刷新当前页面的上下文数据
        await refreshContext();

        messages.push({ role: 'user', content: text });
        input.value = '';
        input.disabled = true;

        addUserMessage(text);
        var botBubble = createBotBubble();

        try {
            var response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error('网络错误: ' + response.status);
            }

            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var botText = '';

            while (true) {
                var result = await reader.read();
                if (result.done) break;

                var chunk = decoder.decode(result.value, { stream: true });
                var lines = chunk.split('\n').filter(function(line) { return line.trim(); });

                for (var i = 0; i < lines.length; i++) {
                    try {
                        var data = JSON.parse(lines[i]);
                        if (data.message && data.message.content) {
                            botText += data.message.content;
                            botBubble.innerHTML = formatText(botText);
                            scrollToBottom();
                        }
                    } catch (e) {}
                }
            }

            messages.push({ role: 'assistant', content: botText });

        } catch (error) {
            botBubble.textContent = '❌ 连接失败，请检查:\n1. Ollama 是否在 192.168.3.6:11434 运行\n2. 是否已拉取 qwen2.5:3b 模型';
            console.error(error);
        }

        input.disabled = false;
        input.focus();
    }

    function openChat() {
        if (!chatOverlay) return;
        chatOverlay.style.display = 'flex';

        // 每次打开聊天都重新分析，确保使用最新选择的时间范围
        if (!isAnalyzing) {
            // 重置状态
            messages = [];
            hasInitialAnalysis = false;
            // 清空聊天记录，保留系统提示
            var container = document.getElementById('aiChatMessages');
            var systemHint = document.getElementById('aiSystemHint');
            container.innerHTML = '';
            if (systemHint) container.appendChild(systemHint);
            
            // 在这些页面不自动生成分析：events, total-table, attendance, homework-data
            var noAutoAnalysisPages = ['/events', '/total-table', '/attendance', '/homework-data'];
            if (noAutoAnalysisPages.includes(currentPage)) {
                // 不自动生成分析，显示提示
                updateHint('有什么我可以帮助您的吗？');
                return;
            }
            
            // 在 detail-analysis 页面检查是否已选择学生
            if (currentPage === '/detail-analysis') {
                var isTeacher = userRole === 'teacher';
                var hasSelection = false;
                
                if (isTeacher) {
                    // 教师端需要选择班级和学生
                    hasSelection = window.currentClassId && window.currentStudentId;
                    if (!hasSelection) {
                        // 显示提示信息
                        var hintDiv = document.createElement('div');
                        hintDiv.style.cssText = 'align-self:center;background:#fef3c7;color:#92400e;font-size:14px;padding:10px 16px;border-radius:12px;max-width:80%;text-align:center;';
                        hintDiv.textContent = '请先在页面上选择班级和学生，我才能为您提供分析服务。';
                        container.appendChild(hintDiv);
                        return; // 不进行初始分析
                    }
                } else {
                    // 学生端需要有学生ID
                    hasSelection = window.currentStudentId;
                    if (!hasSelection) {
                        var hintDiv = document.createElement('div');
                        hintDiv.style.cssText = 'align-self:center;background:#fef3c7;color:#92400e;font-size:14px;padding:10px 16px;border-radius:12px;max-width:80%;text-align:center;';
                        hintDiv.textContent = '正在加载您的数据，请稍候...';
                        container.appendChild(hintDiv);
                        return; // 不进行初始分析
                    }
                }
            }
            
            doInitialAnalysis();
        }
    }

    function closeChat() {
        if (!chatOverlay) return;
        chatOverlay.style.display = 'none';
    }

    function toggleChat() {
        if (!chatOverlay) return;
        if (chatOverlay.style.display === 'flex') {
            closeChat();
        } else {
            openChat();
        }
    }

    async function init() {
        try {
            var response = await fetch('/api/current-user');
            var result = await response.json();

            if (result.success && result.data) {
                userRole = result.data.role;
                currentPage = window.location.pathname;

                // 排除 teacher-admin 和 homework-manage 页面
                var excludedPages = ['/teacher-admin', '/homework-manage'];
                var isExcluded = excludedPages.some(function(page) {
                    return currentPage.startsWith(page);
                });

                if ((userRole === 'teacher' || userRole === 'student') && !isExcluded) {
                    createFloatBtn();
                    createChatBox();
                    console.log('[AI助手] 已初始化，角色:', userRole);
                }
            }
        } catch (e) {
            console.error('获取用户信息失败:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();