const { Worker, isMainThread, parentPort } = require('worker_threads');
const path = require('path');

if (isMainThread) {
    console.log('测试 worker 启动...');
    const worker = new Worker(path.join(__dirname, 'workers', 'task-worker.js'));
    
    worker.on('message', (msg) => {
        console.log('Worker 消息:', msg);
    });
    
    worker.on('error', (err) => {
        console.error('Worker 错误:', err);
    });
    
    worker.on('exit', (code) => {
        console.log('Worker 退出 code:', code);
    });
    
    // 发送一个简单的任务
    setTimeout(() => {
        worker.postMessage({ type: 'analyze_percentile', data: {} });
    }, 1000);
}
