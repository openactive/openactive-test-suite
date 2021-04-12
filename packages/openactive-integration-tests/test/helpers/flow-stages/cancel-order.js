const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('../../templates/u-req').UReqTemplateData} UReqTemplateData
 * @typedef {import('../../templates/u-req').UReqTemplateRef} UReqTemplateRef
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('./b').BFlowStageType} BFlowStageType
 */

/**
 * @typedef {{}} Input
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse'>>} Output
 */

/**
 * @param {object} args
 * @param {UReqTemplateRef} [args.templateRef]
 * @param {string[]} args.orderItemIdArray[]
 * @param {string} args.uuid
 * @param {RequestHelperType} args.requestHelper
 */
async function runCancelOrder({ templateRef, orderItemIdArray, uuid, requestHelper }) {
  /** @type {import('../../templates/u-req').UReqTemplateData} */
  const params = { orderItemIdArray, _uuid: uuid };
  const httpResponse = await requestHelper.cancelOrder(uuid, params, templateRef);
  return { httpResponse };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class CancelOrderFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {UReqTemplateRef} [args.templateRef]
   * @param {() => string[]} args.getOrderItemIdArray Cancellation must be run against
   *   a specific order. The function passed here should return the ID of the OrderItem
   *   to cancel. For convenience, use the CancelOrderFlowStage.getFirstOrderItemId
   *   function for this value e.g.:
   *
   *   ```js
   *   const b = new BFlowStage({ ... });
   *   const cancelOrder = new CancelOrderFlowStage({
   *     getOrderItemIdArray: CancelOrderFlowStage.getFirstOrderItemId(() => b.getOutput().httpResponse.body),
   *   ```
   *
   *  or, for a preceding B stage, just use `CancelOrderFlowStage.getOrderItemIdForPosition0FromB(b)`
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {string} [args.testName]
   */
  constructor({ templateRef, getOrderItemIdArray, prerequisite, requestHelper, uuid, testName }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName: testName ?? 'Cancel Order',
      async runFn() {
        const orderItemIdArray = getOrderItemIdArray();
        return await runCancelOrder({
          templateRef,
          orderItemIdArray,
          uuid,
          requestHelper,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttpXXXSuccessChecks(204),
      // no validation tests needed for CancelOrder, as the response is empty
      itValidationTestsFn: () => { },
    });
  }

  /**
   * Create a `getOrderItemIdForPosition0FromB` function which gets the "@id" of the
   * OrderItem with position 0 of the FlowStage's output.
   *
   * @param {BFlowStageType} bFlowStage
   */
  static getOrderItemIdForPosition0FromB(bFlowStage) {
    return () => CancelOrderFlowStage.getOrderItemIdsByPositionFromB(bFlowStage, [0])();
  }

  /**
   * @param {BFlowStageType} bFlowStage
   * @param {number[]} orderItemPositions
   */
  static getOrderItemIdsByPositionFromB(bFlowStage, orderItemPositions) {
    return () => {
      const order = bFlowStage.getOutput().httpResponse.body;
      const orderItems = order.orderedItem;
      const orderItemIds = orderItemPositions.map((position) => {
        const orderItem = orderItems.find(o => o.position === position);
        if (!orderItem) {
          throw new Error(`An OrderItem with "position" value ${position} was not found`);
        }
        if (!orderItem['@id']) {
          throw new Error(`The OrderItem with "position" value ${position} did not have an "@id" property`);
        }
        return orderItem['@id'];
      });

      return orderItemIds;
    };
  }
}

module.exports = {
  CancelOrderFlowStage,
};
