const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/p-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */

/**
 * @typedef {{
 *   type: 'test:ReplacementSimulateAction' | 'test:SellerAcceptOrderProposalSimulateAction' | 'test:SellerRejectOrderProposalSimulateAction',
 *   objectType: 'OrderProposal',
 *   objectId: string,
 * }} ActionSpec
 */

const TestInterfaceActionFlowStage = {
  /**
   * @param {object} args
   * @param {string} args.testName
   * @param {() => ActionSpec} args.createActionFn This will be called when this
   *   FlowStage is run, so it has access to the output of any prerequisite stages.
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   */
  create({ testName, createActionFn, prerequisite, requestHelper }) {
    return new FlowStage({
      prerequisite,
      testName,
      async runFn() {
        const action = createActionFn();
        return await TestInterfaceActionFlowStage.run({ action, requestHelper });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttpXXXSuccessChecks(204),
      itValidationTestsFn() { /* there are no validation tests - the response is empty */ },
    });
  },

  /**
   * @param {object} args
   * @param {ActionSpec} args.action
   * @param {RequestHelperType} args.requestHelper
   * @returns {Promise<import('./flow-stage').FlowStageOutput<ChakramResponse>>}
   */
  async run({ action, requestHelper }) {
    const response = await requestHelper.callTestInterfaceAction({ action });

    return {
      result: {
        response,
        status: 'response-received',
      },
    };
  },
};

module.exports = {
  TestInterfaceActionFlowStage,
};
