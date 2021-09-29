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
  // TODO TODO TODO remove
  skipMultiple: true,
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { defaultFlowStageParams, fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
  const cancel = FlowStageRecipes.runs.cancellation.successfulStandaloneCancelAndAssertCapacity(bookRecipe.lastStage, defaultFlowStageParams, {
    cancelArgs: {
      getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage),
      testName: 'Cancel OrderItem at Position 0',
    },
    assertOpportunityCapacityArgs: {
      orderItemCriteriaList,
      /* Opportunity capacity should be unchanged since the initial fetch as the reduced capacity should be increased
      now that the cancellation is complete. */
      getInput: () => fetchOpportunities.getOutput(),
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity,
    },
  });
  // const cancelOrder = new CancelOrderFlowStage({
  //   ...defaultFlowStageParams,
  //   getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage),
  //   prerequisite: bookRecipe.lastStage,
  //   testName: 'Cancel OrderItem at Position 0',
  // });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancel);
});
