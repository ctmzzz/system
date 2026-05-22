const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');

const MAX_WORKERS = os.cpus().length;
const MIN_WORKERS = 1;
const HIGH_THRESHOLD = 80; // CPU 超过80%增加 worker
const LOW_THRESHOLD = 30; // CPU 低于30%减少 worker
const ADJUST_INTERVAL = 5000; // 每5秒检查一次

const workerPath = path.join(__dirname, 'workers', 'task-worker.js');

let workers = [];
let availableWorkers = [];
let taskQueue = [];
let completed = 0;
let failed = 0;
let lastCpuLoad = 0;

// 初始化：启动1个 worker
function init() {
    for (let i = 0; i < MIN_WORKERS; i++) {
        createWorker();
    }
    // 启动自动调整线程
    setInterval(adjustWorkers, ADJUST_INTERVAL);
}

// 创建一个新 worker
function createWorker() {
    const worker = new Worker(workerPath);
    const workerInfo = {
        worker,
        id: workers.length,
        busy: false
    };
    workers.push(workerInfo);
    availableWorkers.push(workerInfo);

    worker.on('message', (result) => {
        // 任务完成
        const callback = workerInfo._callback;
        workerInfo._callback = null;
        workerInfo.busy = false;
        availableWorkers.push(workerInfo);
        completed++;
        if (callback) callback(null, result);
        processNextTask();
    });

    worker.on('error', (err) => {
        const callback = workerInfo._callback;
        workerInfo._callback = null;
        workerInfo.busy = false;
        availableWorkers.push(workerInfo);
        failed++;
        console.error('[Worker] 错误:', err);
        if (callback) callback(err);
        processNextTask();
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`[Worker] 异常退出 (code: ${code})，重新启动...`);
            // 移除并重新创建
            const index = workers.indexOf(workerInfo);
            if (index !== -1) workers.splice(index, 1);
            const availIndex = availableWorkers.indexOf(workerInfo);
            if (availIndex !== -1) availableWorkers.splice(availIndex, 1);
            createWorker();
        }
    });
}

// 销毁一个 worker
function destroyWorker() {
    if (availableWorkers.length > 0) {
        const workerInfo = availableWorkers.pop();
        const index = workers.indexOf(workerInfo);
        if (index !== -1) workers.splice(index, 1);
        workerInfo.worker.terminate();
    }
}

// 根据 CPU 调整 worker 数量
async function adjustWorkers() {
    try {
        const si = require('systeminformation');
        const cpuLoad = await si.currentLoad();
        lastCpuLoad = cpuLoad.currentLoad;

        if (cpuLoad.currentLoad > HIGH_THRESHOLD && workers.length < MAX_WORKERS) {
            console.log(`[Worker Pool] CPU ${cpuLoad.currentLoad.toFixed(1)}% > ${HIGH_THRESHOLD}%，增加 worker (${workers.length}→${workers.length + 1})`);
            createWorker();
        } else if (cpuLoad.currentLoad < LOW_THRESHOLD && workers.length > MIN_WORKERS) {
            console.log(`[Worker Pool] CPU ${cpuLoad.currentLoad.toFixed(1)}% < ${LOW_THRESHOLD}%，减少 worker (${workers.length}→${workers.length - 1})`);
            destroyWorker();
        }
    } catch (err) {
        // 忽略
    }
}

// 处理下一个任务
function processNextTask() {
    if (taskQueue.length === 0 || availableWorkers.length === 0) return;

    const task = taskQueue.shift();
    const workerInfo = availableWorkers.pop();
    workerInfo.busy = true;
    workerInfo._callback = task.callback;
    workerInfo.worker.postMessage(task.data);
}

// 运行任务
function run(data) {
    return new Promise((resolve, reject) => {
        const task = {
            data,
            callback: (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        };
        taskQueue.push(task);
        processNextTask();
    });
}

init();

module.exports = {
    run,
    get threads() {
        return workers.length;
    },
    get queueSize() {
        return taskQueue.length;
    },
    get completed() {
        return completed;
    },
    get failed() {
        return failed;
    },
    get utilization() {
        return workers.length > 0 ? (workers.filter(w => w.busy).length / workers.length) : 0;
    }
};
