const RequestHelper = require("./request-helper");
const pMemoize = require("p-memoize");

class DefaultFlowHelper {
  constructor (helper) {
    this.helper = helper;
  }

  log (msg) {
    this.helper.logger.log(msg);
  }
}

class FlowHelper extends DefaultFlowHelper {
  getMatch = pMemoize(async getMatch => {
    return this.helper.getMatch();
  });

  C1 = pMemoize(async C1 => {
    await this.getMatch();

    return this.helper.putOrderQuoteTemplate();
  });

  C2 = pMemoize(async C2 => {
    await this.C1();

    return this.helper.putOrderQuote();
  });

  B = pMemoize(async B => {
    this.getOrderPromise = this.helper.getOrder();

    await this.C2();

    return this.helper.putOrder();
  });

  U = pMemoize(async U => {
    await this.B();

    return this.helper.cancelOrder();
  });

  getFeedUpdate = pMemoize(async getFeedUpdate => {
    await this.U();

    return await this.getOrderPromise;
  });
}

module.exports = {
  DefaultFlowHelper,
  FlowHelper
};
