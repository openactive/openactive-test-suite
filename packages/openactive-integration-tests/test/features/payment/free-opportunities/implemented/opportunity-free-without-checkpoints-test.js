const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free-without-checkpoints',
  testName: 'Successful booking without Checkpoints',
  testDescription: 'Free Opportunities, as they need no tax calculation, and, if they do not require additional details,'
    + ' should be bookable without using Checkpoints C1 & C2',
  testOpportunityCriteria: 'TestOpportunityBookableFree',
  // This must also be TestOpportunityBookableFree as the entire Order must be free.
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
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
