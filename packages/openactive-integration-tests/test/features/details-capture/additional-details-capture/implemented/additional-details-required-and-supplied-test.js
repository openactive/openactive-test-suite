const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-and-supplied',
  testName: 'Booking opportunity with additional details supplied',
  testDescription: 'Should pass',
  testOpportunityCriteria: 'TestOpportunityBookableAdditionalDetails',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Initialize Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow2(orderItemCriteriaList, logger, {
    c2ReqTemplateRef: 'additionalDetailsSupplied',
    bookReqTemplateRef: 'additionalDetailsSupplied',
  });

  // ## Run Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
});
