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
   * Flow: FetchOpportunities -> C1 -> C2 -> Book -> TestInterfaceAction -> OrderFeedUpdate
   *
   * 1. Make an Order (FetchOpportunities -> C1 -> C2 -> Book)
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
  simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2Book(testInterfaceActionParams, itAdditionalTestsForOrderFeedUpdate) {
    /** @type {RunTestsFn} */
    const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
      // ## Initiate Flow Stages
      const {
        fetchOpportunities,
        c1,
        c2,
        bookRecipe,
        testInterfaceAction,
        orderFeedUpdate,
      } = FlowStageRecipes.successfulC1C2BookFollowedByTestInterfaceAction(orderItemCriteriaList, logger, testInterfaceActionParams);

      // ## Set up tests
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(testInterfaceAction);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
        itAdditionalTestsForOrderFeedUpdate({
          orderFeedUpdate,
          orderItemCriteriaList,
          b: bookRecipe.b,
        });
      });
    };
    return runTestsFn;
  },

  /**
   * Flow: FetchOpportunities -> C1 -> C2 -> Book -> TestInterfaceAction -> OrderFeedUpdate
   *
   * 1. Make an Order (FetchOpportunities -> C1 -> C2 -> Book)
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
  simulateChangeOfLogisticsActionAndExpectOrderFeedUpdateAfterSimpleC1C2Book(testInterfaceActionParams, itAdditionalTestsForOrderFeedUpdate) {
    /** @type {RunTestsFn} */
    const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
      // ## Initiate Flow Stages
      const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
      const [testInterfaceAction, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
        wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
          ...defaultFlowStageParams,
          testName: `Test Interface Action (${testInterfaceActionParams.actionType})`,
          prerequisite,
          createActionFn: () => ({
            type: testInterfaceActionParams.actionType,
            // Note that these 2 fields may need to be configurable in future:
            objectType: fetchOpportunities.getOutput().orderItems[0].orderedItem['@type'],
            objectId: fetchOpportunities.getOutput().orderItems[0].orderedItem['@id'],
          }),
        })),
        orderFeedUpdateParams: {
          ...defaultFlowStageParams,
          prerequisite: bookRecipe.lastStage,
          testName: `Orders Feed (after ${testInterfaceActionParams.actionType})`,
        },
      });

      // ## Set up tests
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(testInterfaceAction);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
        itAdditionalTestsForOrderFeedUpdate({
          orderFeedUpdate,
          orderItemCriteriaList,
          b: bookRecipe.b,
        });
      });
    };
    return runTestsFn;
  },
};

module.exports = {
  TestRecipes,
};
