const { getTotalPaymentDueFromOrder, getOrderId } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/b-req').BReqTemplateRef} BReqTemplateRef
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems' | 'totalPaymentDue'>>
 *   & Partial<Pick<FlowStageOutput, 'orderProposalVersion'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'orderId'>>} Output
 */

/**
 * @param {object} args
 * @param {BReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {string} args.sellerId
 * @param {OrderItem[]} args.orderItems
 * @param {number} args.totalPaymentDue
 * @param {string} [args.orderProposalVersion]
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runB({ templateRef, uuid, sellerId, orderItems, totalPaymentDue, orderProposalVersion, requestHelper }) {
  const params = {
    sellerId,
    orderItems,
    totalPaymentDue,
    orderProposalVersion,
  };
  const response = await requestHelper.putOrder(uuid, params, templateRef);
  const bookingSystemOrder = response.body;

  return {
    httpResponse: response,
    totalPaymentDue: getTotalPaymentDueFromOrder(bookingSystemOrder),
    orderId: getOrderId(bookingSystemOrder),
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class BFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {BReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {() => Input} args.getInput
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {string} args.sellerId
   */
  constructor({ templateRef, prerequisite, getInput, logger, requestHelper, uuid, sellerId }) {
    super({
      prerequisite,
      getInput,
      testName: 'B',
      async runFn(input) {
        const { orderItems, totalPaymentDue, orderProposalVersion } = input;
        return await runB({
          templateRef,
          uuid,
          sellerId,
          orderItems,
          totalPaymentDue,
          orderProposalVersion,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'B',
        validationMode: 'BResponse',
      }),
    });
  }
}

module.exports = {
  BFlowStage,
};
