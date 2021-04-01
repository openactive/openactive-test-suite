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
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, {
    c2ReqTemplateRef: 'additionalDetailsSupplied',
    bReqTemplateRef: 'additionalDetailsSupplied',
  });

  // ## Run Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
});
