const { getTotalPaymentDueFromOrder, getOrderId, getPrepaymentFromOrder } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/c2-req').C2ReqTemplateRef} C2ReqTemplateRef
 * @typedef {import('./fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 * @typedef {import('./flow-stage-utils').Customer} Customer
 * @typedef {import('./flow-stage').OrderItemIntakeForm} OrderItemIntakeForm
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems'>> & Partial<Pick<FlowStageOutput, 'positionOrderIntakeFormMap'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'prepayment' | 'orderId'>>} Output
 */

/**
 * @param {object} args
 * @param {C2ReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {string | null} [args.brokerRole]
 * @param {SellerConfig} args.sellerConfig
 * @param {OrderItem[]} args.orderItems
 * @param {RequestHelperType} args.requestHelper
 * @param {{[k:string]: OrderItemIntakeForm}} args.positionOrderIntakeFormMap
 * @param {Customer} [args.customer]
 * @returns {Promise<Output>}
 */
async function runC2({ templateRef, uuid, brokerRole, sellerConfig, orderItems, requestHelper, positionOrderIntakeFormMap, customer }) {
  const params = {
    sellerId: sellerConfig['@id'],
    orderItems,
    brokerRole,
    positionOrderIntakeFormMap,
    customer,
  };
  const response = await requestHelper.putOrderQuote(uuid, params, templateRef);
  const bookingSystemOrder = response.body;

  return {
    httpResponse: response,
    totalPaymentDue: getTotalPaymentDueFromOrder(bookingSystemOrder),
    prepayment: getPrepaymentFromOrder(bookingSystemOrder),
    orderId: getOrderId(bookingSystemOrder),
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class C2FlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {C2ReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown>} [args.prerequisite]
   * @param {() => Input} args.getInput
   * @param {string | null} [args.brokerRole]
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {SellerConfig} args.sellerConfig
   * @param {Customer} [args.customer]
   */
  constructor({ templateRef, prerequisite, getInput, brokerRole, logger, requestHelper, uuid, sellerConfig, customer }) {
    super({
      prerequisite,
      testName: 'C2',
      getInput,
      async runFn(input) {
        const { orderItems, positionOrderIntakeFormMap } = input;
        return await runC2({
          templateRef,
          uuid,
          brokerRole,
          sellerConfig,
          orderItems,
          requestHelper,
          positionOrderIntakeFormMap,
          customer,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'C2',
        validationMode: 'C2Response',
      }),
    });
  }
}

/**
 * @typedef {InstanceType<typeof C2FlowStage>} C2FlowStageType
 */

module.exports = {
  C2FlowStage,
  runC2,
};
