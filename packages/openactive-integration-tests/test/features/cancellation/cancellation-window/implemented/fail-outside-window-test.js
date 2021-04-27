const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, CancelOrderFlowStage } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'cancellation-window',
  testFeatureImplemented: true,
  testIdentifier: 'fail-outside-window',
  testName: 'Successful booking and failed cancellation outside window.',
  testDescription: 'A successful end to end booking, but cancellation fails outside the cancellation window.',
  testOpportunityCriteria: 'TestOpportunityBookableCancellableOutsideWindow',
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
    testName: 'Attempt to Cancel OrderItem at Position 0',
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsValid(cancelOrder, () => {
    itShouldReturnAnOpenBookingError('CancellationNotPermittedError', 400, () => cancelOrder.getOutput().httpResponse);
  });
});
