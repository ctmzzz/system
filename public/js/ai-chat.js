(function () {
    var messages = [];
    var PROXY_URL = '/api/ollama/chat';
    var MODEL_NAME = 'qwen-plus';
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
    var lastChatPage = null; // 记录上次打开对话时的页面
    var isStreaming = false; // 是否正在流式输出
    var currentController = null; // 当前请求的AbortController
    var currentTimeoutId = null; // 当前超时定时器
    var currentBotBubble = null; // 当前正在输出的bot气泡
    var currentBotText = ''; // 当前正在输出的bot文本
    var isUserStopped = false; // 是否是用户主动停止

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
        title.textContent = 'AI助手';

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
        sendBtn.onclick = function() {
            if (isStreaming) {
                stopStream();
            } else {
                sendMessage();
            }
        };
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
            if (typeof window.currentClassId !== 'undefined' && window.currentClassId) selection.class_id = window.currentClassId;
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

        console.log('[AI] 当前页:', path, '选择:', selection);
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

    function createHint(text) {
        var hintEl = document.createElement('div');
        hintEl.id = 'aiSystemHint';
        hintEl.style.cssText = 'align-self:center;background:#eef2ff;color:#6366f1;font-size:12px;padding:8px 16px;border-radius:12px;';
        hintEl.textContent = text;
        return hintEl;
    }

    function updateHint(text) {
        var hintEl = document.getElementById('aiSystemHint');
        if (hintEl) {
            hintEl.textContent = text;
        }
    }

    function removeHint() {
        var hintEl = document.getElementById('aiSystemHint');
        if (hintEl) {
            hintEl.remove();
        }
    }

    // 更新按钮状态（发送/停止切换）
    function updateSendButton(isStopMode) {
        var btn = document.getElementById('aiChatSend');
        if (!btn) return;
        if (isStopMode) {
            btn.textContent = '■';
            btn.title = '停止';
            btn.style.background = 'linear-gradient(135deg,#EF4444,#DC2626)';
        } else {
            btn.textContent = '➤';
            btn.title = '发送';
            btn.style.background = 'linear-gradient(135deg,#4F46E5,#7C3AED)';
        }
    }

    // 停止当前流式输出
    function stopStream() {
        if (!isStreaming) return;
        isUserStopped = true; // 标记为用户主动停止
        if (currentController) {
            currentController.abort();
        }
        if (currentTimeoutId) {
            clearTimeout(currentTimeoutId);
        }
        // 保存当前已输出的文本到历史（已在currentBotText中，会在重置前保存）
        if (currentBotText && currentBotBubble) {
            messages.push({ role: 'assistant', content: currentBotText });
        }
        // 重置状态
        isStreaming = false;
        currentController = null;
        currentTimeoutId = null;
        currentBotBubble = null;
        currentBotText = '';
        updateSendButton(false);
        var input = document.getElementById('aiChatInput');
        if (input) input.disabled = false;
    }

    async function doInitialAnalysis() {
        if (isAnalyzing || hasInitialAnalysis) return;
        isAnalyzing = true;
        isUserStopped = false;

        var msgArea = document.getElementById('aiChatMessages');
        var initialHint = createHint('正在获取数据...');
        msgArea.appendChild(initialHint);
        
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

            console.log('[AI分析] 请求上下文:', queryParams.toString());

            var ctxRes = await fetch('/api/ai/context?' + queryParams.toString());
            var ctxData = await ctxRes.json();
            console.log('[AI分析] 上下文接口返回:', ctxData);

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

            var isNetworkTimeout = true;
            var controller = new AbortController();
            var timeoutId = setTimeout(function() { controller.abort(); }, 5000);

            // 设置全局状态以支持停止
            isStreaming = true;
            currentController = controller;
            currentTimeoutId = timeoutId;
            currentBotBubble = botBubble;
            currentBotText = '';
            updateSendButton(true);

            var response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: messages,
                    stream: true
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            isNetworkTimeout = false;
            timeoutId = setTimeout(function() { controller.abort(); }, 60000);
            currentTimeoutId = timeoutId;

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
                        var line = lines[i];
                        // 移除可能的 "data: " 前缀
                        if (line.startsWith('data: ')) {
                            line = line.substring(6);
                        }
                        // 跳过 [DONE] 标记
                        if (line === '[DONE]') {
                            continue;
                        }
                        var data = JSON.parse(line);
                        // 兼容 Ollama 和 OpenAI 两种格式
                        if (data.message && data.message.content) {
                            // Ollama 格式
                            botText += data.message.content;
                            botBubble.innerHTML = formatText(botText);
                            currentBotText = botText;
                            scrollToBottom();
                        } else if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                            // OpenAI/Qwen 格式
                            botText += data.choices[0].delta.content;
                            botBubble.innerHTML = formatText(botText);
                            currentBotText = botText;
                            scrollToBottom();
                        }
                    } catch (e) {}
                }
            }

            clearTimeout(timeoutId);

            if (!botText) {
                botBubble.textContent = 'AI返回了空内容，请稍后重试或手动输入问题。';
            } else {
                messages.push({ role: 'assistant', content: botText });
            }

            removeHint();
            var finalHint = createHint('以上为自动分析结果，您可继续提问');
            msgArea.appendChild(finalHint);

        } catch (error) {
            clearTimeout(currentTimeoutId);
            console.error('[AI分析] 失败:', error.message || error);
            // 如果不是用户主动停止，才显示错误
            if (!isUserStopped && botBubble) {
                if (error.name === 'AbortError') {
                    botBubble.textContent = '服务器繁忙，请稍后再试';
                } else {
                    botBubble.textContent = '❌ 网络连接失败，请稍后再试';
                }
                removeHint();
                var errorHint = createHint('自动分析失败，您可手动输入问题');
                msgArea.appendChild(errorHint);
            } else {
                // 用户主动停止，保留已输出内容，不添加错误提示
                removeHint();
            }
        }

        // 重置状态
        isStreaming = false;
        currentController = null;
        currentTimeoutId = null;
        currentBotBubble = null;
        currentBotText = '';
        updateSendButton(false);
        hasInitialAnalysis = true;
        isAnalyzing = false;
        isUserStopped = false;
    }

    var lastContextSelection = null;

    async function refreshContext() {
        try {
            var selection = getCurrentPageSelection();
            console.log('[AI分析] 刷新上下文，选择:', selection);

            var identityChanged = false;
            if (lastContextSelection) {
                if (currentPage === '/detail-analysis') {
                    identityChanged = lastContextSelection.student_id !== selection.student_id;
                }
            }
            lastContextSelection = {};
            lastContextSelection.page = currentPage;
            for (var key in selection) {
                if (selection[key] !== null && selection[key] !== undefined) {
                    lastContextSelection[key] = selection[key];
                }
            }

            var queryParams = new URLSearchParams();
            queryParams.append('page', currentPage);
            for (var key in selection) {
                if (selection[key] !== null && selection[key] !== undefined) {
                    queryParams.append(key, selection[key]);
                }
            }

            var ctxRes = await fetch('/api/ai/context?' + queryParams.toString());
            var ctxData = await ctxRes.json();
            console.log('[AI分析] 刷新上下文返回:', ctxData);

            if (ctxData.success && ctxData.data && ctxData.data.context) {
                var systemMessage = { role: 'system', content: ctxData.data.context };

                if (identityChanged && messages.length > 0) {
                    messages = [systemMessage];
                    var msgArea = document.getElementById('aiChatMessages');
                    if (msgArea) {
                        msgArea.innerHTML = '';
                        var hint = createHint('已切换到新学生，数据已刷新');
                        msgArea.appendChild(hint);
                    }
                } else if (messages.length > 0 && messages[0].role === 'system') {
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
        if (!text || isStreaming) return;
        isUserStopped = false;

        // 教师端：首次提问先刷新上下文（获取考试班级数据），但不自动分析
        if (userRole === 'teacher' && messages.length === 0) {
            await refreshContext();
        }
        // 学生端：首次提问先自动分析
        else if (messages.length === 0) {
            await doInitialAnalysis();
            if (messages.length === 0) return;
        }
        // 非首次提问都刷新上下文
        else {
            await refreshContext();
        }

        messages.push({ role: 'user', content: text });
        input.value = '';
        input.disabled = true;

        addUserMessage(text);
        var botBubble = createBotBubble();

        var isNetworkTimeout = true;
        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, 5000);

        // 设置全局状态
        isStreaming = true;
        currentController = controller;
        currentTimeoutId = timeoutId;
        currentBotBubble = botBubble;
        currentBotText = '';
        updateSendButton(true);

        try {
            var response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: messages,
                    stream: true
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            isNetworkTimeout = false;
            timeoutId = setTimeout(function() { controller.abort(); }, 60000);
            currentTimeoutId = timeoutId;

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
                        var line = lines[i];
                        // 移除可能的 "data: " 前缀
                        if (line.startsWith('data: ')) {
                            line = line.substring(6);
                        }
                        // 跳过 [DONE] 标记
                        if (line === '[DONE]') {
                            continue;
                        }
                        var data = JSON.parse(line);
                        // 兼容 Ollama 和 OpenAI 两种格式
                        if (data.message && data.message.content) {
                            // Ollama 格式
                            botText += data.message.content;
                            botBubble.innerHTML = formatText(botText);
                            currentBotText = botText;
                            scrollToBottom();
                        } else if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                            // OpenAI/Qwen 格式
                            botText += data.choices[0].delta.content;
                            botBubble.innerHTML = formatText(botText);
                            currentBotText = botText;
                            scrollToBottom();
                        }
                    } catch (e) {}
                }
            }

            clearTimeout(timeoutId);

            messages.push({ role: 'assistant', content: botText });

        } catch (error) {
            clearTimeout(currentTimeoutId);
            console.error('[AI聊天] 错误:', error);
            // 如果不是用户主动停止，才显示错误
            if (!isUserStopped && botBubble) {
                if (error.name === 'AbortError') {
                    if (isNetworkTimeout) {
                        botBubble.textContent = '❌ 网络连接失败，请稍后再试';
                    } else {
                        botBubble.textContent = '服务器繁忙，请稍后再试';
                    }
                } else {
                    botBubble.textContent = '❌ 网络连接失败，请稍后再试';
                }
            }
            // 用户主动停止：已在stopStream中保存了内容，不显示错误
        }

        // 重置状态
        isStreaming = false;
        currentController = null;
        currentTimeoutId = null;
        currentBotBubble = null;
        currentBotText = '';
        updateSendButton(false);
        input.disabled = false;
        input.focus();
        isUserStopped = false;
    }

    function openChat() {
        if (!chatOverlay) return;
        chatOverlay.style.display = 'flex';

        var container = document.getElementById('aiChatMessages');
        var isPageChanged = lastChatPage !== currentPage;

        // 只有切换页面或从未打开过时才重置
        if (isPageChanged || lastChatPage === null) {
            if (!isAnalyzing && !isStreaming) {
                // 重置状态
                messages = [];
                hasInitialAnalysis = false;
                // 清空聊天记录
                container.innerHTML = '';
                
                // detail-analysis页面（教师端）：自动分析学生
                if (userRole === 'teacher' && currentPage === '/detail-analysis') {
                    var hasSelection = window.currentClassId && window.currentStudentId;
                    if (!hasSelection) {
                        // 未选择学生，显示提示
                        var hintDiv = document.createElement('div');
                        hintDiv.style.cssText = 'align-self:center;background:#fef3c7;color:#92400e;font-size:14px;padding:10px 16px;border-radius:12px;max-width:80%;text-align:center;';
                        hintDiv.textContent = '请先在页面上选择班级和学生，我才能为您提供分析服务。';
                        container.appendChild(hintDiv);
                        lastChatPage = currentPage;
                        return;
                    } else {
                        // 已选择学生，自动分析
                        doInitialAnalysis();
                        lastChatPage = currentPage;
                        return;
                    }
                }
                
                // 教师端（非detail-analysis）：直接显示欢迎文本
                if (userRole === 'teacher') {
                    var userName = window.currentUser && window.currentUser.name ? window.currentUser.name : '';
                    var welcomeText = userName ? userName + '您好，有什么可以帮到你的吗？' : '您好，有什么可以帮到你的吗？';
                    
                    // 显示欢迎消息
                    var welcomeMsg = document.createElement('div');
                    welcomeMsg.style.cssText = 'align-self:flex-start;background:#fff;color:#374151;border:1px solid #e5e7eb;max-width:85%;padding:14px 18px;border-radius:16px;font-size:14px;line-height:1.7;word-break:break-word;box-shadow:0 2px 4px rgba(0,0,0,0.05);';
                    welcomeMsg.textContent = welcomeText;
                    container.appendChild(welcomeMsg);
                    
                    // 设置提示
                    var hint = createHint('您可以选择考试和班级后提问');
                    container.appendChild(hint);
                    
                    lastChatPage = currentPage; // 更新页面记录
                    return;
                }
                
                // 学生端：在这些页面不自动生成分析：events, total-table, attendance, homework-data
                var noAutoAnalysisPages = ['/events', '/total-table', '/attendance', '/homework-data'];
                if (noAutoAnalysisPages.includes(currentPage)) {
                    // 不自动生成分析，显示提示
                    var hint = createHint('有什么我可以帮助您的吗？');
                    container.appendChild(hint);
                    lastChatPage = currentPage;
                    return;
                }
                
                // 在 detail-analysis 页面检查学生端是否已选择
                if (currentPage === '/detail-analysis' && userRole === 'student') {
                    var hasSelection = window.currentStudentId;
                    if (!hasSelection) {
                        var hintDiv = document.createElement('div');
                        hintDiv.style.cssText = 'align-self:center;background:#fef3c7;color:#92400e;font-size:14px;padding:10px 16px;border-radius:12px;max-width:80%;text-align:center;';
                        hintDiv.textContent = '正在加载您的数据，请稍候...';
                        container.appendChild(hintDiv);
                        lastChatPage = currentPage;
                        return;
                    }
                }
                
                // 学生端自动分析
                if (userRole === 'student') {
                    doInitialAnalysis();
                }
                
                lastChatPage = currentPage; // 更新页面记录
            }
        } else {
            // 同页面内打开，不重置对话，只滚动到底部
            scrollToBottom();
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
                    console.log('[AI助手] 已初始化，角色:', userRole, '当前页:', currentPage);
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
