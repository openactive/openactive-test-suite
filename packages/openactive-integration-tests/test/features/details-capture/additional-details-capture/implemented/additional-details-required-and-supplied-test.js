const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-and-supplied',
  testName: 'Booking opportunity with additional details supplied and included',
  testDescription: 'Should pass',
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Initialize Flow Stages
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, {
    c1ReqTemplateRef: 'additionalDetailsRequiredAndSupplied',
    c2ReqTemplateRef: 'additionalDetailsRequiredAndSupplied',
    bReqTemplateRef: 'additionalDetailsRequiredAndSupplied',
  });

  // ## Run Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);

  // Change the below to `FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1)` etc when
  // https://github.com/openactive/data-model-validator/issues/367 is fixed in the validator
  FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: true }, c1);
  FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: true }, c2);
  FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: true }, b);
});
