const { getTotalPaymentDueFromOrder, getOrderProposalVersion, getOrderId, getPrepaymentFromOrder } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/b-req').AccessPassItem} AccessPassItem
 * @typedef {import('../../templates/b-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('../../templates/b-req').PReqTemplateData} PReqTemplateData
 * @typedef {import('./fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('./flow-stage').Prepayment} Prepayment
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 * @typedef {import('./flow-stage-utils').Customer} Customer
 * @typedef {import('./flow-stage').PositionOrderIntakeFormMap} PositionOrderIntakeFormMap
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems' | 'totalPaymentDue' | 'prepayment'>>
 *  & Partial<Pick<FlowStageOutput, 'positionOrderIntakeFormMap'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'prepayment' | 'orderProposalVersion' | 'orderId'>>} Output
 */

/**
 * @param {object} args
 * @param {PReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {SellerConfig} args.sellerConfig
 * @param {Customer} [args.customer]
 * @param {OrderItem[]} args.orderItems
 * @param {number} args.totalPaymentDue
 * @param {Prepayment} args.prepayment
 * @param {RequestHelperType} args.requestHelper
 * @param {PositionOrderIntakeFormMap} args.positionOrderIntakeFormMap
 * @param {AccessPassItem[] | null} [args.accessPass]
 * @param {string | null} args.brokerRole
 * @param {string} args.paymentIdentifierIfPaid
 * @returns {Promise<Output>}
 */
async function runP({
  templateRef,
  uuid,
  sellerConfig,
  customer,
  orderItems,
  totalPaymentDue,
  prepayment,
  positionOrderIntakeFormMap,
  accessPass,
  brokerRole,
  requestHelper,
  paymentIdentifierIfPaid,
}) {
  /** @type {import('../../templates/b-req').PReqTemplateData} */
  const params = {
    orderType: 'OrderProposal',
    sellerId: sellerConfig['@id'],
    orderItems,
    totalPaymentDue,
    openBookingPrepayment: prepayment,
    accessPass,
    brokerRole,
    positionOrderIntakeFormMap,
    customer,
    paymentIdentifier: paymentIdentifierIfPaid,
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
   * @param {string} args.paymentIdentifierIfPaid This Payment Identifier will be used if this is a paid
   *   booking. Otherwise, it won't be. This is specified as an arg to allow for consistency between idempotent
   *   P calls.
   */
  constructor({
    templateRef,
    accessPass,
    brokerRole,
    prerequisite,
    getInput,
    logger,
    requestHelper,
    uuid,
    sellerConfig,
    customer,
    paymentIdentifierIfPaid,
  }) {
    super({
      prerequisite,
      getInput,
      testName: 'P',
      async runFn(input) {
        const { orderItems, totalPaymentDue, prepayment, positionOrderIntakeFormMap } = input;
        return await runP({
          templateRef,
          accessPass,
          brokerRole,
          uuid,
          sellerConfig,
          customer,
          orderItems,
          totalPaymentDue,
          prepayment,
          positionOrderIntakeFormMap,
          requestHelper,
          paymentIdentifierIfPaid,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp201SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'P',
        validationMode: 'PResponse',
      }),
    });
  }
}

/**
 * @typedef {InstanceType<typeof PFlowStage>} PFlowStageType
 */

module.exports = {
  PFlowStage,
};
