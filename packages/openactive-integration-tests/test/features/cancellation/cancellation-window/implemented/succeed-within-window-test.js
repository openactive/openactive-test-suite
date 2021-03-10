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
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { defaultFlowStageParams, fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);
  const cancelOrder = new CancelOrderFlowStage({
    ...defaultFlowStageParams,
    getOrderItemIdArray: CancelOrderFlowStage.getFirstOrderItemIdFromB(b),
    prerequisite: b,
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrder);
});
