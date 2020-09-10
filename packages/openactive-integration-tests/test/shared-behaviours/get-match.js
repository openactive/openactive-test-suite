const { expect } = require('chakram');
const sharedValidationTests = require('./validation');

class GetMatch {
  constructor({ state, flow, logger, orderItemCriteria }) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
    this.orderItemCriteria = orderItemCriteria;
  }

  validationTests() {
    this.orderItemCriteria.forEach((x, i) => {
      sharedValidationTests.shouldBeValidResponse(
        () => this.state.opportunityFeedExtractResponses[i],
        `Opportunity Feed extract for OrderItem ${i}`,
        this.logger,
        {
          validationMode: 'BookableRPDEFeed',
        },
        x.opportunityCriteria,
      );
      return this;
    });
  }

  /**
   * Note: Generates a beforeAll() block. Therefore, this must be run within a describe() block.
   */
  beforeSetup() {
    beforeAll(async () => {
      await this.flow.getMatch();
    });
    return this;
  }

  successChecks() {
    this.orderItemCriteria.forEach((x, i) => {
      it(`should return 200 on success for request relevant to OrderItem ${i}`, () => {
        if (!this.state.opportunityFeedExtractResponses[i]) throw Error('Pre-requisite step failed: test interface request failed');

        expect(this.state.opportunityFeedExtractResponses[i]).to.have.status(200);
      });
    });

    return this;
  }
}

module.exports = {
  GetMatch,
};
