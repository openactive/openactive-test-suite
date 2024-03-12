const { FeatureHelper, createDefaultMultipleOpportunityCriteriaTemplateFn } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const RequestHelper = require('../../../../helpers/request-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/b').BFlowStageType} BFlowStageType
 * @typedef {import('../../../../helpers/flow-stages/p').PFlowStageType} PFlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'multiple-sellers',
  testFeatureImplemented: true,
  testIdentifier: 'seller-access-restricted-by-auth',
  testName: 'Credentials for Seller (a) must not provide access to make bookings for Seller (b)',
  testDescription: 'Using primary seller auth, make a call to C1, C2, and P/B for the secondary seller, expecting all calls to fail with InvalidAuthorizationDetailsError',
  singleOpportunityCriteriaTemplate: (opportunityType, bookingFlow) => [
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookable',
      sellerCriteria: 'secondary',
      bookingFlow,
    },
  ],
  multipleOpportunityCriteriaTemplate: createDefaultMultipleOpportunityCriteriaTemplateFn({
    testOpportunityCriteria: 'TestOpportunityBookable',
    controlOpportunityCriteria: 'TestOpportunityBookable',
    sellerCriteria: 'secondary',
  }),
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
  /**
   * @param {C1FlowStageType | C2FlowStageType | BFlowStageType | PFlowStageType} flowStage
   */
  const itShouldReturnInvalidAuthorizationDetailsError = (flowStage) => {
    itShouldReturnAnOpenBookingError('InvalidAuthorizationDetailsError', 401, () => flowStage.getOutput().httpResponse);
  };

  // FLOW STAGES
  const defaultFlowStageParams = FlowStageUtils.createDefaultFlowStageParams({
    requestHelper: new RequestHelper(logger, global.SELLER_CONFIG.primary), // primary seller is used for request auth
    logger,
    sellerConfig: global.SELLER_CONFIG.secondary, // secondary seller is used to build request data.
    orderItemCriteriaList,
    describeFeatureRecord,
  });
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(
    orderItemCriteriaList,
    logger,
    {
      defaultFlowStageParams,
      c1ExpectToFail: true,
      c2ExpectToFail: true,
      bookExpectToFail: true,
    },
  );

  // TESTS
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
    itShouldReturnInvalidAuthorizationDetailsError(c1.getStage('c1'));
  });
  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldReturnInvalidAuthorizationDetailsError(c2.getStage('c2'));
  });
  FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
    itShouldReturnInvalidAuthorizationDetailsError(bookRecipe.firstStage);
  });
});
