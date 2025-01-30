const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'reseller-broker',
  testFeatureImplemented: true,
  testIdentifier: 'customer-not-included-resellerbroker-mode',
  testName: 'Customer not included in Order in ResellerBroker mode',
  testDescription: 'Request should succeed if customer is not included in Order in ResellerBroke mode for B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) {
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, describeFeatureRecord, {
    // Note that we haven't included a noCustomer template for C1 because C1 never has a customer property
    c2ReqTemplateRef: 'noCustomer', bookReqTemplateRef: 'noCustomer', brokerRole: 'https://openactive.io/ResellerBroker',
  });

  describe('Booking should succeed even if Customer is not included in Order, because we are in ResellerBroker mode', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  });
});
