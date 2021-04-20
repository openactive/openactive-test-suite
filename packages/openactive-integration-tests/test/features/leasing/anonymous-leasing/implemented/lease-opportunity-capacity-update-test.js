const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { itShouldReturnHttpStatus } = require('../../../../shared-behaviours/errors');
const { FetchOpportunitiesFlowStage, FlowStageUtils, C1FlowStage } = require('../../../../helpers/flow-stages');
const { itForEachOrderItemWhereOrderItemsAreBatched } = require('../../common');

/**
 * @typedef {import('../../../../helpers/flow-stages/flow-stage').FlowStage} FlowStage
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../../../helpers/flow-stages/flow-stage').OrderItem} OrderItem
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'leasing',
  testFeature: 'anonymous-leasing',
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
  /**
   * @param {C1FlowStageType} c1
   */
  const itShouldReturn409Conflict = (c1) => {
    itShouldReturnHttpStatus(409, () => c1.getOutput().httpResponse);
  };

  // # First, get the Opportunity Feed Items which will be used in subsequent tests
  const fetchOpportunities = new FetchOpportunitiesFlowStage({
    ...FlowStageUtils.createSimpleDefaultFlowStageParams({ logger }),
    orderItemCriteriaList,
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);

  /**
   * For each of the fetched OrderItems, get `multiple` duplicates of that item.
   *
   * e.g. `multiplyFetchedOrderItems(3)` will return 3 of each OrderItem. This is equivalent to the real life
   * use case of someone booking an opportunity for themself and 2 friends.
   *
   * @param {number} multiple
   */
  const multiplyFetchedOrderItems = (multiple) => {
    const fetchedOrderItems = fetchOpportunities.getOutput().orderItems; // might need to filter by control (but why?)

    /** @type {OrderItem[]} */
    const result = [];
    for (let i = 0; i < multiple; i += 1) {
      result.push(
        // OrderItems are shallow cloned so that we can reset their positions
        ...fetchedOrderItems.map(orderItem => ({ ...orderItem })),
      );
    }
    // now, reset `position`s so that multiple OrderItems don't have the same positions :o
    for (let i = 0; i < result.length; i += 1) {
      result[i].position = i;
    }
    return result;
  };

  /**
   * @param {number} expectedCapacity
   * @param {number} multipleOfFetchedOrderItems
   * @param {C1FlowStageType} c1
   */
  const itShouldHaveCapacity = (expectedCapacity, multipleOfFetchedOrderItems, c1) => {
    itForEachOrderItemWhereOrderItemsAreBatched({
      orderItemCriteriaList,
      getOrdersApiResponse: () => c1.getOutput().httpResponse,
      batchMultiplier: multipleOfFetchedOrderItems,
    },
    'should decrement remaining slots',
    (apiResponseOrderItem) => {
      if (apiResponseOrderItem && apiResponseOrderItem.orderedItem['@type'] === 'Slot') {
        expect(apiResponseOrderItem).to.nested.include({
          'orderedItem.remainingUses': expectedCapacity,
        });
      } else {
        expect(apiResponseOrderItem).to.nested.include({
          'orderedItem.remainingAttendeeCapacity': expectedCapacity,
        });
      }
    });
  };

  /**
   * @param {object} args
   * @param {FlowStage} args.prerequisiteFlowStage
   * @param {number} args.numberOfItems How many of each OrderItem are we going to include in our lease?
   * @param {number} args.expectedCapacityFromPreviousSuccessfulLeases What do we expect the Booking System to report
   *   as the capacity in its response?
   * @param {boolean} args.shouldSucceed Should this batch of leases succeed?
   * @param {() => void} [itAdditionalTests]
   */
  const describeNewBatchOfLeases = ({
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
        orderItems: multiplyFetchedOrderItems(numberOfItems),
      }),
    });

    describe(`Lease ${numberOfItems} item(s) (${shouldSucceed ? 'success' : 'fail'})`, () => {
      FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: shouldSucceed, doCheckIsValid: true }, newBatchC1, () => {
        itShouldHaveCapacity(expectedCapacityFromPreviousSuccessfulLeases, numberOfItems, newBatchC1);
        if (!shouldSucceed) {
          itShouldReturn409Conflict(newBatchC1);
        }
        if (itAdditionalTests) {
          itAdditionalTests();
        }
      });
    });

    return { c1: newBatchC1 };
  };

  const { c1: batchOneC1 } = describeNewBatchOfLeases({
    prerequisiteFlowStage: fetchOpportunities,
    numberOfItems: 3,
    shouldSucceed: true,
    // it should not take into account leased opportunities on this order
    expectedCapacityFromPreviousSuccessfulLeases: 5,
  });
  const { c1: batchTwoC1 } = describeNewBatchOfLeases({
    prerequisiteFlowStage: batchOneC1,
    numberOfItems: 10,
    shouldSucceed: false,
    expectedCapacityFromPreviousSuccessfulLeases: 2,
  }, () => {
    it('should return correct numbers of OpportunityCapacityIsReservedByLeaseError and OpportunityHasInsufficientCapacityError', () => {
      const errors = batchTwoC1.getOutput().httpResponse.body.orderedItem.map(oi => (
        oi.error && oi.error[0] && oi.error[0]['@type']));
      const factor = errors.length / 10;

      const count = (array, value) => array.filter(x => x === value).length;
      expect(count(errors, undefined)).to.equal(factor * 2);
      expect(count(errors, 'OpportunityCapacityIsReservedByLeaseError')).to.equal(factor * 3);
      expect(count(errors, 'OpportunityHasInsufficientCapacityError')).to.equal(factor * 5);
    });
  });
  const { c1: batchThreeC1 } = describeNewBatchOfLeases({
    prerequisiteFlowStage: batchTwoC1,
    numberOfItems: 2,
    shouldSucceed: true,
    expectedCapacityFromPreviousSuccessfulLeases: 2,
  });
  describeNewBatchOfLeases({
    prerequisiteFlowStage: batchThreeC1,
    numberOfItems: 1,
    shouldSucceed: false,
    expectedCapacityFromPreviousSuccessfulLeases: 0,
  });
});
