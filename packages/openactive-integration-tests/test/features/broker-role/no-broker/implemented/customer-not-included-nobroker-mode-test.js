const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { runFlowStageAndExpectIncompleteCustomerDetailsError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'no-broker',
  testFeatureImplemented: true,
  testIdentifier: 'customer-not-included-nobroker-mode',
  testName: 'Customer not included in Order in NoBroker mode',
  testDescription: 'Request should fail if customer is not included in Order in NoBroker mode for C2 or B requests.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  describe('Booking should fail if Customer is not included in Order, because we are in NoBroker mode', () => {
    // Note that we ignore testing at C1 because C1 has no customer anyway
    describe('at C2', () => {
      const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow2(orderItemCriteriaList, logger, {
        c1ReqTemplateRef: 'noBroker',
        c2ReqTemplateRef: 'noCustomerAndNoBroker',
        brokerRole: 'https://openactive.io/NoBroker',
        c2ExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      runFlowStageAndExpectIncompleteCustomerDetailsError(c2.getStage('c2'), c2);
    });
    describe('at B or P', () => {
      const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow2(orderItemCriteriaList, logger, {
        c1ReqTemplateRef: 'noBroker',
        c2ReqTemplateRef: 'noBroker',
        bookReqTemplateRef: 'noCustomerAndNoBroker',
        brokerRole: 'https://openactive.io/NoBroker',
        bookExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      runFlowStageAndExpectIncompleteCustomerDetailsError(bookRecipe.firstStage);
    });
  });
});
