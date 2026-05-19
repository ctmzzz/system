let logBuffer = [];
let flushTimer = null;
const FLUSH_INTERVAL = 16;

function classifyLog(log) {
    let type = 'info';
    const msg = log.message || '';
    if (/error|错误|fail|失败|exception/i.test(msg)) {
        type = 'error';
    } else if (/warn|警告/i.test(msg)) {
        type = 'warning';
    } else if (/success|成功|ok|完成/i.test(msg)) {
        type = 'success';
    }
    return { ...log, type };
}

function flushBuffer() {
    if (logBuffer.length === 0) return;
    const batch = logBuffer.splice(0);
    self.postMessage({ type: 'log_batch', data: batch });
}

self.onmessage = function(e) {
    const { type, data } = e.data;

    switch (type) {
        case 'new_log':
            const classified = classifyLog(data);
            logBuffer.push(classified);
            if (!flushTimer) {
                flushTimer = setTimeout(() => {
                    flushBuffer();
                    flushTimer = null;
                }, FLUSH_INTERVAL);
            }
            break;

        case 'logs_history':
            const processed = data.map(classifyLog);
            self.postMessage({ type: 'logs_history', data: processed });
            break;

        case 'filter_logs':
            const { logs, filter } = data;
            const filtered = filter === 'all'
                ? logs
                : logs.filter(l => l.type === filter);
            self.postMessage({ type: 'filtered_logs', data: filtered });
            break;

        case 'flush':
            if (flushTimer) {
                clearTimeout(flushTimer);
                flushTimer = null;
            }
            flushBuffer();
            break;
    }
};