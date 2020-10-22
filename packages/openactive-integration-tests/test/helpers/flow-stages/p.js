const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../templates/p-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'orderItems' | 'totalPaymentDue'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'bookingSystemOrder' | 'httpResponse'>>} Output
 */

/**
 * @param {object} args
 * @param {PReqTemplateRef} [args.templateRef]
 * @param {string} args.uuid
 * @param {string} args.sellerId
 * @param {OrderItem[]} args.orderItems
 * @param {number} args.totalPaymentDue
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runP({ templateRef, uuid, sellerId, orderItems, totalPaymentDue, requestHelper }) {
  const params = {
    sellerId,
    orderItems,
    totalPaymentDue,
  };
  const response = await requestHelper.putOrderProposal(uuid, params, templateRef);

  return {
    httpResponse: response,
    bookingSystemOrder: response,
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
   * @param {string} args.sellerId
   */
  constructor({ templateRef, prerequisite, getInput, logger, requestHelper, uuid, sellerId }) {
    super({
      prerequisite,
      getInput,
      testName: 'P',
      async runFn(input) {
        const { orderItems, totalPaymentDue } = input;
        return await runP({
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
  }
}

module.exports = {
  PFlowStage,
};
