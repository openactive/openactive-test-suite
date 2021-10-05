const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'no-broker',
  testFeatureImplemented: true,
  testIdentifier: 'customer-included-nobroker-mode',
  testName: 'Customer included in Order in NoBroker mode',
  testDescription: 'Request shoud succeed if broker is excluded and customer is included in Order in NoBroker mode for C1, C2 & B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow2(orderItemCriteriaList, logger, {
    c1ReqTemplateRef: 'noBroker', c2ReqTemplateRef: 'noBroker', bookReqTemplateRef: 'noBroker', brokerRole: 'https://openactive.io/NoBroker',
  });

  describe('In NoBroker mode, booking should succeed if Broker is excluded if Customer is included in Order', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  });
});
