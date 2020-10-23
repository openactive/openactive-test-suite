const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {'test:AccessCodeUpdateSimulateAction'
 *   | 'test:AccessPassUpdateSimulateAction'
 *   | 'test:ChangeOfLogisticsSimulateAction'
 *   | 'test:CustomerNoticeSimulateAction'
 *   | 'test:OpportunityAttendanceUpdateSimulateAction'
 *   | 'test:ReplacementSimulateAction'
 *   | 'test:SellerAcceptOrderProposalSimulateAction'
 *   | 'test:SellerRejectOrderProposalSimulateAction'
 *   | 'test:SellerRequestedCancellationSimulateAction'
 *   | 'test:SellerRequestedCancellationWithMessageSimulateAction'
 * } TestInterfaceActionType Taken from https://openactive.io/test-interface/#classes
 *
 * @typedef {{
 *   type: 'test:ReplacementSimulateAction' | 'test:SellerAcceptOrderProposalSimulateAction' | 'test:SellerRejectOrderProposalSimulateAction' | 'test:SellerRequestedCancellationWithMessageSimulateAction',
 *   objectType: 'Order' | 'OrderProposal',
 *   objectId: string,
 * }} ActionSpec
 *
 * @typedef {{}} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse'>>} Output
 */

/**
 * @param {object} args
 * @param {ActionSpec} args.action
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runTestInterfaceAction({ action, requestHelper }) {
  const response = await requestHelper.callTestInterfaceAction({ action });

  return {
    httpResponse: response,
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class TestInterfaceActionFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {string} args.testName
   * @param {() => ActionSpec} args.createActionFn This will be called when this
   *   FlowStage is run, so it has access to the output of any prerequisite stages.
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   */
  constructor({ testName, createActionFn, prerequisite, requestHelper }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName,
      async runFn() {
        const action = createActionFn();
        return await runTestInterfaceAction({ action, requestHelper });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttpXXXSuccessChecks(204),
      itValidationTestsFn() { /* there are no validation tests - the response is empty */ },
    });
  }
}

module.exports = {
  TestInterfaceActionFlowStage,
};
