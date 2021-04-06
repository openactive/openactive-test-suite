const { Mutex } = require('await-semaphore');

class PauseResume {
  constructor() {
    this.pauseHarvesting = false;
    this.pauseHarvestingMutex = new Mutex();
    this.releasePauseSemaphore = null;
  }

  async pause() {
    this.pauseHarvesting = true;
    if (this.releasePauseSemaphore) this.releasePauseSemaphore();
    this.releasePauseSemaphore = await this.pauseHarvestingMutex.acquire();
  }

  resume() {
    this.pauseHarvesting = false;
    if (this.releasePauseSemaphore) this.releasePauseSemaphore();
    this.releasePauseSemaphore = null;
  }

  async waitIfPaused() {
    if (this.pauseHarvesting) {
      await this.pauseHarvestingMutex.use(async () => null);
    }
  }
}

module.exports = PauseResume;
