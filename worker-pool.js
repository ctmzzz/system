const Piscina = require('piscina');
const path = require('path');

const pool = new Piscina({
    filename: path.resolve(__dirname, 'workers/task-worker.js'),
    minThreads: 1,
    maxThreads: 32,
    idleTimeout: 10000,
    maxQueue: 'auto',
    concurrentTasksPerWorker: 1
});

pool.on('drain', () => {
    console.log('[WorkerPool] 所有任务完成，线程池空闲');
});

module.exports = pool;