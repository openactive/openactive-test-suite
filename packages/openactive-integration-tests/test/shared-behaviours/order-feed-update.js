const chakram = require('chakram');
const sharedValidationTests = require('./validation');

/**
 * @typedef {import('../helpers/request-state').RequestStateType} RequestStateType
 * @typedef {import('../helpers/flow-helper').FlowHelperType} FlowHelperType
 * @typedef {import('../helpers/logger').BaseLoggerType} BaseLoggerType
 */

class OrderFeedUpdate {
  /**
   * @param {object} args
   * @param {RequestStateType} args.state
   * @param {FlowHelperType} args.flow
   * @param {BaseLoggerType} args.logger
   * @param {'orders-feed-after-u' | 'orders-feed-after-p'} args.ordersFeedMode
   *   Defines where the orders feed data can be found and which flow functions
   *   to call. Each orders feed mode is stored separately so that a flow is
   *   able to read the orders feed multiple times in different contexts (e.g.
   *   a successful Proposal followed by a Cancellation).
   */
  constructor({ state, flow, logger, ordersFeedMode }) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
    this.ordersFeedMode = ordersFeedMode;
  }

  /**
   * Note: This create a beforeAll() block
   */
  beforeSetup() {
    beforeAll(async () => {
      switch (this.ordersFeedMode) {
        case 'orders-feed-after-u':
          await this.flow.getFeedUpdateAfterU();
          return;
        case 'orders-feed-after-p':
          await this.flow.getFeedUpdateAfterP();
          return;
        default:
          throw new Error(`Unrecognized ordersFeedMode: "${this.ordersFeedMode}"`);
      }
    });

    return this;
  }

  /**
   * Note: This create it() blocks
   */
  validationTests() {
    sharedValidationTests.shouldBeValidResponse(
      () => this.getStateResponse(),
      `OrderFeed(${this.ordersFeedMode})`,
      this.logger,
      {
        validationMode: 'OrdersFeed',
      },
    );
    return this;
  }

  getStateResponse() {
    switch (this.ordersFeedMode) {
      case 'orders-feed-after-u':
        return this.state.getOrderAfterUResponse;
      case 'orders-feed-after-p':
        return this.state.getOrderAfterPResponse;
      default:
        throw new Error(`Unrecognized ordersFeedMode: "${this.ordersFeedMode}"`);
    }
  }

  /**
   * Note: This creates an it() blocks
   */
  successChecks() {
    it('should return 200 on success', () => {
      chakram.expect(this.getStateResponse()).to.have.status(200);
    });
    return this;
  }
}

module.exports = {
  OrderFeedUpdate,
};
