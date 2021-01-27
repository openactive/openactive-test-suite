const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {{}} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse'>>} Output
 */

/**
 * @param {object} args
 * @param {string} args.uuid
 * @param {SellerConfig} args.sellerConfig
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runOrderDeletion({ uuid, sellerConfig, requestHelper }) {
  const sellerId = sellerConfig['@id'];
  const response = await requestHelper.deleteOrder(uuid, { sellerId });

  return {
    httpResponse: response,
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class OrderDeletionFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {SellerConfig} args.sellerConfig
   */
  constructor({ prerequisite, requestHelper, uuid, sellerConfig }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName: 'Order Deletion',
      async runFn() {
        return await runOrderDeletion({
          uuid,
          sellerConfig,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp204SuccessChecks(),
      itValidationTestsFn: () => { },
    });
  }
}

module.exports = {
  OrderDeletionFlowStage,
};
