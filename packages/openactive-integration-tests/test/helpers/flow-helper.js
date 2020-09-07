const pMemoize = require("p-memoize");

/**
 * @typedef {'getDatasetSite' | 'getMatch' | 'C1' | 'C2' | 'B' | 'U' | 'getFeedUpdate'} StageIdentifier
 */

/**
 * Convenient helper for calling Booking API flow functions like C1, C2, B, etc
 * and caching the results.
 *
 * For each of these functions, the output is cached the first time it is run
 * and this cached value is used for subsequent calls.
 *
 * Additionally, flow functions call any dependent functions (e.g. B calls C2,
 * which calls C1, etc).
 */
class FlowHelper {
  /**
   * @param {InstanceType<import('./request-state')['RequestState']>} helper
   * @param {object} [options]
   * @param {Set<StageIdentifier>} [options.stagesToSkip] Any stages included
   *   in this set will be skipped. e.g. with stagesToSkip = new Set(['c2']),
   *   the C2 stage will be skipped.
   *
   *   This can be used to test unconventional flows
   */
  constructor (helper, { stagesToSkip = new Set() } = {}) {
    this.state = helper;
    this._stagesToSkip = stagesToSkip
  }

  /**
   * @param {StageIdentifier} stageIdentifier
   * @throws If the stage should be skipped.
   */
  _assertStageShouldNotBeSkipped(stageIdentifier) {
    if (this._stagesToSkip.has(stageIdentifier)) {
      throw new Error(`Unexpectedly calling skipped stage: \`${stageIdentifier}\``);
    }
  }

  getDatasetSite = pMemoize(async () => {
    this._assertStageShouldNotBeSkipped('getDatasetSite');
    return this.state.getDatasetSite();
  }, { cachePromiseRejection: true });

  getMatch = pMemoize(async () => {
    this._assertStageShouldNotBeSkipped('getMatch');
    return this.state.getMatch();
  }, { cachePromiseRejection: true });

  C1 = pMemoize(async () => {
    this._assertStageShouldNotBeSkipped('C1');
    if (!this._stagesToSkip.has('getMatch')) {
      await this.getMatch();
      if (!this.state.getMatchResponseSucceeded) throw Error('Pre-requisite step failed: opportunity feed extract failed');
    }

    return this.state.putOrderQuoteTemplate();
  }, { cachePromiseRejection: true });

  C2 = pMemoize(async () => {
    this._assertStageShouldNotBeSkipped('C2');
    if (!this._stagesToSkip.has('C1')) {
      await this.C1();
      if (!this.state.C1ResponseReceived) throw Error('Pre-requisite step failed: C1 failed');
    }

    return this.state.putOrderQuote();
  }, { cachePromiseRejection: true });

  B = pMemoize(async () => {
    this._assertStageShouldNotBeSkipped('B');
    if (!this._stagesToSkip.has('C2')) {
      await this.C2();
      if (!this.state.C2ResponseReceived) throw Error('Pre-requisite step failed: C2 failed');
    }

    return this.state.putOrder();
  }, { cachePromiseRejection: true });

  U = pMemoize(async () => {
    this._assertStageShouldNotBeSkipped('U');
    this.getOrderPromise = this.state.getOrder();

    if (!this._stagesToSkip.has('B')) {
      await this.B();
      if (!this.state.BResponseReceived) throw Error('Pre-requisite step failed: B failed');
    }

    return this.state.cancelOrder();
  }, { cachePromiseRejection: true });

  getFeedUpdate = pMemoize(async () => {
    this._assertStageShouldNotBeSkipped('getFeedUpdate');
    if (!this._stagesToSkip.has('U')) {
      await this.U();
      if (!this.state.UResponseSucceeded) throw Error('Pre-requisite step failed: U failed');
    }

    return await this.getOrderPromise;
  }, { cachePromiseRejection: true });
}

/**
 * @typedef {InstanceType<typeof FlowHelper>} FlowHelperType
 */

module.exports = {
  FlowHelper
};
