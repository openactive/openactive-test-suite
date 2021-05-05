const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'agent-broker',
  testFeatureImplemented: true,
  testIdentifier: 'customer-included',
  testName: 'Successful request when customer is included in Order in AgentBroker mode',
  testDescription: 'Successful request when customer is included in Order in AgentBroker mode',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
    brokerRole: 'https://openactive.io/AgentBroker',
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
});
