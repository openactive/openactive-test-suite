const { getTotalPaymentDueFromOrder, getOrderId, getPrepaymentFromOrder } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/b-req').BReqTemplateRef} BReqTemplateRef
 * @typedef {import('./fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('./flow-stage').Prepayment} Prepayment
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems' | 'totalPaymentDue' | 'prepayment'>>
 *   & Partial<Pick<FlowStageOutput, 'orderProposalVersion'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'prepayment' | 'orderId'>>} Output
 */

/**
 * @param {object} args
 * @param {BReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {SellerConfig} args.sellerConfig
 * @param {OrderItem[]} args.orderItems
 * @param {number} args.totalPaymentDue
 * @param {Prepayment} args.prepayment
 * @param {string} [args.orderProposalVersion]
 * @param {RequestHelperType} args.requestHelper
 * @param {string | null} args.brokerRole
 * @returns {Promise<Output>}
 */
async function runB({ templateRef, brokerRole, uuid, sellerConfig, orderItems, totalPaymentDue, prepayment, orderProposalVersion, requestHelper }) {
  const params = {
    sellerId: sellerConfig['@id'],
    orderItems,
    totalPaymentDue,
    prepayment,
    orderProposalVersion,
    brokerRole,
  };
  const response = await requestHelper.putOrder(uuid, params, templateRef);
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
class BFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {BReqTemplateRef} [args.templateRef]
   * @param {string | null} [args.brokerRole]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {() => Input} args.getInput
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {SellerConfig} args.sellerConfig
   */
  constructor({ templateRef, brokerRole, prerequisite, getInput, logger, requestHelper, uuid, sellerConfig }) {
    super({
      prerequisite,
      getInput,
      testName: 'B',
      async runFn(input) {
        const { orderItems, totalPaymentDue, prepayment, orderProposalVersion } = input;
        return await runB({
          templateRef,
          brokerRole,
          uuid,
          sellerConfig,
          orderItems,
          totalPaymentDue,
          prepayment,
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

/**
 * @typedef {InstanceType<typeof BFlowStage>} BFlowStageType
 */

module.exports = {
  BFlowStage,
};
