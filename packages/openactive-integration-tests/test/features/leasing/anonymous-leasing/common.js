const { utils: { getRemainingCapacity } } = require('@openactive/test-interface-criteria');
const { itShouldReturnHttpStatus } = require('../../../shared-behaviours/errors');
const { FetchOpportunitiesFlowStage, FlowStageUtils, FlowStageRecipes } = require('../../../helpers/flow-stages');
const { itShouldHaveCapacityForBatchedItems, multiplyFetchedOrderItemsIntoBatches, itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError } = require('../common');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../../helpers/feature-helper').RunTestsFn} RunTestsFn
 * @typedef {import('../../../helpers/flow-stages/flow-stage').UnknownFlowStageType} UnknownFlowStageType
 * @typedef {import('../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../../helpers/flow-stages/flow-stage').OrderItem} OrderItem
 */

/**
 * @param {boolean} unit True for `unit` tests
 */
function runAnonymousLeasingCapacityTests(unit) {
  return /** @type {RunTestsFn} */((configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    // # First, get the Opportunity Feed Items which will be used in subsequent tests
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...FlowStageUtils.createSimpleDefaultFlowStageParams({ logger, orderItemCriteriaList }),
      orderItemCriteriaList,
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);

    /**
     * @param {object} args
     * @param {UnknownFlowStageType} args.prerequisiteFlowStage
     * @param {number} args.numberOfItems How many of each OrderItem are we going to include in our lease?
     * @param {number} args.expectedCapacityInResponseFromPreviousSuccessfulLeases What do we expect the Booking System to report
     *   as the capacity in its response?
     * @param {boolean} args.shouldSucceed Should this batch of leases succeed?
     * @param {() => ChakramResponse[]} args.getLatestOpportunityFeedExtractResponses
     * @param {(c1: C1FlowStageType) => void} [itAdditionalTests]
     */
    const describeNewLeaseOfXItems = ({
      prerequisiteFlowStage,
      numberOfItems,
      expectedCapacityInResponseFromPreviousSuccessfulLeases,
      shouldSucceed,
      getLatestOpportunityFeedExtractResponses,
    }, itAdditionalTests) => {
      /* note that we use new params so that we get a new UUID - i.e. make sure that this is a NEW OrderQuoteTemplate
      rather than an amendment of the previous one */
      const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger, orderItemCriteriaList });
      const newBatchC1 = FlowStageRecipes.runs.book.c1AssertCapacity(prerequisiteFlowStage, defaultFlowStageParams, {
        c1Args: {
          // This test does its own more complicated capacity checks
          doSimpleAutomaticCapacityCheck: false,
          getInput: () => ({
            orderItems: multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, numberOfItems),
          }),
        },
        // Capacity is expected to have gone down after a successful C1 as anonymous-leasing is enabled
        assertOpportunityCapacityArgs: {
          getInput: () => ({
            orderItems: fetchOpportunities.getOutput().orderItems,
            opportunityFeedExtractResponses: getLatestOpportunityFeedExtractResponses(),
          }),
          getOpportunityExpectedCapacity: (opportunity) => {
            /* This logic will fail if this is run for "multiple" tests, which would require more complex logic to
            ascertain the correct expected capacity for each Opportunity */
            const capacity = getRemainingCapacity(opportunity);
            return shouldSucceed
              ? capacity - numberOfItems
              : capacity;
          },
        },
      });

      describe(`Lease ${numberOfItems} item(s) (${shouldSucceed ? 'success' : 'fail'})`, () => {
        FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: shouldSucceed, doCheckIsValid: true }, newBatchC1, () => {
          itShouldHaveCapacityForBatchedItems({
            orderItemCriteriaList,
            flowStage: newBatchC1.getStage('c1'),
            batchMultiplier: numberOfItems,
            expectedCapacity: expectedCapacityInResponseFromPreviousSuccessfulLeases,
          });
          if (!shouldSucceed) {
            itShouldReturnHttpStatus(409, () => newBatchC1.getStage('c1').getOutput().httpResponse);
          }
          if (itAdditionalTests) {
            itAdditionalTests(newBatchC1.getStage('c1'));
          }
        });
      });

      return newBatchC1;
    };

    // # Check that repeated batch anonymous leases update the capacity
    const batchOneC1 = describeNewLeaseOfXItems({
      prerequisiteFlowStage: fetchOpportunities,
      numberOfItems: unit ? 1 : 3,
      shouldSucceed: true,
      // it should not take into account leased opportunities on this order
      expectedCapacityInResponseFromPreviousSuccessfulLeases: unit ? 1 : 5,
      getLatestOpportunityFeedExtractResponses: () => fetchOpportunities.getOutput().opportunityFeedExtractResponses,
    });
    const batchTwoC1 = describeNewLeaseOfXItems({
      prerequisiteFlowStage: batchOneC1.getLastStage(),
      numberOfItems: unit ? 1 : 10,
      shouldSucceed: false,
      expectedCapacityInResponseFromPreviousSuccessfulLeases: unit ? 0 : 2,
      getLatestOpportunityFeedExtractResponses: () => (
        batchOneC1.getStage('assertOpportunityCapacityAfterC1').getOutput().opportunityFeedExtractResponses),
    }, (c1) => {
      itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError({
        flowStage: c1,
        batchMultiplier: unit ? 1 : 10,
        numSuccessful: unit ? 0 : 2,
        numIsReservedByLeaseError: unit ? 1 : 3,
        numHasInsufficientCapacityError: unit ? 0 : 5,
      });
    });
    if (!unit) {
      const batchThreeC1 = describeNewLeaseOfXItems({
        prerequisiteFlowStage: batchTwoC1.getLastStage(),
        numberOfItems: 2,
        shouldSucceed: true,
        expectedCapacityInResponseFromPreviousSuccessfulLeases: 2,
        getLatestOpportunityFeedExtractResponses: () => (
          batchTwoC1.getStage('assertOpportunityCapacityAfterC1').getOutput().opportunityFeedExtractResponses),
      });
      describeNewLeaseOfXItems({
        prerequisiteFlowStage: batchThreeC1.getLastStage(),
        numberOfItems: 1,
        shouldSucceed: false,
        expectedCapacityInResponseFromPreviousSuccessfulLeases: 0,
        getLatestOpportunityFeedExtractResponses: () => (
          batchThreeC1.getStage('assertOpportunityCapacityAfterC1').getOutput().opportunityFeedExtractResponses),
      });
    }
  });
}

module.exports = {
  runAnonymousLeasingCapacityTests,
};
