const { FlowStageUtils, FlowStageRecipes, TestInterfaceActionFlowStage, OrderFeedUpdateFlowStageUtils } = require('../helpers/flow-stages');

/**
 * @typedef {import('../helpers/feature-helper').RunTestsFn} RunTestsFn
 * @typedef {import('../helpers/flow-stages/test-interface-action').TestInterfaceActionType} TestInterfaceActionType
 * @typedef {import('../helpers/flow-stages/b').BFlowStageType} BFlowStageType
 * @typedef {import('../helpers/flow-stages/order-feed-update').OrderFeedUpdateCollectorType} OrderFeedUpdateCollectorType
 * @typedef {import('../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 */

const TestRecipes = {
  /**
   * Flow: FetchOpportunities -> C1 -> C2 -> B -> TestInterfaceAction -> OrderFeedUpdate
   *
   * 1. Make an Order (FetchOpportunities -> C1 -> C2 -> B)
   * 2. Use a TestInterfaceAction to trigger some kind of update to the Order (e.g. access pass update)
   * 3. Expect an update in the Order Feed
   *
   * @param {{
   *   actionType: TestInterfaceActionType,
   * }} testInterfaceActionParams
   * @param {(context: {
   *   b: BFlowStageType,
   *   orderFeedUpdate: OrderFeedUpdateCollectorType,
   *   orderItemCriteriaList: OpportunityCriteria[],
   * }) => void} itAdditionalTestsForOrderFeedUpdate `itAdditionalTests` option
   *   for the `FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid` command that is
   *   called on the orderFeedUpdate FlowStage.
   *   Here, add tests that will be run once the Order Feed Update has been processed.
   *   This function is called with some context, including flow stages, so that their
   *   output can be used in the tests.
   */
  simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2B(testInterfaceActionParams, itAdditionalTestsForOrderFeedUpdate) {
    /** @type {RunTestsFn} */
    const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
      // ## Initiate Flow Stages
      const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);
      const [testInterfaceAction, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
        wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
          ...defaultFlowStageParams,
          testName: `Test Interface Action (${testInterfaceActionParams.actionType})`,
          prerequisite,
          createActionFn: () => ({
            type: testInterfaceActionParams.actionType,
            // Note that these 2 fields may need to be configurable in future:
            objectType: 'Order',
            objectId: b.getOutput().orderId,
          }),
        })),
        orderFeedUpdateParams: {
          ...defaultFlowStageParams,
          prerequisite: b,
          testName: `Orders Feed (after ${testInterfaceActionParams.actionType})`,
        },
      });

      // ## Set up tests
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(testInterfaceAction);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
        itAdditionalTestsForOrderFeedUpdate({
          b, orderFeedUpdate, orderItemCriteriaList,
        });
      });
    };
    return runTestsFn;
  },
};

module.exports = {
  TestRecipes,
};
