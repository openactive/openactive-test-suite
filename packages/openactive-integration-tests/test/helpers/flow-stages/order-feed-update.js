/**
 * This actually contains 2 Flow Stages - a Listener and a Collector.
 *
 * The Test Suite is not constantly checking for Order Feed updates. It only
 * starts checking when instructed. Therefore, if, say, an order is cancelled and
 * then the Test Suite is instructed to check for the associated Order Feed update,
 * it is possible that the Booking System's order feed (if it was really quick!)
 * processes the cancellation and releases an update to their feed before the Test
 * Suite starts checking. Therefore, the Test Suite would miss the update and the
 * request would timeout.
 *
 * So, the fix is to have, when expecting Order Feed updates, the following stages
 * in sequence:
 *
 * 1. Order Feed Update Listener
 * 2. {A FlowStage which instructs the Booking System to update its Order Feed e.g. Cancellation}
 * 3. Order Feed Update Collector
 *
 * A `wrap` function has also been provided, to reduce the boilerplate of setting
 * up a listener and collector each time.
 */
const { getTotalPaymentDueFromOrder, getOrderProposalVersion, getOrderId, getPrepaymentFromOrder } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('./fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {'orders' | 'order-proposals'} OrderType
 *
 * @typedef {{}} ListenerInput
 * @typedef {{}} ListenerOutput
 *
 * @typedef {ListenerOutput} CollectorInput
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'prepayment' | 'orderProposalVersion' | 'orderId'>>} CollectorOutput
 */

/**
 * @param {object} args
 * @param {string} args.uuid
 * @param {RequestHelperType} args.requestHelper
 * @param {OrderType} args.orderType
 * @returns {Promise<ListenerOutput>}
 */
async function runOrderFeedListener({ uuid, requestHelper, orderType }) {
  await requestHelper.postFeedChangeListener(orderType, uuid);
  return {};
}

/**
 * @param {object} args
 * @param {string} args.uuid
 * @param {RequestHelperType} args.requestHelper
 * @param {OrderType} args.orderType
 * @returns {Promise<CollectorOutput>}
 */
async function runOrderFeedCollector({ uuid, requestHelper, orderType }) {
  const response = await requestHelper.getFeedChangeCollection(orderType, uuid);
  // Response will be for an RPDE item, so the Order is at `.data`
  const bookingSystemOrder = response.body && response.body.data;
  return {
    httpResponse: response,
    totalPaymentDue: getTotalPaymentDueFromOrder(bookingSystemOrder),
    prepayment: getPrepaymentFromOrder(bookingSystemOrder),
    orderProposalVersion: getOrderProposalVersion(bookingSystemOrder),
    orderId: getOrderId(bookingSystemOrder),
  };
}

/**
 * FlowStage which initiates the checking for Order Feed Updates.
 *
 * @extends {FlowStage<ListenerInput, ListenerOutput>}
 */
class OrderFeedUpdateListener extends FlowStage {
  /**
   * @param {object} args
   * @param {FlowStage<unknown, unknown>} [args.prerequisite]
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {OrderType} args.orderType
   */
  constructor({ prerequisite, uuid, requestHelper, orderType }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName: '_Order Feed Update Listener',
      shouldDescribeFlowStage: false,
      async runFn() {
        return await runOrderFeedListener({
          uuid,
          requestHelper,
          orderType,
        });
      },
      itSuccessChecksFn() { /* there are no success checks - these happen at the OrderFeedUpdateCollector stage */ },
      itValidationTestsFn() { /* there are no validation tests - validation happens at the OrderFeedUpdateCollector stage */ },
    });
  }
}

/**
 * FlowStage which collects the results from an initiated Order Feed Update.
 *
 * This stage must come after (but not necessarily directly after) a Order Feed Update
 * Listener stage (@see OrderFeedUpdateListener).
 *
 * @extends {FlowStage<CollectorInput, CollectorOutput>}
 */
class OrderFeedUpdateCollector extends FlowStage {
  /**
   * @param {object} args
   * @param {string} args.testName
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {OrderType} args.orderType
   */
  constructor({ testName, prerequisite, logger, uuid, requestHelper, orderType }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName,
      async runFn() {
        return await runOrderFeedCollector({
          uuid,
          requestHelper,
          orderType,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'OrderFeed',
        validationMode: 'OrdersFeed',
      }),
    });
  }
}

