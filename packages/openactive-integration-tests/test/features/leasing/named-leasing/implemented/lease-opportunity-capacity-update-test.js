const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { itShouldReturnHttpStatus } = require('../../../../shared-behaviours/errors');
const { FetchOpportunitiesFlowStage, FlowStageUtils, C1FlowStage, C2FlowStage } = require('../../../../helpers/flow-stages');
const { itShouldHaveCapacityForBatchedItems, itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError, multiplyFetchedOrderItemsIntoBatches } = require('../../common');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/flow-stage').UnknownFlowStageType} UnknownFlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'leasing',
  testFeature: 'named-leasing',
  testFeatureImplemented: true,
  testIdentifier: 'lease-opportunity-capacity-update',
  testName: 'Leased spaces are unavailable for purchase by other users',
  testDescription: 'When an opportunity is leased, the capacity is decremented',
  testOpportunityCriteria: 'TestOpportunityBookableFiveSpaces',
  // no control, because we don't know what capacity the control will have
  multipleOpportunityCriteriaTemplate: opportunityType => [{
    opportunityType,
    opportunityCriteria: 'TestOpportunityBookableFiveSpaces',
    primary: true,
    control: false,
  }],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
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
   * @param {boolean} [args.doIdempotencyCheck] If true, will run C2 again in order to check that named leases are
   *   idempotent and therefore no new places will be taken up.
   * @param {(c2: C2FlowStageType) => void} [itAdditionalTests]
   */
  const describeNewLeaseOfXItems = ({
    prerequisiteFlowStage,
    numberOfItems,
    expectedCapacityFromPreviousSuccessfulLeases,
    shouldSucceed,
    doIdempotencyCheck,
  }, itAdditionalTests) => {
    /* note that we use new params so that we get a new UUID - i.e. make sure that this is a NEW OrderQuoteTemplate
    rather than an amendment of the previous one */
    const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger });
    const newBatchC1 = new C1FlowStage({
      ...defaultFlowStageParams,
      prerequisite: prerequisiteFlowStage,
      getInput: () => ({
        orderItems: multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, numberOfItems),
      }),
    });
    const newBatchC2ConstructionArgs = {
      ...defaultFlowStageParams,
      prerequisite: newBatchC1,
      getInput: () => ({
        orderItems: multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, numberOfItems),
        positionOrderIntakeFormMap: newBatchC1.getOutput().positionOrderIntakeFormMap,
      }),
    };
    const newBatchC2 = new C2FlowStage(newBatchC2ConstructionArgs);

    describe(`Lease ${numberOfItems} item(s) (${shouldSucceed ? 'success' : 'fail'})`, () => {
      FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: shouldSucceed, doCheckIsValid: true }, newBatchC1);

      /**
       * @param {C2FlowStageType} c2
       */
      const doC2Checks = (c2) => {
        FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: shouldSucceed, doCheckIsValid: true }, c2, () => {
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
      doC2Checks(newBatchC2);
      if (doIdempotencyCheck) {
        describe('Same C2 Again (test idempotency)', () => {
          const newBatchC2Idempotent = new C2FlowStage({ ...newBatchC2ConstructionArgs, prerequisite: newBatchC2 });
          doC2Checks(newBatchC2Idempotent);
        });
      }
    });

    return {
      c2: newBatchC2,
    };
  };

  // # Check that repeated batch named leases update the capacity
  const { c2: batchOneC2 } = describeNewLeaseOfXItems({
    prerequisiteFlowStage: fetchOpportunities,
    numberOfItems: 3,
    shouldSucceed: true,
    // it should not take into account leased opportunities on this order
    expectedCapacityFromPreviousSuccessfulLeases: 5,
    doIdempotencyCheck: true,
  });
  const { c2: batchTwoC2 } = describeNewLeaseOfXItems({
    prerequisiteFlowStage: batchOneC2,
    numberOfItems: 10,
    shouldSucceed: false,
    // it should not take into account leased opportunities on this order
    expectedCapacityFromPreviousSuccessfulLeases: 2,
  }, (c2) => {
    itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError({
      flowStage: c2,
      batchMultiplier: 10,
      numSuccessful: 2,
      numIsReservedByLeaseError: 3,
      numHasInsufficientCapacityError: 5,
    });
  });
  const { c2: batchThreeC2 } = describeNewLeaseOfXItems({
    prerequisiteFlowStage: batchTwoC2,
    numberOfItems: 2,
    shouldSucceed: true,
    expectedCapacityFromPreviousSuccessfulLeases: 2,
  });
  describeNewLeaseOfXItems({
    prerequisiteFlowStage: batchThreeC2,
    numberOfItems: 1,
    shouldSucceed: false,
    expectedCapacityFromPreviousSuccessfulLeases: 0,
  });
});
