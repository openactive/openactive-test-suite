const chakram = require('chakram');
const RequestHelper = require('../helpers/request-helper');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../helpers/request-state').RequestStateType} RequestStateType
 * @typedef {import('../helpers/flow-helper').FlowHelperType} FlowHelperType
 * @typedef {import('../helpers/logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../helpers/flow-helper').StageIdentifier} StageIdentifier
 */

/**
 * @typedef {{
 *   type: 'test:ReplacementSimulateAction' | 'test:SellerAcceptOrderProposalSimulateAction' | 'test:SellerRejectOrderProposalSimulateAction',
 *   objectType: 'OrderProposal',
 *   objectId: string,
 * }} ActionSpec
 */

class TestInterfaceAction {
  /**
   * @param {object} args
   * @param {FlowHelperType} args.flow
   * @param {BaseLoggerType} args.logger
   * @param {() => ActionSpec} args.createActionFn
   * @param {StageIdentifier} [args.completedFlowStage] Flow stage which must be
   *   completed before this action is invoked.
   */
  constructor({ flow, logger, createActionFn, completedFlowStage }) {
    this.flow = flow;
    this.createActionFn = createActionFn;
    this.completedFlowStage = completedFlowStage;
    this.requestHelper = new RequestHelper(logger);

    /** @type {ChakramResponse | null} */
    this._response = null;
  }

  /**
   * Note: This create a beforeAll() block
   */
  beforeSetup() {
    beforeAll(async () => {
      if (this.completedFlowStage) {
        await this.flow.awaitStage(this.completedFlowStage);
      }
      const action = this.createActionFn();
      this._response = await this.requestHelper.callTestInterfaceAction({ action });
    });
    return this;
  }

  /**
   * Note: This creates an it() blocks
   */
  successChecks() {
    it('should return 204 on success', () => {
      chakram.expect(this._response).to.have.status(204);
    });
    return this;
  }
}

module.exports = {
  TestInterfaceAction,
};
