const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  FetchOpportunitiesFlowStage,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');
const { AssertOpportunityCapacityFlowStage } = require('../../../../helpers/flow-stages/assert-opportunity-capacity');
const { itEachOrderItemIdShouldMatchThoseFromFeed, AmendingOrderQuoteFlowStageRecipes } = require('../common');

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
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
  // # Initialise Flow Stages
  // Flow stages for first attempt: C1
  const {
    fetchOpportunities: firstAttemptFetchOpportunities,
    c1: firstAttemptC1,
    defaultFlowStageParams,
  } = FlowStageRecipes.initialiseSimpleC1Flow(orderItemCriteriaList, logger, describeFeatureRecord);
  // Flow stages for second attempt: C1 -> B
  const secondAttemptFetchOpportunities = new FetchOpportunitiesFlowStage({
    /* Note that we use the same default flow stage params, which also means that the 2nd attempt
    uses the same UUID as the 1st attempt.
    This is correct as the 2nd attempt is an amendment of the 1st OrderQuote */
    ...defaultFlowStageParams,
    prerequisite: firstAttemptC1.getLastStage(),
    orderItemCriteriaList,
  });
  const secondAttemptC1 = FlowStageRecipes.runs.book.c1AssertCapacity(secondAttemptFetchOpportunities, defaultFlowStageParams, {
    c1Args: {
      getInput: () => secondAttemptFetchOpportunities.getOutput(),
    },
    assertOpportunityCapacityArgs: {
      getInput: () => secondAttemptFetchOpportunities.getOutput(),
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterC1(true),
    },
  });
  const secondAttemptC2 = FlowStageRecipes.runs.book.c2AssertCapacity(secondAttemptC1.getLastStage(), defaultFlowStageParams, {
    c2Args: {
      getInput: () => ({
        orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
        positionOrderIntakeFormMap: secondAttemptC1.getStage('c1').getOutput().positionOrderIntakeFormMap,
      }),
    },
    assertOpportunityCapacityArgs: {
      getInput: () => ({
        orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
        opportunityFeedExtractResponses: secondAttemptC1.getStage('assertOpportunityCapacityAfterC1').getOutput().opportunityFeedExtractResponses,
      }),
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterC2(true),
    },
  });
  const secondAttemptBook = FlowStageRecipes.book(orderItemCriteriaList, defaultFlowStageParams, {
    prerequisite: secondAttemptC2.getLastStage(),
    getFirstStageInput: () => ({
      orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
      totalPaymentDue: secondAttemptC2.getStage('c2').getOutput().totalPaymentDue,
      prepayment: secondAttemptC2.getStage('c2').getOutput().prepayment,
      positionOrderIntakeFormMap: secondAttemptC1.getStage('c1').getOutput().positionOrderIntakeFormMap,
    }),
    getAssertOpportunityCapacityInput: () => ({
      orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
      opportunityFeedExtractResponses: secondAttemptC2.getStage('assertOpportunityCapacityAfterC2').getOutput().opportunityFeedExtractResponses,
    }),
    paymentIdentifierIfPaid: FlowStageRecipes.createRandomPaymentIdentifierIfPaid(),
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

  // Test that capacity goes back up for the Opportunities that have now been switched out from the OrderQuote
  const assertFirstAttemptOpportunitiesHaveRegainedCapacity = AmendingOrderQuoteFlowStageRecipes.assertFirstAttemptOpportunitiesHaveRegainedCapacity(
    'Second Attempt - B',
    secondAttemptBook.lastStage,
    defaultFlowStageParams,
    firstAttemptFetchOpportunities,
  );

  describe('After Second Attempt, should restore capacity for Opportunities from First Attempt', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(assertFirstAttemptOpportunitiesHaveRegainedCapacity);
  });
});
