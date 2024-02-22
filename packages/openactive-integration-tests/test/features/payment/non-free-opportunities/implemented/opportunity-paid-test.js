const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'non-free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Successful booking with payment property',
  testDescription: 'A successful end to end booking of a non-free opportunity with the `payment` property included if required.',
  testOpportunityCriteria: 'TestOpportunityBookableNonFree',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipMultiple: true,
  skipOpportunityTypes: ['ScheduledSession'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  // Note this will automatically determine whether payment is available (e.g. in the case of openBookingPrepayment == 'https://openactive.io/Unavailable)
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
});
