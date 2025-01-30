const { Mutex } = require('await-semaphore');

class PauseResume {
  constructor() {
    this.pauseHarvesting = false;
    /**
     * Lock that is held while harvesting is paused. It is released when
     * harvesting is resumed. This is used to enable `waitIfPaused()`
     */
    this.pauseHarvestingMutex = new Mutex();
    /**
     * @type {() => void | null} Function that releases `this.pauseHarvestingMutex`
     */
    this.releasePauseHarvestingMutex = null;
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
      if (this.releasePauseHarvestingMutex) this.releasePauseHarvestingMutex();
      this.releasePauseHarvestingMutex = await this.pauseHarvestingMutex.acquire();
    }
  }

  get pauseHarvestingStatus() {
    return this.pauseHarvesting ? 'paused' : 'harvesting';
  }

  resume() {
    const wasPaused = this.pauseHarvesting;
    this.pauseHarvesting = false;
    if (this.releasePauseHarvestingMutex) this.releasePauseHarvestingMutex();
    this.releasePauseHarvestingMutex = null;
    return wasPaused;
  }

  async waitIfPaused() {
    if (this.pauseHarvesting) {
      await this.pauseHarvestingMutex.use(async () => null);
    }
  }
}

module.exports = PauseResume;
