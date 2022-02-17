const { workerData, parentPort } = require('worker_threads');

const result = Math.floor(Math.random() * workerData);
parentPort.postMessage(result);
