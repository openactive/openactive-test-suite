const _ = require('lodash');
const path = require('path');
const os = require('os');
const { Worker } = require('worker_threads');

const workerFileName = path.join(__dirname, 'workerThreadsWorker.js');
const numCpus = os.cpus().length;

const results = [];

/**
 * @param {number} amount
 * @param {number} max
 */
async function computeNumbers(amount, max) {
  let remainingAmount = amount;
  while (remainingAmount > 0) {
    const numWorkers = Math.min(numCpus, remainingAmount);
    await computeNumbersOneRound(numWorkers, max);

    remainingAmount -= numWorkers;
  }
  // }
  // // TODO TODO TODO use amount
  // await Promise.all(_.times(4, () => {
  //   const worker = new Worker(workerFileName, {
  //     workerData: max,
  //   });
  //   return new Promise((resolve, reject) => {
  //     worker.on('message', (num) => {
  //       console.info('a message');
  //       results.push(num);
  //       resolve();
  //     });
  //     worker.on('error', reject);
  //     worker.on('exit', (code) => {
  //       if (code !== 0) {
  //         reject(new Error(`Worker stopped with exit code ${code}`));
  //       }
  //     });
  //   });
  // }));
}

/**
 * @param {number} numWorkers
 * @param {number} max
 */
async function computeNumbersOneRound(numWorkers, max) {
  await Promise.all(_.times(numWorkers, () => {
    const worker = new Worker(workerFileName, {
      workerData: max,
    });
    return new Promise((resolve, reject) => {
      worker.on('message', (num) => {
        console.info('a message');
        results.push(num);
        resolve();
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }));
}

module.exports = {
  computeNumbers,
  getResults: () => results,
};
