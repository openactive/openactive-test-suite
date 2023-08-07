const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'non-free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-idempotency',
  testName: 'Successful booking of paid opportunity with idempotency',
  testDescription: 'Testing idempotency of the B call for paid opportunities',
  testOpportunityCriteria: 'TestOpportunityBookableNonFree',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // Initiate Flow Stages
  const { fetchOpportunities, bookRecipe, defaultFlowStageParams, bookRecipeGetFirstStageInput, bookRecipeGetAssertOpportunityCapacityInput } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
  const idempotentRepeatB = FlowStageRecipes.idempotentRepeatBAfterBook(orderItemCriteriaList, bookRecipe, defaultFlowStageParams, {
    getFirstStageInput: bookRecipeGetFirstStageInput,
    getAssertOpportunityCapacityInput: bookRecipeGetAssertOpportunityCapacityInput,
  });

  // Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  describe('idempotent repeat B', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(idempotentRepeatB);
  });
});
