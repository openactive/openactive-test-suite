const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { runFlowStageAndExpectIncompleteCustomerDetailsError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'no-broker',
  testFeatureImplemented: true,
  testIdentifier: 'customer-not-included-nobroker-mode',
  testName: 'Customer not included in Order in NoBroker mode',
  testDescription: 'Request shoud fail if customer is not included in Order in NoBroker mode for C2 & B requests.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  describe('Booking should fail even if Customer is not included in Order, because we are in NoBroker mode', () => {
    // Note that we ignore testing at C1 because C1 has no customer anyway
    describe('at C2', () => {
      const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, {
        c1ReqTemplateRef: 'noBroker', c2ReqTemplateRef: 'noCustomerAndNoBroker', brokerRole: 'https://openactive.io/NoBroker',
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      runFlowStageAndExpectIncompleteCustomerDetailsError(c2);
    });
    describe('at B', () => {
      const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, {
        c1ReqTemplateRef: 'noBroker', c2ReqTemplateRef: 'noBroker', bReqTemplateRef: 'noCustomerAndNoBroker', brokerRole: 'https://openactive.io/NoBroker',
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      runFlowStageAndExpectIncompleteCustomerDetailsError(b);
    });
  });
});
