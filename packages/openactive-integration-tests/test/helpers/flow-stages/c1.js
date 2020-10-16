const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/c1-req').C1ReqTemplateRef} C1ReqTemplateRef
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */

const C1FlowStage = {
  /**
   * @param {object} args
   * @param {C1ReqTemplateRef} [args.templateRef]
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   */
  create({ templateRef, prerequisite, logger, requestHelper }) {
    return new FlowStage({
      prerequisite,
      testName: 'C1',
      async runFn(flowStage) {
        const { uuid, sellerId, orderItems } = flowStage.getPrerequisiteCombinedStateAssertFields(['uuid', 'sellerId', 'orderItems']);
        return await C1FlowStage.run({
          templateRef,
          uuid,
          sellerId,
          orderItems,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'C1',
        validationMode: 'C1Response',
      }),
    });
  },

  /**
   * @param {object} args
   * @param {C1ReqTemplateRef} [args.templateRef]
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
    const response = await requestHelper.putOrderQuoteTemplate(uuid, params, templateRef);

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
  C1FlowStage,
};
