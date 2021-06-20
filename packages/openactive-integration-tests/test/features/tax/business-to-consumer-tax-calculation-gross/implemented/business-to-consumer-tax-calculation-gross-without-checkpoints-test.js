const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-consumer-tax-calculation-gross',
  testFeatureImplemented: true,
  testIdentifier: 'business-to-consumer-tax-calculation-gross-without-checkpoints',
  testName: 'Successful booking without Checkpoints',
  testDescription: 'Business to Consumer bookings with gross tax prices, as they need no tax calculation by the'
    + ' Booking System, and, if they do not require additional details, should be bookable without using Checkpoints'
    + ' C1 & C2',
  testOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxGross',
  // the simple tests can only work if all OrderItems have the same tax mode
  controlOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxGross',
}, (configuration, orderItemCriteriaList, featureIsImplemented, logger, opportunityType, bookingFlow) => {
  const { fetchOpportunities, bookRecipe, defaultFlowStageParams, bookRecipeGetFirstStageInput } = FlowStageRecipes.initialiseSimpleBookOnlyFlow(orderItemCriteriaList, logger);
  const idempotentRepeatB = FlowStageRecipes.idempotentRepeatBAfterBook(bookRecipe, defaultFlowStageParams, {
    getFirstStageInput: bookRecipeGetFirstStageInput,
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  // Remove this condition once https://github.com/openactive/OpenActive.Server.NET/issues/100 is fixed.
  if (bookingFlow === 'OpenBookingApprovalFlow') {
    describe('idempotent repeat B', () => {
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(idempotentRepeatB);
    });
  }
});
