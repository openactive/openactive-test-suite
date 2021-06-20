const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');
const { FlowStageRecipes, FlowStageUtils, CancelOrderFlowStage } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'patch-contains-excessive-properties-error',
  testName: 'Successful booking and unsuccessful cancellation due to PatchContainsExcessivePropertiesError',
  testDescription: 'PatchContainsExcessivePropertiesError returned because patch request includes other properties than @type, @context, orderProposalStatus and orderCustomerNote',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableCancellable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
  const cancelOrder = new CancelOrderFlowStage({
    ...defaultFlowStageParams,
    getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage),
    prerequisite: bookRecipe.lastStage,
    testName: 'Attempt to Cancel OrderItem at Position 0',
    templateRef: 'excessiveProperties',
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsValid(cancelOrder, () => {
    itShouldReturnAnOpenBookingError('PatchContainsExcessivePropertiesError', 400, () => cancelOrder.getOutput().httpResponse);
  });
});
