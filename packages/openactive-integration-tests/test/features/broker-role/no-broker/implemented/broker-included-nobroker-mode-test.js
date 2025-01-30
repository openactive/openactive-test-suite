const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { runFlowStageAndExpectIncompleteBrokerDetailsError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'no-broker',
  testFeatureImplemented: true,
  testIdentifier: 'broker-included-nobroker-mode',
  testName: 'Broker included in Order in NoBroker mode',
  testDescription: 'Request shoud fail if broker is included in Order in NoBroker mode for C1, C2 & B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) {
  describe('Booking should fail because Broker is included in Order in NoBroker mode', () => {
    describe('at C1', () => {
      // broker is included, by default, in C1 request
      const { fetchOpportunities, c1 } = FlowStageRecipes.initialiseSimpleC1Flow(orderItemCriteriaList, logger, describeFeatureRecord, {
        brokerRole: 'https://openactive.io/NoBroker',
        c1ExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      runFlowStageAndExpectIncompleteBrokerDetailsError(c1.getStage('c1'), c1);
    });
    describe('at C2', () => {
      // broker is included, by default, in C2 request
      const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, describeFeatureRecord, {
        brokerRole: 'https://openactive.io/NoBroker',
        c1ReqTemplateRef: 'noBroker',
        c2ExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      runFlowStageAndExpectIncompleteBrokerDetailsError(c2.getStage('c2'), c2);
    });
    describe('at B or P', () => {
      // broker is included, by default, in B or P request
      const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, describeFeatureRecord, {
        brokerRole: 'https://openactive.io/NoBroker',
        c1ReqTemplateRef: 'noBroker',
        c2ReqTemplateRef: 'noBroker',
        bookExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      runFlowStageAndExpectIncompleteBrokerDetailsError(bookRecipe.firstStage);
    });
  });
});
