const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

const { IMPLEMENTED_FEATURES } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'non-free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-without-checkpoints',
  testName: 'Successful booking without Checkpoints',
  testDescription: 'Paid Opportunities should be bookable without using Checkpoints C1 & C2 if 1). tax calculations'
    + ' are not performed by the Booking System and 2). they do not require additional details',
  testOpportunityCriteria: 'TestOpportunityBookableNonFree',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  /* This test only works if the Booking System does not have any business-to-consumer tax features enabled.
  If they are not enabled, then this means that, for all bookings, the Booking System does not need to do any
  tax calculations, which means C2 is not needed (C2 returns the result of the Booking System's tax calculations) */
  runOnlyIf: !IMPLEMENTED_FEATURES['business-to-consumer-tax-calculation-gross']
    && !IMPLEMENTED_FEATURES['business-to-consumer-tax-calculation-net'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, opportunityType, bookingFlow) => {
  // Initiate Flow Stages
  const { fetchOpportunities, bookRecipe, defaultFlowStageParams, bookRecipeGetFirstStageInput } = FlowStageRecipes.initialiseSimpleBookOnlyFlow(orderItemCriteriaList, logger);
  const idempotentRepeatB = FlowStageRecipes.idempotentRepeatBAfterBook(bookRecipe, defaultFlowStageParams, {
    getFirstStageInput: bookRecipeGetFirstStageInput,
  });

  // Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  // Remove this condition once https://github.com/openactive/OpenActive.Server.NET/issues/100 is fixed.
  if (bookingFlow === 'OpenBookingApprovalFlow') {
    describe('idempotent repeat B', () => {
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(idempotentRepeatB);
    });
  }
});
