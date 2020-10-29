const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'no-broker',
  testFeatureImplemented: true,
  testIdentifier: 'broker-included-nobroker-mode',
  testName: 'Broker included in Order in NoBroker mode',
  testDescription: 'Request shoud fail if broker is included in Order in NoBroker mode for B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, { brokerRole: 'https://openactive.io/NoBroker' });

  describe('Booking should fail because Broker is included in Order in NoBroker mode', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsValid(b, () => {
      itShouldReturnAnOpenBookingError('IncompleteBrokerDetailsError', 400, () => b.getOutput().httpResponse);
    });
  });
});
