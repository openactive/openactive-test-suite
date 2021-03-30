const { spawn, Pool, Worker } = require('threads');

class AsyncValidatorWorker {
  constructor(validatorIdentifier, blockUntilQueueEmpty) {
    this.pool = Pool(() => spawn(new Worker('./validator-worker')), {
      name: validatorIdentifier,
    });
    this.queueLength = 0;
    this.blockUntilQueueEmpty = blockUntilQueueEmpty;
  }

  async terminate(force) {
    // Finish the tasks remaining if there's less than 50 items left, or if the configured to block
    if (!force && (this.blockUntilQueueEmpty || this.queueLength < 50)) {
      await this.pool.terminate();
    } else {
      await this.pool.terminate(true);
    }
  }

  async validateItem(body) {
    try {
      this.queueLength += 1;
      const result = await this.pool.queue((validator) => validator.validateItem(body));
      this.queueLength -= 1;
      return result;
    } catch (error) {
      return null;
    }
  }
}

module.exports = AsyncValidatorWorker;
