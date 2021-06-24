const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {'test:AccessChannelUpdateSimulateAction'
 *   | 'test:AccessCodeUpdateSimulateAction'
 *   | 'test:AccessPassUpdateSimulateAction'
 *   | 'test:ChangeOfLogisticsTimeSimulateAction'
 *   | 'test:ChangeOfLogisticsNameSimulateAction'
 *   | 'test:ChangeOfLogisticsLocationSimulateAction'
 *   | 'test:CustomerNoticeSimulateAction'
 *   | 'test:AttendeeAttendedSimulateAction'
 *   | 'test:AttendeeAbsentSimulateAction'
 *   | 'test:ReplacementSimulateAction'
 *   | 'test:SellerAcceptOrderProposalSimulateAction'
 *   | 'test:SellerAmendOrderProposalSimulateAction'
 *   | 'test:SellerRejectOrderProposalSimulateAction'
 *   | 'test:SellerRequestedCancellationSimulateAction'
 *   | 'test:SellerRequestedCancellationWithMessageSimulateAction'
 * } TestInterfaceActionType Taken from https://openactive.io/test-interface/#classes
 *
 * @typedef {{
 *   type: TestInterfaceActionType,
 *   objectType: string,
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
   * @param {string} args.testName Labels the jest `describe(..)` block
   *   e.g.: "Test Interface Action (test:SellerRejectOrderProposalSimulateAction)"
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

/**
 * @typedef {InstanceType<typeof TestInterfaceActionFlowStage>} TestInterfaceActionFlowStageType
 */

module.exports = {
  TestInterfaceActionFlowStage,
};
