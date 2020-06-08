const pMemoize = require("p-memoize");

class FlowHelper {
  constructor (helper) {
    this.state = helper;
  }

  getDatasetSite = pMemoize(async getDatasetSite => {
    return this.state.getDatasetSite();
  });

  getMatch = pMemoize(async getMatch => {
    return this.state.getMatch();
  });

  C1 = pMemoize(async C1 => {
    await this.getMatch();
    if (!this.state.getMatchResponseSucceeded) throw Error('Pre-requisite step failed: opportunity feed extract failed');

    return this.state.putOrderQuoteTemplate();
  });

  C2 = pMemoize(async C2 => {
    await this.C1();
    if (!this.state.C1ResponseReceived) throw Error('Pre-requisite step failed: C1 failed');

    return this.state.putOrderQuote();
  });

  B = pMemoize(async B => {
    await this.C2();
    if (!this.state.C2ResponseReceived) throw Error('Pre-requisite step failed: C2 failed');

    return this.state.putOrder();
  });

  U = pMemoize(async U => {
    this.getOrderPromise = this.state.getOrder();

    await this.B();
    if (!this.state.BResponseReceived) throw Error('Pre-requisite step failed: B failed');

    return this.state.cancelOrder();
  });

  getFeedUpdate = pMemoize(async getFeedUpdate => {
    await this.U();
    if (!this.state.UResponseSucceeded) throw Error('Pre-requisite step failed: U failed');

    return await this.getOrderPromise;
  });
}

module.exports = {
  FlowHelper
};
