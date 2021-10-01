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
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { defaultFlowStageParams, fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow2(orderItemCriteriaList, logger);
  const cancel = FlowStageRecipes.runs.cancellation.failedCancelAndAssertCapacity(bookRecipe.lastStage, defaultFlowStageParams, {
    fetchOpportunitiesFlowStage: fetchOpportunities,
    lastOpportunityFeedExtractFlowStage: bookRecipe.getAssertOpportunityCapacityAfterBook(),
    cancelArgs: {
      getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage),
      testName: 'Attempt to Cancel OrderItem at Position 0',
    },
    assertOpportunityCapacityArgs: {},
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsValid(cancel, () => {
    itShouldReturnAnOpenBookingError('CancellationNotPermittedError', 400, () => cancel.getStage('cancel').getOutput().httpResponse);
  });
});
