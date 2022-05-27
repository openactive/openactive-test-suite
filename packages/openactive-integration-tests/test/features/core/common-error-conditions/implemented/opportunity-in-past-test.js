const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldIncludeErrorForOnlyPrimaryOrderItems, itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-in-past',
  testName: 'Expect an OpportunityOfferPairNotBookableError when opportunity is in the past',
  testDescription: 'Runs C1, C2 and B for an opportunity in the past, expecting an OpportunityOfferPairNotBookableError to be returned at C1, C2, and B',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableInPast',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  // # Set up Tests
  /**
   * @param {C1FlowStageType | C2FlowStageType} flowStage
   */
  function itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(flowStage) {
    itShouldIncludeErrorForOnlyPrimaryOrderItems('OpportunityOfferPairNotBookableError', {
      orderItemCriteriaList,
      getFeedOrderItems: () => fetchOpportunities.getOutput().orderItems,
      getOrdersApiResponse: () => flowStage.getOutput().httpResponse,
    });
  }

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(c1);
  });
  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(c2);
  });
  FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(bookRecipe.firstStage);
  });
});
