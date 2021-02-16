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
  testDescription: 'ChangeOfLogisticsSimulateAction triggered after B request to update name, time, or location properties of Opportunity.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // It is not possible to run multiple OrderItem tests for this due to (https://github.com/openactive/openactive-test-suite/issues/312)
  skipMultiple: true,
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  describe('ChangeOfLogisticsTimeSimulateAction triggered in the Opportunity (eg startDate)', () => {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);
    const [simulateChangeOfLogisticsUpdate, opportunityFeedUpdate] = OpportunityFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
        ...defaultFlowStageParams,
        testName: 'TestInterfaceAction (test:ChangeOfLogisticsTimeSimulateAction)',
        prerequisite,
        createActionFn: () => ({
          type: 'test:ChangeOfLogisticsTimeSimulateAction',
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
        testName: 'Opportunity Feed Update (after test:ChangeOfLogisticsTimeSimulateAction)',
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

  describe('ChangeOfLogisticsNameSimulateAction triggered in the Opportunity', () => {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);
    const [simulateChangeOfLogisticsUpdate, opportunityFeedUpdate] = OpportunityFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
        ...defaultFlowStageParams,
        testName: 'TestInterfaceAction (test:ChangeOfLogisticsNameSimulateAction)',
        prerequisite,
        createActionFn: () => ({
          type: 'test:ChangeOfLogisticsNameSimulateAction',
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
        testName: 'Opportunity Feed Update (after test:ChangeOfLogisticsNameSimulateAction)',
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

  describe('ChangeOfLogisticsLocationSimulateAction triggered in the Opportunity', () => {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);
    const [simulateChangeOfLogisticsUpdate, opportunityFeedUpdate] = OpportunityFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
        ...defaultFlowStageParams,
        testName: 'TestInterfaceAction (test:ChangeOfLogisticsLocationSimulateAction)',
        prerequisite,
        createActionFn: () => ({
          type: 'test:ChangeOfLogisticsLocationSimulateAction',
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
        testName: 'Opportunity Feed Update (after test:ChangeOfLogisticsLocationSimulateAction)',
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
