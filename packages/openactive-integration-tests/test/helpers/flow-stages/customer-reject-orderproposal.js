const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('../../templates/reject-order-proposal-req').RejectOrderProposalReqTemplateRef} RejectOrderProposalReqTemplateRef
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {{}} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse'>>} Output
 */

/**
 * @param {object} args
 * @param {RejectOrderProposalReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {RequestHelperType} args.requestHelper
 */
async function runCustomerRejectOrderProposal({ templateRef, uuid, requestHelper }) {
  const httpResponse = await requestHelper.customerRejectOrderProposal(uuid, templateRef);
  return { httpResponse };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class CustomerRejectOrderProposalFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {RejectOrderProposalReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {string} [args.testName] Defaults to "Customer Reject Order Proposal"
   */
  constructor({ templateRef, prerequisite, requestHelper, uuid, testName }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName: testName ?? 'Customer Reject Order Proposal',
      async runFn() {
        return await runCustomerRejectOrderProposal({
          templateRef,
          uuid,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttpXXXSuccessChecks(204),
      // no validation tests needed for CustomerRejectOrderProposal, as the response is empty
      itValidationTestsFn: FlowStageUtils.createNoOpTest(),
    });
  }
}

module.exports = {
  CustomerRejectOrderProposalFlowStage,
};
