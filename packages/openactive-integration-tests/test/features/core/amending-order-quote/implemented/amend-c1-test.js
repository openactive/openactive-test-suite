const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  FetchOpportunitiesFlowStage,
  C1FlowStage,
  C2FlowStage,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');
const { itEachOrderItemIdShouldMatchThoseFromFeed } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'amending-order-quote',
  testFeatureImplemented: true,
  testIdentifier: 'amend-c1',
  testName: 'Amend, at C1, an existing OrderQuote',
  testDescription: 'Run C1 with X opportunities, then - with the same Order UUID - run C1 with Y opportunities. Then, run B. The resulting Order should include confirmed bookings for only Y opportunities',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // This test uses 2 opportunities, A & B
  numOpportunitiesUsedPerCriteria: 2,
  supportsApproval: true, // https://github.com/openactive/OpenActive.Server.NET/issues/119
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // # Initialise Flow Stages
  // Flow stages for first attempt: C1
  const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger });
  const firstAttemptFetchOpportunities = new FetchOpportunitiesFlowStage({
    ...defaultFlowStageParams,
    orderItemCriteriaList,
  });
  const firstAttemptC1 = new C1FlowStage({
    ...defaultFlowStageParams,
    prerequisite: firstAttemptFetchOpportunities,
    getInput: () => ({
      orderItems: firstAttemptFetchOpportunities.getOutput().orderItems,
    }),
  });
  // Flow stages for second attempt: C1 -> B
  const secondAttemptFetchOpportunities = new FetchOpportunitiesFlowStage({
    /* Note that we use the same default flow stage params, which also means that the 2nd attempt
    uses the same UUID as the 1st attempt.
    This is correct as the 2nd attempt is an amendment of the 1st OrderQuote */
    ...defaultFlowStageParams,
    prerequisite: firstAttemptC1,
    orderItemCriteriaList,
  });
  const secondAttemptC1 = new C1FlowStage({
    ...defaultFlowStageParams,
    prerequisite: secondAttemptFetchOpportunities,
    getInput: () => ({
      orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
    }),
  });
  const secondAttemptC2 = new C2FlowStage({
    ...defaultFlowStageParams,
    prerequisite: secondAttemptC1,
    getInput: () => ({
      orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
      positionOrderIntakeFormMap: secondAttemptC1.getOutput().positionOrderIntakeFormMap,
    }),
  });
  const secondAttemptBook = FlowStageRecipes.book(orderItemCriteriaList, defaultFlowStageParams, {
    prerequisite: secondAttemptC2,
    getFirstStageInput: () => ({
      orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
      totalPaymentDue: secondAttemptC2.getOutput().totalPaymentDue,
      prepayment: secondAttemptC2.getOutput().prepayment,
      positionOrderIntakeFormMap: secondAttemptC1.getOutput().positionOrderIntakeFormMap,
    }),
  });

  // # Set up Tests
  // N.B.: The following two tests must be performed sequentially - with Second Attempt occurring after First Attempt.
  describe('First Attempt - C1', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(firstAttemptFetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(firstAttemptC1);
  });
  // Fetch some new opportunities and amend the existing order at C1, and then complete it
  describe('Second Attempt - C1 -> B', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(secondAttemptFetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(secondAttemptC1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(secondAttemptC2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(secondAttemptBook, () => {
      itEachOrderItemIdShouldMatchThoseFromFeed({
        orderItemCriteriaList,
        fetchOpportunitiesFlowStage: secondAttemptFetchOpportunities,
        apiFlowStage: secondAttemptBook.b,
        bookRecipe: secondAttemptBook,
      });
    });
  });
});
