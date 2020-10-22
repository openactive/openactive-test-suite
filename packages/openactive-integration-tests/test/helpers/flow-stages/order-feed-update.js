/**
 * This actually contains 2 Flow Stages - a Listener and a Collector.
 *
 * The Test Suite is not constantly checking for Order Feed updates. It only
 * starts checking when instructed. Therefore, if, say, an order is cancelled and
 * then the Test Suite is instructed to check for the associated Order Feed update,
 * it is possible that the Booking System's order feed (if it was really quick!)
 * to process the cancellation and release an update to their feed before the Test
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
const { getTotalPaymentDueFromOrder, getOrderProposalVersion, getOrderId } = require('../order-utils');
const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {{}} ListenerInput
 * @typedef {Required<Pick<FlowStageOutput, 'getOrderFromOrderFeedPromise'>>} ListenerOutput
 *
 * @typedef {ListenerOutput} CollectorInput
 * @typedef {Required<Pick<FlowStageOutput, 'httpResponse' | 'totalPaymentDue' | 'orderProposalVersion' | 'orderId'>>} CollectorOutput
 */

/**
 * @param {object} args
 * @param {string} args.uuid
 * @param {RequestHelperType} args.requestHelper
 * @returns {ListenerOutput}
 */
function runOrderFeedListener({ uuid, requestHelper }) {
  // Note that the promise isn't awaited.
  // This won't resolve until a stage is run that will instruct the Booking System
  // to put the order into their feed.
  const getOrderPromise = requestHelper.getOrder(uuid);
  return {
    getOrderFromOrderFeedPromise: getOrderPromise,
  };
}

/**
 * @param {object} args
 * @param {Promise<ChakramResponse>} args.getOrderFromOrderFeedPromise
 * @returns {Promise<CollectorOutput>}
 */
async function runOrderFeedCollector({ getOrderFromOrderFeedPromise }) {
  const response = await getOrderFromOrderFeedPromise;
  // Response will be for an RPDE item, so the Order is at `.data`
  const bookingSystemOrder = response.body && response.body.data;
  return {
    httpResponse: response,
    totalPaymentDue: getTotalPaymentDueFromOrder(bookingSystemOrder),
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
   */
  constructor({ prerequisite, requestHelper, uuid }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName: '_Order Feed Update Initiator',
      shouldDescribeFlowStage: false,
      async runFn() {
        return runOrderFeedListener({ uuid, requestHelper });
      },
      itSuccessChecksFn() { /* there are no success checks - these happen at the OrderFeedUpdate stage */ },
      itValidationTestsFn() { /* there are no validation tests - validation happens at the OrderFeedUpdate stage */ },
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
   * FlowStage which collects the results from an initiated Order Feed Update.
   *
   * This stage must come after a Order Feed update initiator stage (@see OrderFeedUpdateFlowStage.createInitiator).
   *
   * @param {object} args
   * @param {string} args.testName
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {() => CollectorInput} args.getInput
   * @param {BaseLoggerType} args.logger
   */
  constructor({ testName, prerequisite, getInput, logger }) {
    super({
      prerequisite,
      getInput,
      testName,
      async runFn(input) {
        const { getOrderFromOrderFeedPromise } = input;
        return await runOrderFeedCollector({ getOrderFromOrderFeedPromise });
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
    const listenForOrderFeedUpdate = new OrderFeedUpdateListener({
      requestHelper: orderFeedUpdateParams.requestHelper,
      uuid: orderFeedUpdateParams.uuid,
      prerequisite: orderFeedUpdateParams.prerequisite,
    });
    const wrappedStage = wrappedStageFn(listenForOrderFeedUpdate);
    const collectOrderFeedUpdate = new OrderFeedUpdateCollector({
      testName: orderFeedUpdateParams.testName,
      prerequisite: wrappedStage,
      getInput: () => ({
        getOrderFromOrderFeedPromise: listenForOrderFeedUpdate.getOutput().getOrderFromOrderFeedPromise,
      }),
      logger: orderFeedUpdateParams.logger,
    });
    return [wrappedStage, collectOrderFeedUpdate];
  },
};

module.exports = {
  OrderFeedUpdateListener,
  OrderFeedUpdateCollector,
  OrderFeedUpdateFlowStageUtils,
};
