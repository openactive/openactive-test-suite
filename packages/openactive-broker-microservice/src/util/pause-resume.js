const { Mutex } = require('await-semaphore');

class PauseResume {
  constructor() {
    this.pauseHarvesting = false;
    this.pauseHarvestingMutex = new Mutex();
    this.releasePauseSemaphore = null;
    process.on('message', async (msg) => {
      if (msg === 'pause') {
        await this.pause();
      } else if (msg === 'resume') {
        await this.resume();
      }
    });
  }

  async pause() {
    if (!this.pauseHarvesting) {
      this.pauseHarvesting = true;
      if (this.releasePauseSemaphore) this.releasePauseSemaphore();
      this.releasePauseSemaphore = await this.pauseHarvestingMutex.acquire();
    }
  }

  get pauseHarvestingStatus() {
    return this.pauseHarvesting ? 'paused' : 'harvesting';
  }

  resume() {
    const wasPaused = this.pauseHarvesting;
    this.pauseHarvesting = false;
    if (this.releasePauseSemaphore) this.releasePauseSemaphore();
    this.releasePauseSemaphore = null;
    return wasPaused;
  }

  async waitIfPaused() {
    if (this.pauseHarvesting) {
      await this.pauseHarvestingMutex.use(async () => null);
    }
  }
}

module.exports = PauseResume;
