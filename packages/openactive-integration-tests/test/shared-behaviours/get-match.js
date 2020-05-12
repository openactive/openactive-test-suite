const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class GetMatch {
  constructor ({state, flow, logger, dataItem}) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
    this.dataItem = dataItem;
  }

  get testEvent () {
    return this.dataItem.event;
  }

  get eventType () {
    return this.dataItem.randomEvent || this.dataItem.event["@type"]
  }

  get eventName () {
    return this.dataItem.name;
  }

  get price () {
    return this.dataItem.price;
  }

  validationTests () {
    sharedValidationTests.shouldBeValidResponse(
      () => this.state.apiResponse,
      "Opportunity Feed",
      this.logger,
      {
        validationMode: "BookableRPDEFeed",
      },
    );
    return this;
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
