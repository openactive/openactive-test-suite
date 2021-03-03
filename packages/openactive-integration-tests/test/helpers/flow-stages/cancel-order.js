const { get } = require('lodash');
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
   *  or, for a preceding B stage, just use `CancelOrderFlowStage.getFirstOrderItemIdFromB(b)`
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   */
  constructor({ templateRef, getOrderItemIdArray, prerequisite, requestHelper, uuid }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName: 'Cancel Order',
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
   * @param {() => unknown} getOrder e.g. `() => b.getOutput().httpResponse.body`.
   *   Function which returns an Order with OrderItems.
   */
  static getFirstOrderItemId(getOrder) {
    return () => {
      const order = getOrder();
      return [get(order, ['orderedItem', 0, '@id'])];
    };
  }

  /**
   * Create a `getOrderItemId` function which gets the 1st OrderItem's ID from
   * a B FlowStage's output.
   *
   * @param {BFlowStageType} bFlowStage
   */
  static getFirstOrderItemIdFromB(bFlowStage) {
    return CancelOrderFlowStage.getFirstOrderItemId(() => bFlowStage.getOutput().httpResponse.body);
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
        return orderItem['@id'];
      });

      return orderItemIds;
    };
  }
}

module.exports = {
  CancelOrderFlowStage,
};
