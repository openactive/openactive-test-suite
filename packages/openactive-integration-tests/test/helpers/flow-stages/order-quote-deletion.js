const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {{}} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse'>>} Output
 */

/**
 * @param {object} args
 * @param {string} args.uuid
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runOrderQuoteDeletion({ uuid, requestHelper }) {
  const response = await requestHelper.deleteOrderQuote(uuid);

  return {
    httpResponse: response,
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class OrderQuoteDeletionFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   */
  constructor({ prerequisite, requestHelper, uuid }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName: 'Order Quote Deletion',
      async runFn() {
        return await runOrderQuoteDeletion({
          uuid,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp204SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.createNoOpTest(),
    });
  }
}

module.exports = {
  OrderQuoteDeletionFlowStage,
};
