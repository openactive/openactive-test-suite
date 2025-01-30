const { utils: { getRemainingCapacity } } = require('@openactive/test-interface-criteria');
const { itShouldReturnHttpStatus } = require('../../../shared-behaviours/errors');
const { FetchOpportunitiesFlowStage, FlowStageUtils, C1FlowStage, C2FlowStage, FlowStageRecipes } = require('../../../helpers/flow-stages');
const { itShouldHaveCapacityForBatchedItems, itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError, multiplyFetchedOrderItemsIntoBatches } = require('../common');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../../helpers/flow-stages/flow-stage').UnknownFlowStageType} UnknownFlowStageType
 */

function runNamedLeasingCapacityTests(unit) {
  return (configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
    // # First, get the Opportunity Feed Items which will be used in subsequent tests
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...FlowStageUtils.createSimpleDefaultFlowStageParams({
        logger, orderItemCriteriaList, describeFeatureRecord,
      }),
      orderItemCriteriaList,
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);

    /**
     * @param {object} args
     * @param {UnknownFlowStageType} args.prerequisiteFlowStage
     * @param {number} args.numberOfItems How many of each OrderItem are we going to include in our lease?
     * @param {number} args.expectedCapacityFromPreviousSuccessfulLeases What do we expect the Booking System to report
     *   as the capacity in its response?
     * @param {boolean} args.shouldSucceed Should this batch of leases succeed?
     * @param {boolean} [args.doIdempotencyCheck] If true, will run C2 again in order to check that named leases are
     *   idempotent and therefore no new places will be taken up.
     * @param {() => ChakramResponse[]} args.getLatestOpportunityFeedExtractResponses
     * @param {(c2: C2FlowStageType) => void} [itAdditionalTests]
     */
    const describeNewLeaseOfXItems = ({
      prerequisiteFlowStage,
      numberOfItems,
      expectedCapacityFromPreviousSuccessfulLeases,
      shouldSucceed,
      doIdempotencyCheck,
      getLatestOpportunityFeedExtractResponses,
    }, itAdditionalTests) => {
      /* note that we use new params so that we get a new UUID - i.e. make sure that this is a NEW OrderQuoteTemplate
      rather than an amendment of the previous one */
      const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({
        logger, orderItemCriteriaList, describeFeatureRecord,
      });
      const newBatchC1 = new C1FlowStage({
        ...defaultFlowStageParams,
        prerequisite: prerequisiteFlowStage,
        // This test does its own more complicated capacity checks
        doSimpleAutomaticCapacityCheck: false,
        getInput: () => ({
          orderItems: multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, numberOfItems),
        }),
      });
      const newBatchC2ConstructionArgs = {
        // This test does its own more complicated capacity checks
        doSimpleAutomaticCapacityCheck: false,
        getInput: () => ({
          orderItems: multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, numberOfItems),
          positionOrderIntakeFormMap: newBatchC1.getOutput().positionOrderIntakeFormMap,
        }),
      };
      const newBatchC2 = FlowStageRecipes.runs.book.c2AssertCapacity(newBatchC1, defaultFlowStageParams, {
        c2Args: newBatchC2ConstructionArgs,
        // Capacity is expected to have gone down after a successful C2 as named-leasing is enabled
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
        FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: shouldSucceed, doCheckIsValid: true }, newBatchC1);

        /**
         * @param {C2FlowStageType} c2
         * @param {import('../../../helpers/flow-stages/flow-stage-run').AnyFlowStageRun} [run]
         */
        const doC2Checks = (c2, run) => {
          const runnable = run ?? c2;
          FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: shouldSucceed, doCheckIsValid: true }, runnable, () => {
            itShouldHaveCapacityForBatchedItems({
              orderItemCriteriaList,
              flowStage: c2,
              batchMultiplier: numberOfItems,
              expectedCapacity: expectedCapacityFromPreviousSuccessfulLeases,
            });
            if (!shouldSucceed) {
              itShouldReturnHttpStatus(409, () => c2.getOutput().httpResponse);
            }
            if (itAdditionalTests) {
              itAdditionalTests(c2);
            }
          });
        };
        doC2Checks(newBatchC2.getStage('c2'), newBatchC2);
        if (doIdempotencyCheck) {
          describe('Same C2 Again (test idempotency)', () => {
            const newBatchC2Idempotent = new C2FlowStage({
              ...defaultFlowStageParams,
              ...newBatchC2ConstructionArgs,
              prerequisite: newBatchC2.getLastStage(),
            });
            doC2Checks(newBatchC2Idempotent);
            return { c2: newBatchC2, lastStage: newBatchC2Idempotent };
          });
        }
      });

      return {
        c2: newBatchC2,
        lastStage: newBatchC2.getLastStage(),
      };
    };

    // # Check that repeated batch named leases update the capacity
    const { c2: batchOneC2, lastStage: batchOneLastStage } = describeNewLeaseOfXItems({
      prerequisiteFlowStage: fetchOpportunities,
      numberOfItems: unit ? 1 : 3,
      shouldSucceed: true,
      // it should not take into account leased opportunities on this order
      expectedCapacityFromPreviousSuccessfulLeases: unit ? 1 : 5,
      doIdempotencyCheck: true,
      getLatestOpportunityFeedExtractResponses: () => fetchOpportunities.getOutput().opportunityFeedExtractResponses,
    });
    const { c2: batchTwoC2, lastStage: batchTwoLastStage } = describeNewLeaseOfXItems({
      prerequisiteFlowStage: batchOneLastStage,
      numberOfItems: unit ? 1 : 10,
      shouldSucceed: false,
      // it should not take into account leased opportunities on this order
      expectedCapacityFromPreviousSuccessfulLeases: unit ? 0 : 2,
      getLatestOpportunityFeedExtractResponses: () => (
        batchOneC2.getStage('assertOpportunityCapacityAfterC2').getOutput().opportunityFeedExtractResponses),
    }, (c2) => {
      itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError({
        flowStage: c2,
        batchMultiplier: unit ? 1 : 10,
        numSuccessful: unit ? 0 : 2,
        numIsReservedByLeaseError: unit ? 1 : 3,
        numHasInsufficientCapacityError: unit ? 0 : 5,
      });
    });
    if (!unit) {
      const { c2: batchThreeC2, lastStage: batchThreeLastStage } = describeNewLeaseOfXItems({
        prerequisiteFlowStage: batchTwoLastStage,
        numberOfItems: 2,
        shouldSucceed: true,
        expectedCapacityFromPreviousSuccessfulLeases: 2,
        getLatestOpportunityFeedExtractResponses: () => (
          batchTwoC2.getStage('assertOpportunityCapacityAfterC2').getOutput().opportunityFeedExtractResponses),
      });
      describeNewLeaseOfXItems({
        prerequisiteFlowStage: batchThreeLastStage,
        numberOfItems: 1,
        shouldSucceed: false,
        expectedCapacityFromPreviousSuccessfulLeases: 0,
        getLatestOpportunityFeedExtractResponses: () => (
          batchThreeC2.getStage('assertOpportunityCapacityAfterC2').getOutput().opportunityFeedExtractResponses),
      });
    }
  };
}

module.exports = {
  runNamedLeasingCapacityTests,
};
