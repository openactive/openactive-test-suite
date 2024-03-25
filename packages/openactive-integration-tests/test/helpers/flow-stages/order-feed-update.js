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
 * @typedef {'orders' | 'order-proposals'} OrderFeedType
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
 * @param {OrderFeedType} args.orderFeedType
 * @param {() => boolean} args.failEarlyIf
 * @returns {Promise<ListenerOutput>}
 */
async function runOrderFeedListener({ uuid, requestHelper, orderFeedType, failEarlyIf }) {
  // If a previous stage has failed, don't bother listening for the expected feed update.
  if (failEarlyIf()) {
    throw new Error('failing early as a previous stage failed');
  }
  /* TODO allow specification of bookingPartnerIdentifier. Currently we don't
  have any Order Feed Update tests which need to test anything other than the
  primary bookingPartnerIdentifier so this hasn't yet been required. */
  await requestHelper.postOrderFeedChangeListener(orderFeedType, 'primary', uuid);
  return {};
}

/**
 * @param {object} args
 * @param {string} args.uuid
 * @param {RequestHelperType} args.requestHelper
 * @param {OrderFeedType} args.orderFeedType
 * @param {() => boolean} args.failEarlyIf
 * @returns {Promise<CollectorOutput>}
 */
async function runOrderFeedCollector({ uuid, requestHelper, orderFeedType, failEarlyIf }) {
  if (failEarlyIf()) {
    throw new Error('failing early as a previous stage failed');
  }
  /* TODO allow specification of bookingPartnerIdentifier. Currently we don't
  have any Order Feed Update tests which need to test anything other than the
  primary bookingPartnerIdentifier so this hasn't yet been required. */
  const response = await requestHelper.getOrderFeedChangeCollection(orderFeedType, 'primary', uuid);
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
   * @param {OrderFeedType} args.orderFeedType
   * @param {() => boolean} args.failEarlyIf
   */
  constructor({ prerequisite, uuid, requestHelper, orderFeedType, failEarlyIf }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName: '_Order Feed Update Listener',
      shouldDescribeFlowStage: false,
      async runFn() {
        return await runOrderFeedListener({
          uuid,
          requestHelper,
          orderFeedType,
          failEarlyIf,
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
   * @param {OrderFeedType} args.orderFeedType
   * @param {() => boolean} args.failEarlyIf
   */
  constructor({ testName, prerequisite, logger, uuid, requestHelper, orderFeedType, failEarlyIf }) {
    super({
      prerequisite,
      getInput: FlowStageUtils.emptyGetInput,
      testName,
      async runFn() {
        return await runOrderFeedCollector({
          uuid,
          requestHelper,
          orderFeedType,
          failEarlyIf,
        });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'OrderFeed',
        validationMode: orderFeedType === 'orders' ? 'OrdersFeed' : 'OrderProposalsFeed',
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
   * N.B. The Order Collector will fail early if the wrapped stage has an `httpResponse` with non-2xx status code.
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
   * @param {OrderFeedType} [args.orderFeedUpdateParams.orderFeedType] Defaults to `orders`
   * @param {FlowStage<unknown, unknown>} [args.orderFeedUpdateParams.prerequisite]
   *   Prerequisite for the OrderFeedUpdateListener.
   * @param {string} args.orderFeedUpdateParams.testName Name for the OrderFeedUpdateCollector
   *   flow stage. A flow can have multiple OrderFeedUpdateCollectors, so its helpful
   *   to give them individual names, to make the test logs clearer.
   * @param {RequestHelperType} args.orderFeedUpdateParams.requestHelper
   * @param {BaseLoggerType} args.orderFeedUpdateParams.logger
   * @param {string} args.orderFeedUpdateParams.uuid
   * @param {() => boolean} [args.orderFeedUpdateParams.failEarlyIf] There's no point waiting for an Order Feed update that's never going
   *   to come. If a previous stage, which is supposed to have prompted an Order Feed update (e.g. a cancellation)
   *   then we want the Order Feed update to immediately fail. Otherwise it will wait and wait, which will last until
   *   the Jest timeout, leading to a frustrating experience for test runners.
   *
   *   Set `failEarlyIf` to a function that returns `true` if the Order Feed update should fail early.
   *
   *   Generally, this will be something like `failEarlyIf: () => p.getOutput().httpResponse.response.statusCode >= 400`.
   *
   *   Defaults to () => false (i.e. do not fail early).
   * @returns {[wrappedStage: TWrappedFlowStage, orderFeedUpdateCollector: OrderFeedUpdateCollector]}
   */
  wrap({ wrappedStageFn, orderFeedUpdateParams }) {
    const failEarlyIf = orderFeedUpdateParams.failEarlyIf ?? (() => false);
    const orderFeedType = orderFeedUpdateParams.orderFeedType ?? 'orders';
    const listenForOrderFeedUpdate = new OrderFeedUpdateListener({
      requestHelper: orderFeedUpdateParams.requestHelper,
      uuid: orderFeedUpdateParams.uuid,
      prerequisite: orderFeedUpdateParams.prerequisite,
      orderFeedType,
      failEarlyIf,
    });
    const wrappedStage = wrappedStageFn(listenForOrderFeedUpdate);
    const collectOrderFeedUpdate = new OrderFeedUpdateCollector({
      testName: orderFeedUpdateParams.testName,
      prerequisite: wrappedStage,
      requestHelper: orderFeedUpdateParams.requestHelper,
      uuid: orderFeedUpdateParams.uuid,
      logger: orderFeedUpdateParams.logger,
      orderFeedType,
      failEarlyIf: () => {
        if (failEarlyIf()) { return true; }
        // Don't bother collecting if the wrapped stage fails.
        if ((wrappedStage.getOutput()?.httpResponse?.response?.statusCode ?? 200) >= 400) { return true; }
        return false;
      },
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
