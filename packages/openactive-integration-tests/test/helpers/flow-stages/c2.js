const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/c2-req').C2ReqTemplateRef} C2ReqTemplateRef
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */


const C2FlowStage = {
  /**
   * @param {object} args
   * @param {C2ReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   */
  create({ templateRef, prerequisite, logger, requestHelper }) {
    return new FlowStage({
      prerequisite,
      testName: 'C2',
      async runFn(flowStage) {
        const { uuid, sellerId, orderItems } = flowStage.getPrerequisiteCombinedStateAssertFields(['uuid', 'sellerId', 'orderItems']);
        return await C2FlowStage.run({
          templateRef,
          uuid,
          sellerId,
          orderItems,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'C2',
        validationMode: 'C2Response',
      }),
    });
  },

  /**
   * @param {object} args
   * @param {C2ReqTemplateRef} [args.templateRef]
   * @param {string} args.uuid
   * @param {string} args.sellerId
   * @param {OrderItem[]} args.orderItems
   * @param {RequestHelperType} args.requestHelper
   * @returns {Promise<import('./flow-stage').FlowStageOutput<ChakramResponse>>}
   */
  async run({ templateRef, uuid, sellerId, orderItems, requestHelper }) {
    const params = {
      sellerId,
      orderItems,
    };
    const response = await requestHelper.putOrderQuote(uuid, params, templateRef);

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
  C2FlowStage,
};
