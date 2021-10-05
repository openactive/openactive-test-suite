const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { runFlowStageAndExpectIncompleteBrokerDetailsError } = require('../../../../shared-behaviours/errors');

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
  describe('Booking should fail because Broker is not included in Order in ResellerBroker mode', () => {
    describe('at C1', () => {
      const { fetchOpportunities, c1 } = FlowStageRecipes.initialiseSimpleC1Flow(orderItemCriteriaList, logger, {
        c1ReqTemplateRef: 'noBroker',
        brokerRole: 'https://openactive.io/ResellerBroker',
        c1ExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      runFlowStageAndExpectIncompleteBrokerDetailsError(c1.getStage('c1'), c1);
    });
    describe('at C2', () => {
      const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow2(orderItemCriteriaList, logger, {
        c2ReqTemplateRef: 'noBroker',
        brokerRole: 'https://openactive.io/ResellerBroker',
        c2ExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      runFlowStageAndExpectIncompleteBrokerDetailsError(c2.getStage('c2'), c2);
    });
    describe('at B or P', () => {
      const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow2(orderItemCriteriaList, logger, {
        bookReqTemplateRef: 'noBroker',
        brokerRole: 'https://openactive.io/ResellerBroker',
        bookExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      runFlowStageAndExpectIncompleteBrokerDetailsError(bookRecipe.firstStage);
    });
  });
});
