const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FetchOpportunitiesFlowStage,
  FlowStageUtils,
} = require('../../../../helpers/flow-stages');

const { USE_RANDOM_OPPORTUNITIES } = global;

// Only run this test if the test interface is in use
FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'test-interface',
  testFeatureImplemented: true,
  testIdentifier: 'create-opportunity',
  testName: 'Create opportunity',
  testDescription: 'Creates an opportunity using the booking system\'s test interface, and validates the resulting feed item matches the criteria.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  skipMultiple: true,
  runOnlyIf: !USE_RANDOM_OPPORTUNITIES,
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger });
  const fetchOpportunities = new FetchOpportunitiesFlowStage({
    ...defaultFlowStageParams,
    orderItemCriteriaList,
  });

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
});
