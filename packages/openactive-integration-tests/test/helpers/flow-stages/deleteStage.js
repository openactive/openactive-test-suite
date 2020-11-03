const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems' | 'totalPaymentDue'>>
 *   & Partial<Pick<FlowStageOutput, 'orderProposalVersion'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse'>>} Output
 */

/**
 * @param {object} args
 * @param {string} args.uuid
 * @param {string} args.sellerId
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runOrderDeletion({ uuid, sellerId, requestHelper }) {
  const response = await requestHelper.deleteOrder(uuid, { sellerId });

  return {
    httpResponse: response,
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class OrderDeletionFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {() => Input} args.getInput
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {string} args.sellerId
   */
  constructor({ prerequisite, getInput, logger, requestHelper, uuid, sellerId }) {
    super({
      prerequisite,
      getInput,
      testName: 'order Deletion',
      async runFn() {
        return await runOrderDeletion({
          uuid,
          sellerId,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp204SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'Order Deletion',
        validationMode: 'OrderDeletionResponse',
      }),
    });
  }
}

module.exports = {
  OrderDeletionFlowStage,
};
