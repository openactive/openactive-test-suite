const { getTotalPaymentDueFromOrder, getOrderId } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/c1-req').C1ReqTemplateRef} C1ReqTemplateRef
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'orderId'>>} Output
 */

/**
 * @param {object} args
 * @param {C1ReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {string} args.sellerId
 * @param {OrderItem[]} args.orderItems
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runC1({ templateRef, uuid, sellerId, orderItems, requestHelper }) {
  const params = {
    sellerId,
    orderItems,
  };
  const response = await requestHelper.putOrderQuoteTemplate(uuid, params, null, templateRef);
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
class C1FlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {C1ReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown, unknown>} [args.prerequisite]
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
      testName: 'C1',
      async runFn(input) {
        const { orderItems } = input;
        return await runC1({
          templateRef,
          uuid,
          sellerId,
          orderItems,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, { name: 'C1', validationMode: 'C1Response' }),
    });
  }
}

/**
 * @typedef {InstanceType<typeof C1FlowStage>} C1FlowStageType
 */

module.exports = {
  C1FlowStage,
  runC1,
};
