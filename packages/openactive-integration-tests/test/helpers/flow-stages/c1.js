const { Common } = require('../../shared-behaviours');
const { getTotalPaymentDueFromOrder, getOrderId, getPrepaymentFromOrder, createPositionOrderIntakeFormMap } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/c1-req').C1ReqTemplateRef} C1ReqTemplateRef
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('./fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'prepayment' | 'orderId' | 'positionOrderIntakeFormMap'>>} Output
 */

/**
 * @param {object} args
 * @param {C1ReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {string | null} [args.brokerRole]
 * @param {SellerConfig} args.sellerConfig
 * @param {OrderItem[]} args.orderItems
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runC1({ templateRef, uuid, brokerRole, sellerConfig, orderItems, requestHelper }) {
  const params = {
    sellerId: sellerConfig['@id'],
    orderItems,
    brokerRole,
  };
  const response = await requestHelper.putOrderQuoteTemplate(uuid, params, templateRef);
  const bookingSystemOrder = response.body;

  return {
    httpResponse: response,
    totalPaymentDue: getTotalPaymentDueFromOrder(bookingSystemOrder),
    prepayment: getPrepaymentFromOrder(bookingSystemOrder),
    orderId: getOrderId(bookingSystemOrder),
    positionOrderIntakeFormMap: createPositionOrderIntakeFormMap(bookingSystemOrder),
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class C1FlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {C1ReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown, unknown>} [args.prerequisite]
   * @param {() => Input} args.getInput
   * @param {string | null} [args.brokerRole]
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {SellerConfig} args.sellerConfig
   */
  constructor({ orderItemCriteriaList, templateRef, prerequisite, getInput, brokerRole, logger, requestHelper, uuid, sellerConfig }) {
    super({
      prerequisite,
      getInput,
      testName: 'C1',
      async runFn(input) {
        const { orderItems } = input;
        return await runC1({
          templateRef,
          uuid,
          brokerRole,
          sellerConfig,
          orderItems,
          requestHelper,
        });
      },
      itSuccessChecksFn: (flowStage) => {
        FlowStageUtils.simpleHttp200SuccessChecks()(flowStage);
        Common.itForEachOrderItemShouldHaveUnchangedCapacity({
          orderItemCriteriaList,
          getFeedOrderItems: () => getInput().orderItems,
          getOrdersApiResponse: () => this.getOutput().httpResponse,
        });
      },
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
