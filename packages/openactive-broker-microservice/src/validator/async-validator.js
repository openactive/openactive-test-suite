const { spawn, Pool, Worker } = require('threads');
const sleep = require('util').promisify(setTimeout);

class AsyncValidatorWorker {
  constructor(validatorIdentifier, blockUntilQueueEmpty, startTime, validatorTimeout) {
    this.pool = Pool(() => spawn(new Worker('./validator-worker')), {
      name: validatorIdentifier,
      concurrency: 1,
      maxQueuedJobs: 1,
    });
    this.queueLength = 0;
    this.blockUntilQueueEmpty = blockUntilQueueEmpty;
    this.startTime = startTime;
    this.validatorTimeout = validatorTimeout;
  }

  async terminate() {
    const remainingValidationTimeoutMs = (new Date()).getTime() - this.startTime.getTime() - this.validatorTimeout;
    // Finish the tasks remaining if there's less than 50 items left, or if the configured to block
    // Always respect the validator timeout to protect the process from overruns
    if (remainingValidationTimeoutMs > 0 && (this.blockUntilQueueEmpty || this.queueLength < 50)) {
      await Promise.race([
        this.pool.terminate(),
        sleep(remainingValidationTimeoutMs),
      ]);
      await this.pool.terminate(true);
    } else {
      await this.pool.terminate(true);
    }
  }

  async validateItem(body, validationMode) {
    try {
      this.queueLength += 1;
      const result = await this.pool.queue((validator) => validator.validateItem(body, validationMode));
      this.queueLength -= 1;
      return result;
    } catch (error) {
      return [{
        message: error.message,
        path: 'Validation Library Error',
      }];
    }
  }
}

module.exports = AsyncValidatorWorker;