const OrderFeedUpdateFlowStageUtils = {
  /**
   * Helper function to reduce the boilerplate of checking for Order Feed updates
   * in a flow. As mentioned in the doc at the top of this module, you need a listener
   * and collector flow stages.
   *
   * This function simplifies this for the most common use case:
   *
   * 1. Listen for changes to Order Feed
   * 2. Do some action that will cause the Booking System to put something into the Order Feed
   * 3. Collect that item from the Order Feed.
   *
   * To avoid doubt, when using this function, the following flow is created:
   *
   * 1. `orderFeedUpdateParams.prerequisite` (if supplied)
   * 2. An internal OrderFeedUpdateListener
   * 3. `wrappedStageFn(prerequisite)` (**as long as the wrapped stage
   *   sets, as its prerequisite, the argument supplied to it by function call**)
   * 4. `orderFeedUpdateCollector`
   * 5. Whatever FlowStage is set up to take `orderFeedUpdateCollector` as its prerequisite
   *
   * @template {import('./flow-stage').FlowStageType<any, any>} TWrappedFlowStage
   * @param {object} args
   * @param {(prerequisite: OrderFeedUpdateListener) => TWrappedFlowStage} args.wrappedStageFn
   *   Returns a Stage that will cause the Booking System to put something into the
   *   Order Feed.
   *   This stage must have its prerequisite set as the OrderFeedUpdateListener which
   *   is supplied to it in this function.
   * @param {object} args.orderFeedUpdateParams Params which will be fed into the
   *   OrderFeed update flow stages.
   * @param {OrderType} [args.orderFeedUpdateParams.orderType] Defaults to `orders`
   * @param {FlowStage<unknown, unknown>} [args.orderFeedUpdateParams.prerequisite]
   *   Prerequisite for the OrderFeedUpdateListener.
   * @param {string} args.orderFeedUpdateParams.testName Name for the OrderFeedUpdateCollector
   *   flow stage. A flow can have multiple OrderFeedUpdateCollectors, so its helpful
   *   to give them individual names, to make the test logs clearer.
   * @param {RequestHelperType} args.orderFeedUpdateParams.requestHelper
   * @param {BaseLoggerType} args.orderFeedUpdateParams.logger
   * @param {string} args.orderFeedUpdateParams.uuid
   * @returns {[TWrappedFlowStage, OrderFeedUpdateCollector]}
   *   TODO update return signature to `{[wrappedStage: TWrappedFlowStage, orderFeedUpdateCollector: OrderFeedUpdateCollector]}`
   *   when project upgrades TypeScript to v4
   */
  wrap({ wrappedStageFn, orderFeedUpdateParams }) {
    const orderType = orderFeedUpdateParams.orderType ?? 'orders';
    const listenForOrderFeedUpdate = new OrderFeedUpdateListener({
      requestHelper: orderFeedUpdateParams.requestHelper,
      uuid: orderFeedUpdateParams.uuid,
      prerequisite: orderFeedUpdateParams.prerequisite,
      orderType,
    });
    const wrappedStage = wrappedStageFn(listenForOrderFeedUpdate);
    const collectOrderFeedUpdate = new OrderFeedUpdateCollector({
      testName: orderFeedUpdateParams.testName,
      prerequisite: wrappedStage,
      requestHelper: orderFeedUpdateParams.requestHelper,
      uuid: orderFeedUpdateParams.uuid,
      logger: orderFeedUpdateParams.logger,
      orderType,
    });
    return [wrappedStage, collectOrderFeedUpdate];
  },
};

/**
 * @typedef {InstanceType<typeof OrderFeedUpdateCollector>} OrderFeedUpdateCollectorType
 * @typedef {InstanceType<typeof OrderFeedUpdateListener>} OrderFeedUpdateListenerType
 */

module.exports = {
  OrderFeedUpdateListener,
  OrderFeedUpdateCollector,
  OrderFeedUpdateFlowStageUtils,
};
