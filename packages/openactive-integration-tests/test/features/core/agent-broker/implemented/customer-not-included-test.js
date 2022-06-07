const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { runFlowStageAndExpectIncompleteCustomerDetailsError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'agent-broker',
  testFeatureImplemented: true,
  testIdentifier: 'customer-not-included',
  testName: 'Customer not included in Order in AgentBroker mode',
  testDescription: 'If customer is not included in Order in AgentBroker mode for C2 or B request, request should fail, returning 400 status code and IncompleteCustomerDetailsError.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  describe('Booking should fail if Customer is not included in Order, because we are in AgentBroker mode', () => {
    // Note that we ignore testing at C1 because C1 has no customer anyway
    describe('at C2', () => {
      const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, {
        c2ReqTemplateRef: 'noCustomer',
        c2ExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      runFlowStageAndExpectIncompleteCustomerDetailsError(c2.getStage('c2'), c2);
    });
    describe('at B or P', () => {
      const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
        bookReqTemplateRef: 'noCustomer',
        bookExpectToFail: true,
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      runFlowStageAndExpectIncompleteCustomerDetailsError(bookRecipe.firstStage);
    });
  });
});
