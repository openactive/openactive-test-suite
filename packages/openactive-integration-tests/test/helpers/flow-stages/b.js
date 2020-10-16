const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/b-req').BReqTemplateRef} BReqTemplateRef
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */


const BFlowStage = {
  /**
   * @param {object} args
   * @param {BReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   */
  create({ templateRef, prerequisite, logger, requestHelper }) {
    return new FlowStage({
      prerequisite,
      testName: 'B',
      async runFn(flowStage) {
        const { uuid, sellerId, orderItems, bookingSystemOrder } = flowStage.getPrerequisiteCombinedStateAssertFields(['uuid', 'sellerId', 'orderItems', 'bookingSystemOrder']);
        // This will be undefined if P was not run - that's fine
        const { orderProposalVersion } = bookingSystemOrder.body;
        const totalPaymentDue = flowStage.getAndAssertTotalPaymentDueFromPrerequisiteCombinedState();
        return await BFlowStage.run({
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
  },

  /**
   * @param {object} args
   * @param {BReqTemplateRef} [args.templateRef]
   * @param {string} args.uuid
   * @param {string} args.sellerId
   * @param {OrderItem[]} args.orderItems
   * @param {number} args.totalPaymentDue
   * @param {string} [args.orderProposalVersion]
   * @param {RequestHelperType} args.requestHelper
   * @returns {Promise<import('./flow-stage').FlowStageOutput<ChakramResponse>>}
   */
  async run({ templateRef, uuid, sellerId, orderItems, totalPaymentDue, orderProposalVersion, requestHelper }) {
    const params = {
      sellerId,
      orderItems,
      totalPaymentDue,
      orderProposalVersion,
    };
    const response = await requestHelper.putOrder(uuid, params, templateRef);

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
  BFlowStage,
};
