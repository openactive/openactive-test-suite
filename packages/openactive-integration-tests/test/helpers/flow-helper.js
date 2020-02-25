const pMemoize = require("p-memoize");

class FlowHelper {
  constructor (helper) {
    this.state = helper;
  }

  getMatch = pMemoize(async getMatch => {
    return this.state.getMatch();
  });

  C1 = pMemoize(async C1 => {
    await this.getMatch();

    return this.state.putOrderQuoteTemplate();
  });

  C2 = pMemoize(async C2 => {
    await this.C1();

    return this.state.putOrderQuote();
  });

  B = pMemoize(async B => {
    this.getOrderPromise = this.state.getOrder();

    await this.C2();

    return this.state.putOrder();
  });

  U = pMemoize(async U => {
    await this.B();

    return this.state.cancelOrder();
  });

  getFeedUpdate = pMemoize(async getFeedUpdate => {
    await this.U();

    return await this.getOrderPromise;
  });
}

module.exports = {
  FlowHelper
};
