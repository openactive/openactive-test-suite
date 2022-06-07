const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageRecipes,
  FlowStageUtils,
  FetchOpportunitiesFlowStage,
} = require('../../../../helpers/flow-stages');
const { AssertOpportunityCapacityFlowStage } = require('../../../../helpers/flow-stages/assert-opportunity-capacity');
const { itEachOrderItemIdShouldMatchThoseFromFeed, AmendingOrderQuoteFlowStageRecipes } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'amending-order-quote',
  testFeatureImplemented: true,
  testIdentifier: 'amend-c2',
  testName: 'Amend, at C2, an existing OrderQuote',
  testDescription: 'Run C1,C2 with X opportunities, then - with the same Order UUID - run C2 with Y opportunities and different customer details, then runs B. The resulting Order should include confirmed bookings for only Y opportunities',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // This test uses 2 opportunities, A & B
  numOpportunitiesUsedPerCriteria: 2,
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // # Initialise Flow Stages
  // Flow stages for first attempt: C1 -> C2
  const {
    fetchOpportunities: firstAttemptFetchOpportunities,
    c1: firstAttemptC1,
    c2: firstAttemptC2,
    defaultFlowStageParams: firstAttemptDefaultFlowStageParams,
  } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger);

  const secondAttemptCustomerDetails = FlowStageUtils.createRandomCustomerDetails();
  const secondAttemptDefaultFlowStageParams = {
    ...firstAttemptDefaultFlowStageParams,
    customer: secondAttemptCustomerDetails,
  };

  // Flow stages for second attempt: C2 -> B
  const secondAttemptFetchOpportunities = new FetchOpportunitiesFlowStage({
    /* Note that we use the same default flow stage params, which also means that the 2nd attempt
    uses the same UUID as the 1st attempt.
    This is correct as the 2nd attempt is an amendment of the 1st OrderQuote */
    ...secondAttemptDefaultFlowStageParams,
    prerequisite: firstAttemptC2.getLastStage(),
    orderItemCriteriaList,
  });
  const secondAttemptC2 = FlowStageRecipes.runs.book.c2AssertCapacity(secondAttemptFetchOpportunities, secondAttemptDefaultFlowStageParams, {
    c2Args: {
      getInput: () => ({
        orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
      }),
    },
    assertOpportunityCapacityArgs: {
      getInput: () => secondAttemptFetchOpportunities.getOutput(),
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterC2SkippingC1(true),
    },
  });
  const secondAttemptBook = FlowStageRecipes.book(orderItemCriteriaList, secondAttemptDefaultFlowStageParams, {
    prerequisite: secondAttemptC2.getLastStage(),
    getFirstStageInput: () => ({
      orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
      totalPaymentDue: secondAttemptC2.getStage('c2').getOutput().totalPaymentDue,
      prepayment: secondAttemptC2.getStage('c2').getOutput().prepayment,
    }),
    getAssertOpportunityCapacityInput: () => ({
      orderItems: secondAttemptFetchOpportunities.getOutput().orderItems,
      opportunityFeedExtractResponses: secondAttemptC2.getStage('assertOpportunityCapacityAfterC2').getOutput().opportunityFeedExtractResponses,
    }),
  });

  // # Set up Tests
  // N.B.: The following two tests must be performed sequentially - with Second Attempt occurring after First Attempt.
  describe('First Attempt - C1 -> C2', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(firstAttemptFetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(firstAttemptC1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(firstAttemptC2);
  });
  // Fetch some new opportunities, amend the existing order with a C2 request, and then complete it
  describe('Second Attempt - C2 -> B', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(secondAttemptFetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(secondAttemptC2, () => {
      itEachOrderItemIdShouldMatchThoseFromFeed({
        orderItemCriteriaList,
        fetchOpportunitiesFlowStage: secondAttemptFetchOpportunities,
        apiFlowStage: secondAttemptC2.getStage('c2'),
      });
      it('should include expected email address', () => {
        const apiResponseJson = secondAttemptC2.getStage('c2').getOutput().httpResponse.body;
        expect(apiResponseJson).to.have.nested.property('customer.email', secondAttemptCustomerDetails.email);
      });
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(secondAttemptBook, () => {
      itEachOrderItemIdShouldMatchThoseFromFeed({
        orderItemCriteriaList,
        fetchOpportunitiesFlowStage: secondAttemptFetchOpportunities,
        apiFlowStage: secondAttemptBook.b,
        bookRecipe: secondAttemptBook,
      });
      it('should include expected email address', () => {
        const apiResponseJson = secondAttemptBook.b.getOutput().httpResponse.body;
        expect(apiResponseJson).to.have.nested.property('customer.email', secondAttemptCustomerDetails.email);
      });
    });
  });

  // Test that capacity goes back up for the Opportunities that have now been switched out from the OrderQuote
  const assertFirstAttemptOpportunitiesHaveRegainedCapacity = AmendingOrderQuoteFlowStageRecipes.assertFirstAttemptOpportunitiesHaveRegainedCapacity(
    'Second Attempt - B',
    secondAttemptBook.lastStage,
    firstAttemptDefaultFlowStageParams,
    firstAttemptFetchOpportunities,
  );

  describe('After Second Attempt, should restore capacity for Opportunities from First Attempt', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(assertFirstAttemptOpportunitiesHaveRegainedCapacity);
  });
});
