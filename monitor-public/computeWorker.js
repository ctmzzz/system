let dataPoints = { cpu: [], memory: [], labels: [] };
const MAX_POINTS = 60;
const WINDOW_SIZE = 3;

self.onmessage = function(e) {
    const { type, data } = e.data;

    switch (type) {
        case 'add_point':
            dataPoints.cpu.push(data.cpu || 0);
            dataPoints.memory.push(data.memory || 0);
            dataPoints.labels.push(data.label || '');

            if (dataPoints.cpu.length > MAX_POINTS) {
                dataPoints.cpu.shift();
                dataPoints.memory.shift();
                dataPoints.labels.shift();
            }

            self.postMessage({
                type: 'chart_data',
                data: {
                    cpu: smoothArray(dataPoints.cpu, WINDOW_SIZE),
                    memory: smoothArray(dataPoints.memory, WINDOW_SIZE),
                    labels: dataPoints.labels
                }
            });
            break;

        case 'reset':
            dataPoints = { cpu: [], memory: [], labels: [] };
            self.postMessage({
                type: 'chart_data',
                data: { cpu: [], memory: [], labels: [] }
            });
            break;
    }
};

function smoothArray(arr, windowSize) {
    if (arr.length <= windowSize) return arr.slice();
    const result = [];
    const half = Math.floor(windowSize / 2);
    for (let i = 0; i < arr.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - half); j <= Math.min(arr.length - 1, i + half); j++) {
            sum += arr[j];
            count++;
        }
        result.push(Math.round(sum / count * 10) / 10);
    }
    return result;
}