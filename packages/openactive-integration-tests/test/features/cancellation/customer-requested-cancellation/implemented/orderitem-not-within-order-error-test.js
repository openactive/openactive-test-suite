const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');
const { CancelOrderFlowStage, FlowStageUtils, FlowStageRecipes } = require('../../../../helpers/flow-stages');
const { generateUuid } = require('../../../../helpers/generate-uuid');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'orderitem-not-within-order-error',
  testName: 'Expect a OrderItemNotWithinOrderError for an Order that does not exist',
  testDescription: 'Runs Order Cancellation for a non-existent Order (with a fictional UUID), but real OrderItem, expecting an OrderItemNotWithinOrderError error to be returned',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableCancellable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
  const cancelUnknownOrder = new CancelOrderFlowStage({
    ...defaultFlowStageParams,
    uuid: generateUuid(), // Random unknown Order GUID
    getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage),
    prerequisite: bookRecipe.b,
    testName: 'Attempt to Cancel OrderItem at Position 0 using random Order UUID',
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsValid(cancelUnknownOrder, () => {
    itShouldReturnAnOpenBookingError('OrderItemNotWithinOrderError', 500, () => cancelUnknownOrder.getOutput().httpResponse);
  });
});
