(function () {
    var messages = [];
    var PROXY_URL = '/api/ollama/chat';
    var MODEL_NAME = 'qwen2.5:1.5b';

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
        var overlay = document.createElement('div');
        overlay.id = 'aiChatOverlay';
        overlay.style.cssText = 'position:fixed;bottom:100px;right:30px;width:380px;height:520px;background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.2);display:none;flex-direction:column;z-index:100000;overflow:hidden;';

        var header = document.createElement('div');
        header.style.cssText = 'background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;';

        var title = document.createElement('span');
        title.style.cssText = 'font-size:15px;font-weight:600;';
        title.textContent = '分析师';

        var closeBtn = document.createElement('button');
        closeBtn.id = 'aiChatClose';
        closeBtn.style.cssText = 'background:none;border:none;color:#fff;font-size:20px;cursor:pointer;padding:0;line-height:1;';
        closeBtn.textContent = '×';
        closeBtn.onclick = closeChat;

        header.appendChild(title);
        header.appendChild(closeBtn);

        var msgArea = document.createElement('div');
        msgArea.id = 'aiChatMessages';
        msgArea.style.cssText = 'flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#f9fafb;';

        var sysMsg = document.createElement('div');
        sysMsg.style.cssText = 'align-self:center;background:#f3f4f6;color:#9ca3af;font-size:12px;padding:6px 12px;border-radius:10px;';
        sysMsg.textContent = '对话仅在当前会话保留，不会持久存储';
        msgArea.appendChild(sysMsg);

        var inputArea = document.createElement('div');
        inputArea.style.cssText = 'padding:12px 16px;border-top:1px solid #e5e7eb;display:flex;gap:10px;background:#fff;';

        var input = document.createElement('input');
        input.id = 'aiChatInput';
        input.type = 'text';
        input.placeholder = '输入消息...';
        input.maxLength = 500;
        input.style.cssText = 'flex:1;border:1px solid #e5e7eb;border-radius:20px;padding:10px 16px;font-size:13px;outline:none;';
        input.onkeydown = function(e) {
            if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
        };

        var sendBtn = document.createElement('button');
        sendBtn.id = 'aiChatSend';
        sendBtn.title = '发送';
        sendBtn.style.cssText = 'width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;';
        sendBtn.textContent = '➤';
        sendBtn.onclick = sendMessage;

        inputArea.appendChild(input);
        inputArea.appendChild(sendBtn);

        overlay.appendChild(header);
        overlay.appendChild(msgArea);
        overlay.appendChild(inputArea);
        document.body.appendChild(overlay);
    }

    function addUserMessage(text) {
        var container = document.getElementById('aiChatMessages');
        var el = document.createElement('div');
        el.style.cssText = 'align-self:flex-end;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;max-width:80%;padding:10px 14px;border-radius:14px 14px 4px 14px;font-size:13px;line-height:1.5;word-break:break-word;';
        el.textContent = text;
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
    }

    function createBotMessageBubble() {
        var container = document.getElementById('aiChatMessages');
        var el = document.createElement('div');
        el.id = 'aiBotMsg';
        el.style.cssText = 'align-self:flex-start;background:#fff;color:#374151;border:1px solid #e5e7eb;border-bottom-left-radius:4px;max-width:80%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word;';
        el.textContent = '正在思考...';
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
        return el;
    }

    async function sendMessage() {
        var input = document.getElementById('aiChatInput');
        var text = input.value.trim();
        if (!text) return;

        messages.push({ role: 'user', content: text });
        input.value = '';
        input.disabled = true;

        addUserMessage(text);
        var botBubble = createBotMessageBubble();

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
                var { done, value } = await reader.read();
                if (done) break;

                var chunk = decoder.decode(value, { stream: true });
                var lines = chunk.split('\n').filter(function(line) { return line.trim(); });

                for (var i = 0; i < lines.length; i++) {
                    try {
                        var data = JSON.parse(lines[i]);
                        if (data.message && data.message.content) {
                            botText += data.message.content;
                            botBubble.textContent = botText;
                            var container = document.getElementById('aiChatMessages');
                            if (container) container.scrollTop = container.scrollHeight;
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }

            messages.push({ role: 'assistant', content: botText });

        } catch (error) {
            botBubble.textContent = '❌ 连接失败，请检查: \n1. Ollama 是否在 192.168.3.6:11434 运行\n2. 是否已拉取 qwen2.5:1.5b 模型\n3. 浏览器控制台的 CORS 错误';
            console.error(error);
        }

        input.disabled = false;
        input.focus();
    }

    function openChat() {
        var overlay = document.getElementById('aiChatOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    function closeChat() {
        var overlay = document.getElementById('aiChatOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    function toggleChat() {
        var overlay = document.getElementById('aiChatOverlay');
        if (overlay) {
            if (overlay.style.display === 'flex') {
                closeChat();
            } else {
                openChat();
            }
        }
    }

    async function init() {
        try {
            // 获取当前用户信息
            var response = await fetch('/api/current-user');
            var result = await response.json();
            
            if (result.success && result.data) {
                var role = result.data.role;
                // 只有教师和学生账号显示浮窗
                if (role === 'teacher' || role === 'student') {
                    createFloatBtn();
                    createChatBox();
                }
            }
        } catch (e) {
            console.error('获取用户信息失败:', e);
            // 未登录或获取失败时，不显示浮窗
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
