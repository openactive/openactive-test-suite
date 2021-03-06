const { itShouldReturnHttpStatus } = require('../../../shared-behaviours/errors');
const { FetchOpportunitiesFlowStage, FlowStageUtils, C1FlowStage } = require('../../../helpers/flow-stages');
const { itShouldHaveCapacityForBatchedItems, multiplyFetchedOrderItemsIntoBatches, itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError } = require('../common');

/**
 * @typedef {import('../../../helpers/flow-stages/flow-stage').UnknownFlowStageType} UnknownFlowStageType
 * @typedef {import('../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../../helpers/flow-stages/flow-stage').OrderItem} OrderItem
 */

function runAnonymousLeasingCapacityTests(unit) {
  return (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    // # First, get the Opportunity Feed Items which will be used in subsequent tests
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...FlowStageUtils.createSimpleDefaultFlowStageParams({ logger }),
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
     * @param {(c1: C1FlowStageType) => void} [itAdditionalTests]
     */
    const describeNewLeaseOfXItems = ({
      prerequisiteFlowStage,
      numberOfItems,
      expectedCapacityFromPreviousSuccessfulLeases,
      shouldSucceed,
    }, itAdditionalTests) => {
      const newBatchC1 = new C1FlowStage({
        /* note that we use new params so that we get a new UUID - i.e. make sure that this is a NEW OrderQuoteTemplate
        rather than an amendment of the previous one */
        ...FlowStageUtils.createSimpleDefaultFlowStageParams({ logger }),
        prerequisite: prerequisiteFlowStage,
        getInput: () => ({
          orderItems: multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, numberOfItems),
        }),
      });

      describe(`Lease ${numberOfItems} item(s) (${shouldSucceed ? 'success' : 'fail'})`, () => {
        FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: shouldSucceed, doCheckIsValid: true }, newBatchC1, () => {
          itShouldHaveCapacityForBatchedItems({
            orderItemCriteriaList,
            flowStage: newBatchC1,
            batchMultiplier: numberOfItems,
            expectedCapacity: expectedCapacityFromPreviousSuccessfulLeases,
          });
          if (!shouldSucceed) {
            itShouldReturnHttpStatus(409, () => newBatchC1.getOutput().httpResponse);
          }
          if (itAdditionalTests) {
            itAdditionalTests(newBatchC1);
          }
        });
      });

      return { c1: newBatchC1 };
    };

    // # Check that repeated batch anonymous leases update the capacity
    const { c1: batchOneC1 } = describeNewLeaseOfXItems({
      prerequisiteFlowStage: fetchOpportunities,
      numberOfItems: unit ? 1 : 3,
      shouldSucceed: true,
      // it should not take into account leased opportunities on this order
      expectedCapacityFromPreviousSuccessfulLeases: unit ? 1 : 5,
    });
    const { c1: batchTwoC1 } = describeNewLeaseOfXItems({
      prerequisiteFlowStage: batchOneC1,
      numberOfItems: unit ? 1 : 10,
      shouldSucceed: false,
      expectedCapacityFromPreviousSuccessfulLeases: unit ? 0 : 2,
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
      const { c1: batchThreeC1 } = describeNewLeaseOfXItems({
        prerequisiteFlowStage: batchTwoC1,
        numberOfItems: 2,
        shouldSucceed: true,
        expectedCapacityFromPreviousSuccessfulLeases: 2,
      });
      describeNewLeaseOfXItems({
        prerequisiteFlowStage: batchThreeC1,
        numberOfItems: 1,
        shouldSucceed: false,
        expectedCapacityFromPreviousSuccessfulLeases: 0,
      });
    }
  };
}

module.exports = {
  runAnonymousLeasingCapacityTests,
};
