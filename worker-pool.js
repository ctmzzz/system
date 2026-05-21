const runTask = require('./workers/task-worker');

let queue = Promise.resolve();
let queueSize = 0;
let completed = 0;
let failed = 0;
let running = false;
let lastDuration = 0;

function run(task) {
    queueSize++;
    const startedAt = Date.now();

    const job = queue.then(async () => {
        queueSize--;
        running = true;
        try {
            const result = await runTask(task);
            completed++;
            return result;
        } catch (err) {
            failed++;
            throw err;
        } finally {
            lastDuration = Date.now() - startedAt;
            running = false;
        }
    });

    queue = job.catch(() => {});
    return job;
}

module.exports = {
    run,
    get threads() {
        return running ? 1 : 0;
    },
    get queueSize() {
        return queueSize;
    },
    get completed() {
        return completed;
    },
    get failed() {
        return failed;
    },
    get duration() {
        return lastDuration;
    },
    get utilization() {
        return running ? 1 : 0;
    }
};
