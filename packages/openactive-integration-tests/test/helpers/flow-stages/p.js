const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/p-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */


const PFlowStage = {
  /**
   * @param {object} args
   * @param {PReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   */
  create({ templateRef, prerequisite, logger, requestHelper }) {
    return new FlowStage({
      prerequisite,
      testName: 'P',
      async runFn(flowStage) {
        const { uuid, sellerId, orderItems } = flowStage.getPrerequisiteCombinedStateAssertFields(['uuid', 'sellerId', 'orderItems']);
        const totalPaymentDue = flowStage.getAndAssertTotalPaymentDueFromPrerequisiteCombinedState();
        return await PFlowStage.run({
          templateRef,
          uuid,
          sellerId,
          orderItems,
          totalPaymentDue,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'P',
        validationMode: 'PResponse',
      }),
    });
  },

  /**
   * @param {object} args
   * @param {PReqTemplateRef} [args.templateRef]
   * @param {string} args.uuid
   * @param {string} args.sellerId
   * @param {OrderItem[]} args.orderItems
   * @param {number} args.totalPaymentDue
   * @param {RequestHelperType} args.requestHelper
   * @returns {Promise<import('./flow-stage').FlowStageOutput<ChakramResponse>>}
   */
  async run({ templateRef, uuid, sellerId, orderItems, totalPaymentDue, requestHelper }) {
    const params = {
      sellerId,
      orderItems,
      totalPaymentDue,
    };
    const response = await requestHelper.putOrderProposal(uuid, params, templateRef);

    return {
      result: {
        response,
        status: 'response-received',
      },
      state: {
        bookingSystemOrder: response,
      },
    };
  },
};

module.exports = {
  PFlowStage,
};
