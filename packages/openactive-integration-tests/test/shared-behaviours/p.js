const chakram = require('chakram');
const sharedValidationTests = require('./validation');

/**
 * @typedef {import('../helpers/request-state').RequestStateType} RequestStateType
 * @typedef {import('../helpers/flow-helper').FlowHelperType} FlowHelperType
 * @typedef {import('../helpers/logger').BaseLoggerType} BaseLoggerType
 */

class P {
  /**
   * @param {object} args
   * @param {RequestStateType} args.state
   * @param {FlowHelperType} args.flow
   * @param {BaseLoggerType} args.logger
   */
  constructor({ state, flow, logger }) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
  }

  /**
   * Note: This create a beforeAll() block
   */
  beforeSetup() {
    beforeAll(async () => {
      await this.flow.P();
    });

    return this;
  }

  /**
   * Note: This create it() blocks
   */
  validationTests() {
    sharedValidationTests.shouldBeValidResponse(
      () => this.state.pResponse,
      'P',
      this.logger,
      {
        validationMode: 'PResponse',
      },
    );
    return this;
  }

  /**
   * Note: This creates an it() blocks
   */
  successChecks() {
    it('should return 200 on success', () => {
      chakram.expect(this.state.pResponse).to.have.status(200);
    });
    return this;
  }
}

module.exports = {
  P,
};
