const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageRecipes,
  FlowStageUtils,
  TestInterfaceActionFlowStage,
  OpportunityFeedUpdateFlowStageUtils,
} = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'notifications',
  testFeature: 'change-of-logistics-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'change-of-logistics-notifications',
  testName: 'Updating logistics information in after B request.',
  testDescription: 'ChangeOfLogisticsSimulateAction triggered after B request to update name, startDate, endDate, duration or location properties of Opportunity.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // It is not possible to run multiple OrderItem tests for this due to (https://github.com/openactive/openactive-test-suite/issues/312)
  skipMultiple: true,
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  describe.skip('ChangeOfLogisticsSimulateAction triggered in the child Event (Slot or ScheduledSession) (eg startDate)', () => {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);
    const [simulateChangeOfLogisticsUpdate, opportunityFeedUpdate] = OpportunityFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
        ...defaultFlowStageParams,
        testName: 'TestInterfaceAction (test:ChangeOfLogisticsSimulateAction)',
        prerequisite,
        createActionFn: () => ({
          type: 'test:ChangeOfLogisticsSimulateAction',
          objectType: fetchOpportunities.getOutput().orderItems[0].orderedItem['@type'],
          objectId: fetchOpportunities.getOutput().orderItems[0].orderedItem['@id'],
        }),
      })),
      opportunityFeedUpdateParams: {
        ...defaultFlowStageParams,
        prerequisite: b,
        getInput: () => ({
          testInterfaceOpportunities: fetchOpportunities.getOutput().testInterfaceOpportunities,
        }),
        orderItemCriteriaList,
        testName: 'Opportunity Feed Update (after test:ChangeOfLogisticsSimulateAction)',
        // The Broker needs to notify the Customer if any Opportunity in their Order has
        // changed (rather than all Opportunities in the Order). So, we expect the
        // ChangeOfLogisticsSimulateAction could be implemented in such a way as to only
        // update one item. Hence, wait-for-one.
        waitMode: 'wait-for-one',
      },
    });

    // ## Set up tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateChangeOfLogisticsUpdate);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(opportunityFeedUpdate);
  });

  describe('ChangeOfLogisticsSimulateAction triggered in the parent Event (FacilityUse or SessionSeries) (eg name)', () => {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);
    const [simulateChangeOfLogisticsUpdate, opportunityFeedUpdate] = OpportunityFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
        ...defaultFlowStageParams,
        testName: 'TestInterfaceAction (test:ChangeOfLogisticsSimulateAction)',
        prerequisite,
        createActionFn: () => ({
          type: 'test:ChangeOfLogisticsSimulateAction',
          objectType: fetchOpportunities.getOutput().orderItems[0].orderedItem.superEvent
            ? fetchOpportunities.getOutput().orderItems[0].orderedItem.superEvent['@type']
            : fetchOpportunities.getOutput().orderItems[0].orderedItem.faciltyUse['@type'],
          objectId: fetchOpportunities.getOutput().orderItems[0].orderedItem.superEvent
            ? fetchOpportunities.getOutput().orderItems[0].orderedItem.superEvent['@id']
            : fetchOpportunities.getOutput().orderItems[0].orderedItem.faciltyUse['@id'],
        }),
      })),
      opportunityFeedUpdateParams: {
        ...defaultFlowStageParams,
        prerequisite: b,
        getInput: () => ({
          testInterfaceOpportunities: fetchOpportunities.getOutput().testInterfaceOpportunities,
        }),
        orderItemCriteriaList,
        testName: 'Opportunity Feed Update (after test:ChangeOfLogisticsSimulateAction)',
        // The Broker needs to notify the Customer if any Opportunity in their Order has
        // changed (rather than all Opportunities in the Order). So, we expect the
        // ChangeOfLogisticsSimulateAction could be implemented in such a way as to only
        // update one item. Hence, wait-for-one.
        waitMode: 'wait-for-one',
      },
    });

    // ## Set up tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateChangeOfLogisticsUpdate);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(opportunityFeedUpdate);
  });
});
