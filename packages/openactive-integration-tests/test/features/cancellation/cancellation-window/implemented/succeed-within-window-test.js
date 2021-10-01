const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, CancelOrderFlowStage, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { AssertOpportunityCapacityFlowStage } = require('../../../../helpers/flow-stages/assert-opportunity-capacity');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'cancellation-window',
  testFeatureImplemented: true,
  testIdentifier: 'succeed-within-window',
  testName: 'Successful booking and cancellation within window.',
  testDescription: 'A successful end to end booking including cancellation within the cancellation window.',
  testOpportunityCriteria: 'TestOpportunityBookableCancellableWithinWindow',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { defaultFlowStageParams, fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
  const cancel = FlowStageRecipes.runs.cancellation.cancelAndAssertCapacity(bookRecipe.lastStage, defaultFlowStageParams, {
    cancelArgs: {
      getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage),
      testName: 'Cancel OrderItem at Position 0',
    },
    assertOpportunityCapacityArgs: {
      orderItemCriteriaList,
      // Opportunity capacity should have incremented for the Opportunity at Order Item position 0
      getInput: () => ({
        opportunityFeedExtractResponses: bookRecipe.getAssertOpportunityCapacityAfterBook().getOutput().opportunityFeedExtractResponses,
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityCapacityIncrementedForOrderItemPositions([0]),
    },
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancel);
});
