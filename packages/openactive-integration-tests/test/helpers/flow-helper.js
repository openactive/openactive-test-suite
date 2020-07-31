const pMemoize = require("p-memoize");

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
  constructor (helper) {
    this.state = helper;
  }

  getDatasetSite = pMemoize(async () => {
    return this.state.getDatasetSite();
  });

  getMatch = pMemoize(async () => {
    return this.state.getMatch();
  });

  C1 = pMemoize(async () => {
    await this.getMatch();
    if (!this.state.getMatchResponseSucceeded) throw Error('Pre-requisite step failed: opportunity feed extract failed');

    return this.state.putOrderQuoteTemplate();
  });

  C2 = pMemoize(async () => {
    await this.C1();
    if (!this.state.C1ResponseReceived) throw Error('Pre-requisite step failed: C1 failed');

    return this.state.putOrderQuote();
  });

  B = pMemoize(async () => {
    await this.C2();
    if (!this.state.C2ResponseReceived) throw Error('Pre-requisite step failed: C2 failed');

    return this.state.putOrder();
  });

  U = pMemoize(async () => {
    this.getOrderPromise = this.state.getOrder();

    await this.B();
    if (!this.state.BResponseReceived) throw Error('Pre-requisite step failed: B failed');

    return this.state.cancelOrder();
  });

  getFeedUpdate = pMemoize(async () => {
    await this.U();
    if (!this.state.UResponseSucceeded) throw Error('Pre-requisite step failed: U failed');

    return await this.getOrderPromise;
  });
}

module.exports = {
  FlowHelper
};
