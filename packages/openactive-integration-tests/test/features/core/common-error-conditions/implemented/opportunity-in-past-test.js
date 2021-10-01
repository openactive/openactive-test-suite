const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, FetchOpportunitiesFlowStage, C1FlowStage, C2FlowStage } = require('../../../../helpers/flow-stages');
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
  testDescription: 'Runs C1, C2 and B for an opportunity in the past, expecting an OpportunityOfferPairNotBookableError to be returned at C1 and C2, and an UnableToProcessOrderItemError to be returned at B',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableInPast',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // # Initialise Flow Stages
  /* Note that we don't use FlowStageRecipes.initialiseSimpleC1C2Flow, because this includes capacity assertions, which
  won't work here as C1, etc is expected to fail */
  const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger });
  const fetchOpportunities = new FetchOpportunitiesFlowStage({
    ...defaultFlowStageParams,
    orderItemCriteriaList,
  });
  const c1 = new C1FlowStage({
    ...defaultFlowStageParams,
    prerequisite: fetchOpportunities,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
    }),
  });
  const c2 = new C2FlowStage({
    ...defaultFlowStageParams,
    prerequisite: c1,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      positionOrderIntakeFormMap: c1.getOutput().positionOrderIntakeFormMap,
    }),
  });
  // TODO TODO TODO or should i just have the recipes expect a "c1WillFail: true", which just sets the capacity assertion differently D:
  // const bookReci
  // const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

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
    itShouldReturnAnOpenBookingError('UnableToProcessOrderItemError', 409, () => bookRecipe.firstStage.getOutput().httpResponse);
  });
});
