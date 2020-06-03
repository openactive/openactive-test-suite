const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class GetMatch {
  constructor ({state, flow, logger, configuration, orderItemCriteria}) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
    this.configuration = configuration;
    this.orderItemCriteria = orderItemCriteria;
  }

  get testEvent () {
    return this.configuration.event;
  }

  get eventType () {
    return this.configuration.randomEvent || this.configuration.event["@type"]
  }

  get eventName () {
    return this.configuration.name;
  }

  get price () {
    return this.configuration.price;
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
