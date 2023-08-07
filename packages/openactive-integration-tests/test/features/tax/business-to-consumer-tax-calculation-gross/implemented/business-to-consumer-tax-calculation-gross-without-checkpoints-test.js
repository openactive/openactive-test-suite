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
}, (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const { fetchOpportunities, bookRecipe, defaultFlowStageParams, bookRecipeGetFirstStageInput, bookRecipeGetAssertOpportunityCapacityInput } = FlowStageRecipes.initialiseSimpleBookOnlyFlow(orderItemCriteriaList, logger);
  const idempotentRepeatB = FlowStageRecipes.idempotentRepeatBAfterBook(orderItemCriteriaList, bookRecipe, defaultFlowStageParams, {
    getFirstStageInput: bookRecipeGetFirstStageInput,
    getAssertOpportunityCapacityInput: bookRecipeGetAssertOpportunityCapacityInput,
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  describe('idempotent repeat B', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(idempotentRepeatB);
  });
});
