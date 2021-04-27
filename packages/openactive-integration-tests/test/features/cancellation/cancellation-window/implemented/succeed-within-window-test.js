const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, CancelOrderFlowStage, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'cancellation-window',
  testFeatureImplemented: true,
  testIdentifier: 'succeed-within-window',
  testName: 'Successful booking and cancellation within window.',
  testDescription: 'A successful end to end booking including cancellation within the cancellation window.',
  testOpportunityCriteria: 'TestOpportunityBookableCancellableWithinWindow',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: false, // https://github.com/openactive/OpenActive.Server.NET/issues/120
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { defaultFlowStageParams, fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
  const cancelOrder = new CancelOrderFlowStage({
    ...defaultFlowStageParams,
    getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage),
    prerequisite: bookRecipe.b,
    testName: 'Cancel OrderItem at Position 0',
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrder);
});
