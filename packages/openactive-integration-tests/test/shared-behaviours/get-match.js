const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class GetMatch {
  constructor ({state, flow, logger, configuration, orderItemCriteria}) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
    this.orderItemCriteria = orderItemCriteria;
  }

  validationTests () {
    this.orderItemCriteria.forEach((x, i) => {
      sharedValidationTests.shouldBeValidResponse(
        () => this.state.opportunityFeedExtractResponses[i],
        "Opportunity Feed extract for OrderItem " + i,
        this.logger,
        {
          validationMode: "BookableRPDEFeed",
        },
      );
      return this;
    });
  }

  beforeSetup () {
    beforeAll(async () => {
      await this.flow.getMatch();
    });
    return this;
  }

  successChecks () {
    return this;
  }
}

module.exports = {
  GetMatch
};
