const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/b').BFlowStageType} BFlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'multiple-sellers',
  testFeatureImplemented: true,
  testIdentifier: 'conflicting-seller',
  testName: 'SellerMismatchError for inconsistent Sellers of OrderItems',
  testDescription: 'Runs C1, C2 and B where Sellers of OrderItems do not match and check SellerMismatchError is returned in all cases.',
  singleOpportunityCriteriaTemplate: (opportunityType, bookingFlow) => [
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookable',
      sellerCriteria: 'primary',
      bookingFlow,
    },
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookable',
      sellerCriteria: 'secondary',
      bookingFlow,
    },
  ],
  skipMultiple: true,
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  /**
   * @param {C1FlowStageType | C2FlowStageType | BFlowStageType} flowStage
   */
  const itShouldReturnSellerMismatchError = (flowStage) => {
    itShouldReturnAnOpenBookingError('SellerMismatchError', 500, () => flowStage.getOutput().httpResponse);
  };

  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
    itShouldReturnSellerMismatchError(c1);
  });
  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldReturnSellerMismatchError(c2);
  });
  FlowStageUtils.describeRunAndCheckIsValid(b, () => {
    itShouldReturnSellerMismatchError(b);
  });
});
