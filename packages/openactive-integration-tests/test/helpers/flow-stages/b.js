const { getTotalPaymentDueFromOrder, getOrderId, getPrepaymentFromOrder } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/b-req').BReqTemplateRef} BReqTemplateRef
 * @typedef {import('../../templates/b-req').BReqTemplateData} BReqTemplateData
 * @typedef {import('../../templates/b-req').AccessPassItem} AccessPassItem
 * @typedef {import('./fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 * @typedef {import('./flow-stage-utils').Customer} Customer
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('./flow-stage').Prepayment} Prepayment
 * @typedef {import('./flow-stage').PositionOrderIntakeFormMap} PositionOrderIntakeFormMap
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems' | 'totalPaymentDue' | 'prepayment'>>
 *   & Partial<Pick<FlowStageOutput, 'orderProposalVersion' | 'positionOrderIntakeFormMap'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'prepayment' | 'orderId'>>} Output
 */

/**
 * @param {object} args
 * @param {BReqTemplateRef} [args.templateRef]
 * @param {AccessPassItem[] | null} [args.accessPass]
 * @param {string} args.uuid
 * @param {SellerConfig} args.sellerConfig
 * @param {Customer} [args.customer]
 * @param {OrderItem[]} args.orderItems
 * @param {number} args.totalPaymentDue
 * @param {Prepayment} args.prepayment
 * @param {string} [args.orderProposalVersion]
 * @param {RequestHelperType} args.requestHelper
 * @param {string | null} args.brokerRole
 * @param {PositionOrderIntakeFormMap} args.positionOrderIntakeFormMap
 * @returns {Promise<Output>}
 */
async function runB({ templateRef, accessPass, brokerRole, uuid, sellerConfig, customer, orderItems, totalPaymentDue, prepayment, orderProposalVersion, requestHelper, positionOrderIntakeFormMap }) {
  /** @type {BReqTemplateData} */
  const params = {
    orderType: 'Order',
    sellerId: sellerConfig['@id'],
    orderItems,
    totalPaymentDue,
    openBookingPrepayment: prepayment,
    orderProposalVersion,
    accessPass,
    brokerRole,
    positionOrderIntakeFormMap,
    customer,
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
   * @param {AccessPassItem[]} [args.accessPass] Access pass that is sent from the broker to the Booking System
   *   (https://www.openactive.io/open-booking-api/EditorsDraft/#extension-point-for-barcode-based-access-control)
   * @param {string | null} [args.brokerRole]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {() => Input} args.getInput
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {SellerConfig} args.sellerConfig
   * @param {Customer} [args.customer]
   */
  constructor({ templateRef, accessPass, brokerRole, prerequisite, getInput, logger, requestHelper, uuid, sellerConfig, customer }) {
    super({
      prerequisite,
      getInput,
      testName: 'B',
      async runFn(input) {
        const { orderItems, totalPaymentDue, prepayment, orderProposalVersion, positionOrderIntakeFormMap } = input;
        return await runB({
          templateRef,
          accessPass,
          brokerRole,
          uuid,
          sellerConfig,
          customer,
          orderItems,
          totalPaymentDue,
          prepayment,
          orderProposalVersion,
          requestHelper,
          positionOrderIntakeFormMap,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp201SuccessChecks(),
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
