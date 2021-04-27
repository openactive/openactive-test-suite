const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'reseller-broker',
  testFeatureImplemented: true,
  testIdentifier: 'customer-not-included-resellerbroker-mode',
  testName: 'Customer not included in Order in ResellerBroker mode',
  testDescription: 'Request shoud succeed if customer is not included in Order in ResellerBroke mode for B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: true,
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
    // Note that we haven't included a noCustomer template for C1 because C1 never has a customer property
    c2ReqTemplateRef: 'noCustomer', bookReqTemplateRef: 'noCustomer', brokerRole: 'https://openactive.io/ResellerBroker',
  });

  describe('Booking should succeed even if Customer is not included in Order, because we are in ResellerBroker mode', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    // Validation for C2 has been skipped below. This because of the following outstanding issues:
    // - Modelling Spec: https://github.com/openactive/modelling-opportunity-data/issues/261
    // - Validator: https://github.com/openactive/data-model-validator/issues/366
    // When these issues are fixed, the line below can be changed to
    // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: true }, c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  });
});
