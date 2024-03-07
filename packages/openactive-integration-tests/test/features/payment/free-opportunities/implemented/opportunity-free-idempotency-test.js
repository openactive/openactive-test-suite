const { omit } = require('lodash');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { Common } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free-idempotency',
  testName: 'Successful booking of free opportunity with idempotency',
  testDescription: 'Testing idempotency of the B call for free opportunities',
  testOpportunityCriteria: 'TestOpportunityBookableFree',
  // This must also be TestOpportunityBookableFree as the entire Order must be free.
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
}, (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const {
    fetchOpportunities,
    bookRecipe,
    defaultFlowStageParams,
    bookRecipeArgs,
  } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
  const idempotentRepeatB = FlowStageRecipes.idempotentRepeatBAfterBook(
    orderItemCriteriaList,
    bookRecipe,
    defaultFlowStageParams,
    omit(bookRecipeArgs, ['prerequisite']),
  );
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  describe('idempotent repeat B', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(idempotentRepeatB, () => {
      Common.itIdempotentBShouldHaveOutputEqualToFirstB(bookRecipe.b, idempotentRepeatB);
    });
  });
});
