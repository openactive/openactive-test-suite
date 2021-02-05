const { getTotalPaymentDueFromOrder, getOrderProposalVersion, getOrderId, getPrepaymentFromOrder } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/p-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('./fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('./flow-stage').Prepayment} Prepayment
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems' | 'totalPaymentDue'>>
 *  & Partial<Pick<FlowStageOutput, 'prepayment'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'prepayment' | 'orderProposalVersion' | 'orderId'>>} Output
 */

/**
 * @param {object} args
 * @param {PReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {SellerConfig} args.sellerConfig
 * @param {OrderItem[]} args.orderItems
 * @param {number} args.totalPaymentDue
 * @param {Prepayment} args.prepayment
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runP({ templateRef, uuid, sellerConfig, orderItems, totalPaymentDue, prepayment, requestHelper }) {
  const params = {
    sellerId: sellerConfig['@id'],
    orderItems,
    totalPaymentDue,
    prepayment,
  };
  const response = await requestHelper.putOrderProposal(uuid, params, templateRef);
  const bookingSystemOrder = response.body;

  return {
    httpResponse: response,
    totalPaymentDue: getTotalPaymentDueFromOrder(bookingSystemOrder),
    prepayment: getPrepaymentFromOrder(bookingSystemOrder),
    orderProposalVersion: getOrderProposalVersion(bookingSystemOrder),
    orderId: getOrderId(bookingSystemOrder),
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class PFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {PReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {() => Input} args.getInput
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {SellerConfig} args.sellerConfig
   */
  constructor({ templateRef, prerequisite, getInput, logger, requestHelper, uuid, sellerConfig }) {
    super({
      prerequisite,
      getInput,
      testName: 'P',
      async runFn(input) {
        const { orderItems, totalPaymentDue, prepayment } = input;
        return await runP({
          templateRef,
          uuid,
          sellerConfig,
          orderItems,
          totalPaymentDue,
          prepayment,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'P',
        validationMode: 'PResponse',
      }),
    });
  }
}

module.exports = {
  PFlowStage,
};
