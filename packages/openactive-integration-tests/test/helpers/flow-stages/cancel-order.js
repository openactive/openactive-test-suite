const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('../../templates/u-req').UReqTemplateData} UReqTemplateData
 * @typedef {import('../../templates/u-req').UReqTemplateRef} UReqTemplateRef
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('./b').BFlowStageType} BFlowStageType
 * @typedef {import('./p').PFlowStageType} PFlowStageType
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
   *   a specific OrderItem. The function passed here should return the ID of the OrderItem
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
   * @param {string} [args.testName] Defaults to "Cancel Order"
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
   * @param {BFlowStageType | PFlowStageType} firstBookStageWithPositions First book stage - either B or P
   *   Note that this uses the first Book stage (B or P) rather than B. This is because B-after-P
   *   does NOT have `position`s in its OrderItems.
   * @param {BFlowStageType} bFlowStageWithIds B Flow Stage. This may not have `position`s but it will have
   *   OrderItem `@id`s.
   */
  static getOrderItemIdForPosition0FromBookStages(firstBookStageWithPositions, bFlowStageWithIds) {
    return () => CancelOrderFlowStage.getOrderItemIdsByPositionFromBookStages(firstBookStageWithPositions, bFlowStageWithIds, [0])();
  }

  /**
   * @param {BFlowStageType | PFlowStageType} firstBookStageWithPositions First book stage - either B or P
   *   Note that this uses the first Book stage (B or P) rather than B. This is because B-after-P
   *   does NOT have `position`s in its OrderItems.
   * @param {BFlowStageType} bFlowStageWithIds B Flow Stage. This may not have `position`s but it will have
   *   OrderItem `@id`s.
   * @param {number[]} orderItemPositions
   */
  static getOrderItemIdsByPositionFromBookStages(firstBookStageWithPositions, bFlowStageWithIds, orderItemPositions) {
    return () => {
      const orderItemsWithPositions = firstBookStageWithPositions.getOutput().httpResponse.body.orderedItem;
      const orderItemsWithIds = bFlowStageWithIds.getOutput().httpResponse.body.orderedItem;
      /* First, because orderItemsWithIds might not have positions, let's match from positions to IDs using
      `.orderedItem`, which is the Opportunity ID. */
      // TODO TODO TODO here i am
      // const orderItems = order.orderedItem;
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
