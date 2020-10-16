const { FlowStage } = require('./flow-stage');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */

/**
 * This actually contains 2 Flow Stages - an Initiator and a Collector.
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
 * 1. Order Feed Update Initiator
 * 2. {A FlowStage which instructs the Booking System to update its Order Feed e.g. Cancellation}
 * 3. Order Feed Update Collector
 */
const OrderFeedUpdateFlowStage = {
  /**
   * FlowStage which initiates the checking for Order Feed Updates.
   *
   * @param {object} args
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   */
  createInitiator({ prerequisite, requestHelper }) {
    return new FlowStage({
      prerequisite,
      testName: '_Order Feed Update Initiator',
      shouldDescribeFlowStage: false,
      async runFn(flowStage) {
        const { uuid } = flowStage.getPrerequisiteCombinedStateAssertFields(['uuid']);
        return OrderFeedUpdateFlowStage.runInitiator({ uuid, requestHelper });
      },
      itSuccessChecksFn() { /* there are no success checks - these happen at the OrderFeedUpdate stage */ },
      itValidationTestsFn() { /* there are no validation tests - validation happens at the OrderFeedUpdate stage */ },
    });
  },

  /**
   * @param {object} args
   * @param {string} args.uuid
   * @param {RequestHelperType} args.requestHelper
   * @returns {import('./flow-stage').FlowStageOutput<Promise<ChakramResponse>>}
   */
  runInitiator({ uuid, requestHelper }) {
    // Note that the promise isn't awaited.
    // This won't resolve until a stage is run that will instruct the Booking System
    // to put the order into their feed.
    const getOrderPromise = requestHelper.getOrder(uuid);
    return {
      result: {
        status: 'response-received',
        response: getOrderPromise,
      },
      state: {
        getOrderFromOrderFeedPromise: getOrderPromise,
      },
    };
  },

  /**
   * FlowStage which collects the results from an initiated Order Feed Update.
   *
   * This stage must come after a Order Feed update initiator stage (@see OrderFeedUpdateFlowStage.createInitiator).
   *
   * @param {object} args
   * @param {string} args.testName
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {BaseLoggerType} args.logger
   */
  createCollector({ testName, prerequisite, logger }) {
    return new FlowStage({
      prerequisite,
      testName,
      async runFn(flowStage) {
        const { getOrderFromOrderFeedPromise } = flowStage.getPrerequisiteCombinedStateAssertFields(['getOrderFromOrderFeedPromise']);
        return await OrderFeedUpdateFlowStage.runCollector({ getOrderFromOrderFeedPromise });
      },
      itSuccessChecksFn: FlowStageUtils.simpleHttp200SuccessChecks(),
      itValidationTestsFn: FlowStageUtils.simpleValidationTests(logger, {
        name: 'OrderFeed',
        validationMode: 'OrdersFeed',
      }),
    });
  },

  /**
   * @param {object} args
   * @param {Promise<ChakramResponse>} args.getOrderFromOrderFeedPromise
   * @returns {Promise<import('./flow-stage').FlowStageOutput<ChakramResponse>>}
   */
  async runCollector({ getOrderFromOrderFeedPromise }) {
    const response = await getOrderFromOrderFeedPromise;

    // TODO TODO: Should this also update the bookingSystemOrder state?
    return {
      result: {
        response,
        status: 'response-received',
      },
    };
  },
};

module.exports = {
  OrderFeedUpdateFlowStage,
};
