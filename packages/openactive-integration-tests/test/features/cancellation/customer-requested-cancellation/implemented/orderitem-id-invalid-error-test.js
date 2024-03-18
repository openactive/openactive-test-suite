const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');
const { CancelOrderFlowStage, FlowStageUtils, FlowStageRecipes } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'orderitem-id-invalid-error',
  testName: 'Expect a OrderItemIdInvalidError for an Order that does not exist',
  testDescription: 'Runs Order Cancellation for a non-existent invalid OrderItem, but real Order, expecting an OrderItemIdInvalidError error to be returned',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableCancellable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, describeFeatureRecord);
  const cancelUnknownOrder = FlowStageRecipes.runs.customerCancel.failedCancelAndAssertCapacity(bookRecipe.lastStage, defaultFlowStageParams, {
    fetchOpportunitiesFlowStage: fetchOpportunities,
    lastOpportunityFeedExtractFlowStage: bookRecipe.getAssertOpportunityCapacityAfterBook(),
    cancelArgs: {
      getOrderItemIdArray: () => CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage)().map(x => `${x}-0-`),
      testName: 'Attempt to Cancel OrderItem at Position 0 using invalid OrderItem @id',
    },
    assertOpportunityCapacityArgs: {},
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsValid(cancelUnknownOrder, () => {
    itShouldReturnAnOpenBookingError('OrderItemIdInvalidError', 500, () => cancelUnknownOrder.getStage('cancel').getOutput().httpResponse);
  });
});
