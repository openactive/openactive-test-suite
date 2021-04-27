const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'restrictions',
  testFeature: 'booking-window',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-in-range-c1-c2',
  testName: 'Running C1 and C2 for opportunity in range should succeed',
  testDescription: 'Booking an opportunity within the specified booking window',
  testOpportunityCriteria: 'TestOpportunityBookableWithinValidFromBeforeStartDate',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: true,
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger);

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
});
