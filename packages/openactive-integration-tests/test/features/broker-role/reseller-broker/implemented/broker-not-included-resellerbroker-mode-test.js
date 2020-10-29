const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'reseller-broker',
  testFeatureImplemented: true,
  testIdentifier: 'broker-not-included-resellerbroker-mode',
  testName: 'Broker not included in Order in ResellerBroker mode',
  testDescription: 'Request shoud fail if broker is not included in Order in ResellerBroke mode for B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, { bReqTemplateRef: 'noBroker', brokerRole: 'https://openactive.io/ResellerBroker' });

  describe('Booking should fail because Broker is not included in Order in ResellerBroker mode', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsValid(b, () => {
      itShouldReturnAnOpenBookingError('IncompleteBrokerDetailsError', 400, () => b.getOutput().httpResponse);
    });
  });
});
