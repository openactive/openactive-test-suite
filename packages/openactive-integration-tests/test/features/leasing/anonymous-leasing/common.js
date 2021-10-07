const { utils: { getRemainingCapacity } } = require('@openactive/test-interface-criteria');
const { itShouldReturnHttpStatus } = require('../../../shared-behaviours/errors');
const { FetchOpportunitiesFlowStage, FlowStageUtils, C1FlowStage } = require('../../../helpers/flow-stages');
const { itShouldHaveCapacityForBatchedItems, multiplyFetchedOrderItemsIntoBatches, itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError, multiplyObjectsIntoBatches } = require('../common');
const { AssertOpportunityCapacityFlowStage } = require('../../../helpers/flow-stages/assert-opportunity-capacity');

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

    //  * @param {number} args.expectedCapacityInFeedFromThisAndPreviousSuccessfulLeases What do we expect the capacity of
    //  *   this Opportunity to be in the feed after this lease is performed?
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
      // expectedCapacityInFeedFromThisAndPreviousSuccessfulLeases,
      shouldSucceed,
      getLatestOpportunityFeedExtractResponses,
    }, itAdditionalTests) => {
      // const orderItemCriteriaListMultipliedIntoBatches = multiplyObjectsIntoBatches(orderItemCriteriaList, numberOfItems);
      const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger, orderItemCriteriaList });
      const newBatchC1 = new C1FlowStage({
        /* note that we use new params so that we get a new UUID - i.e. make sure that this is a NEW OrderQuoteTemplate
        rather than an amendment of the previous one */
        ...defaultFlowStageParams,
        // This test does its own more complicated capacity checks
        doSimpleAutomaticCapacityCheck: false,
        prerequisite: prerequisiteFlowStage,
        getInput: () => ({
          orderItems: multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, numberOfItems),
        }),
      });
      const assertOpportunityCapacity = new AssertOpportunityCapacityFlowStage({
        ...defaultFlowStageParams,
        prerequisite: newBatchC1,
        nameOfPreviousStage: `C1 (${numberOfItems} items)`,
        getInput: () => ({
          orderItems: fetchOpportunities.getOutput().orderItems,
          opportunityFeedExtractResponses: getLatestOpportunityFeedExtractResponses(),
          // orderItems: multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, numberOfItems),
          // opportunityFeedExtractResponses: multiplyObjectsIntoBatches(fetchOpportunities.getOutput().opportunityFeedExtractResponses, numberOfItems),
        }),
        getOpportunityExpectedCapacity: (opportunity) => {
          const capacity = getRemainingCapacity(opportunity);
          return shouldSucceed
            ? capacity - numberOfItems
            : capacity;
        },
        // getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterC1(shouldSucceed),
      });

      describe(`Lease ${numberOfItems} item(s) (${shouldSucceed ? 'success' : 'fail'})`, () => {
        FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: shouldSucceed, doCheckIsValid: true }, newBatchC1, () => {
          itShouldHaveCapacityForBatchedItems({
            orderItemCriteriaList,
            flowStage: newBatchC1,
            batchMultiplier: numberOfItems,
            expectedCapacity: expectedCapacityInResponseFromPreviousSuccessfulLeases,
          });
          if (!shouldSucceed) {
            itShouldReturnHttpStatus(409, () => newBatchC1.getOutput().httpResponse);
          }
          if (itAdditionalTests) {
            itAdditionalTests(newBatchC1);
          }
        });
        FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(assertOpportunityCapacity);
      });

      return {
        c1: newBatchC1,
        assertOpportunityCapacity,
      };
    };

    // # Check that repeated batch anonymous leases update the capacity
    const { c1: batchOneC1, assertOpportunityCapacity: batchOneAssertCapacity } = describeNewLeaseOfXItems({
      prerequisiteFlowStage: fetchOpportunities,
      numberOfItems: unit ? 1 : 3,
      shouldSucceed: true,
      // it should not take into account leased opportunities on this order
      expectedCapacityInResponseFromPreviousSuccessfulLeases: unit ? 1 : 5,
      getLatestOpportunityFeedExtractResponses: () => fetchOpportunities.getOutput().opportunityFeedExtractResponses,
      // expectedCapacityInFeedFromThisAndPreviousSuccessfulLeases: unit ? 0 : 2,
    });
    const { c1: batchTwoC1, assertOpportunityCapacity: batchTwoAssertCapacity } = describeNewLeaseOfXItems({
      prerequisiteFlowStage: batchOneC1,
      numberOfItems: unit ? 1 : 10,
      shouldSucceed: false,
      expectedCapacityInResponseFromPreviousSuccessfulLeases: unit ? 0 : 2,
      getLatestOpportunityFeedExtractResponses: () => batchOneAssertCapacity.getOutput().opportunityFeedExtractResponses,
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
      const { c1: batchThreeC1, assertOpportunityCapacity: batchThreeAssertCapacity } = describeNewLeaseOfXItems({
        prerequisiteFlowStage: batchTwoC1,
        numberOfItems: 2,
        shouldSucceed: true,
        expectedCapacityInResponseFromPreviousSuccessfulLeases: 2,
        getLatestOpportunityFeedExtractResponses: () => batchTwoAssertCapacity.getOutput().opportunityFeedExtractResponses,
      });
      describeNewLeaseOfXItems({
        prerequisiteFlowStage: batchThreeC1,
        numberOfItems: 1,
        shouldSucceed: false,
        expectedCapacityInResponseFromPreviousSuccessfulLeases: 0,
        getLatestOpportunityFeedExtractResponses: () => batchThreeAssertCapacity.getOutput().opportunityFeedExtractResponses,
      });
    }
  });
}

module.exports = {
  runAnonymousLeasingCapacityTests,
};
