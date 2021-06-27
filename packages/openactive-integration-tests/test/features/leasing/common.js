const { expect } = require('chai');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../helpers/flow-stages/flow-stage').OrderItem} OrderItem
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 */

/**
 * For each of the fetched OrderItems, get a batch of duplicates for that item.
 *
 * e.g. `multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, 3)` will return 3 of each OrderItem. This is
 * equivalent to the real life use case of someone booking an opportunity for themself and 2 friends.
 *
 * @param {FetchOpportunitiesFlowStageType} fetchOpportunities
 * @param {number} multiple
 */
function multiplyFetchedOrderItemsIntoBatches(fetchOpportunities, multiple) {
  const fetchedOrderItems = fetchOpportunities.getOutput().orderItems;

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
}

/**
 * Similar to Common.itForEachOrderItem. Though, this is used for when lease capacity tests
 * where Orders are made by getting the OrderItemCriteria and creating a batch of N OrderItems for each one
 * (e.g. 3 of each Order Item Criteria to test the scenario of someone ordering an opportunity for themself
 * and 2 other friends).
 *
 * @param {object} args
 * @param {OpportunityCriteria[]} args.orderItemCriteriaList
 * @param {() => ChakramResponse} args.getOrdersApiResponse HTTP response from an Orders API that includes
 *   OrderItems in the `.orderedItem` field. e.g. C1, C2 or B.
 * @param {number} args.batchMultiplier How many items are in each batch?
 * @param {string} testName Label used for it() block when checking OrderItems.
 * @param {(apiResponseOrderItem: any) => void} cb Callback which runs assertions on OrderItems.
 */
function itForEachOrderItemWhereOrderItemsAreBatched({
  orderItemCriteriaList,
  getOrdersApiResponse,
  batchMultiplier,
}, testName, cb) {
  const numOrderItems = orderItemCriteriaList.length * batchMultiplier;

  /* This test checks a pre-condition of the subsequent tests for each OrderItem - that the number
  of OrderItems is balanced with the number of Order Item Criteria */
  it('Should have the same number of OrderItems as criteria', () => {
    const apiResponseOrderedItem = getOrdersApiResponse().body.orderedItem;
    expect(apiResponseOrderedItem).to.be.an('array')
      .that.has.lengthOf.above(0)
      .and.has.lengthOf(numOrderItems);
  });
  for (let i = 0; i < numOrderItems; i += 1) {
    it(`OrderItem at position ${i} - ${testName}`, () => {
      const apiResponseOrderItem = getOrdersApiResponse().body.orderedItem.find(orderItem => (
        orderItem.position === i
      ));
      // eslint-disable-next-line no-unused-expressions
      expect(apiResponseOrderItem).to.not.be.null
        .and.to.not.be.undefined;
      cb(apiResponseOrderItem);
    });
  }
}

/**
 * (For leasing tests which use batches of OrderItems per test) check that every OrderItem has the
 * expected capacity.
 *
 * @param {object} args
 * @param {OpportunityCriteria[]} args.orderItemCriteriaList
 * @param {C1FlowStageType | C2FlowStageType} args.flowStage
 * @param {number} args.batchMultiplier
 * @param {number} args.expectedCapacity
 */
function itShouldHaveCapacityForBatchedItems({
  orderItemCriteriaList,
  flowStage,
  batchMultiplier,
  expectedCapacity,
}) {
  itForEachOrderItemWhereOrderItemsAreBatched({
    orderItemCriteriaList,
    getOrdersApiResponse: () => flowStage.getOutput().httpResponse,
    batchMultiplier,
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
}

/**
 * @param {object} args
 * @param {C1FlowStageType | C2FlowStageType} args.flowStage
 * @param {number} args.batchMultiplier
 * @param {number} args.numSuccessful Number of items per batch which should not have errors.
 * @param {number} args.numIsReservedByLeaseError Number of items per batch which should have "reserved by lease"
 *   errors.
 * @param {number} args.numHasInsufficientCapacityError Number of items per batch which should have "insufficient
 *   capacity" errors.
 */
function itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError({
  flowStage,
  batchMultiplier,
  numSuccessful,
  numIsReservedByLeaseError,
  numHasInsufficientCapacityError,
}) {
  it(numIsReservedByLeaseError === 1 && numHasInsufficientCapacityError === 0 ? 'should include an OpportunityCapacityIsReservedByLeaseError in the OrderItems' : 'should include correct numbers of OpportunityCapacityIsReservedByLeaseError and OpportunityHasInsufficientCapacityError in the OrderItems', () => {
    const errors = flowStage.getOutput().httpResponse.body.orderedItem.map(oi => (
      oi.error && oi.error[0] && oi.error[0]['@type']));
    const factor = errors.length / batchMultiplier;

    const count = (array, value) => array.filter(x => x === value).length;
    expect(count(errors, undefined)).to.equal(factor * numSuccessful);
    expect(count(errors, 'OpportunityCapacityIsReservedByLeaseError')).to.equal(factor * numIsReservedByLeaseError);
    expect(count(errors, 'OpportunityHasInsufficientCapacityError')).to.equal(factor * numHasInsufficientCapacityError);
  });
}

module.exports = {
  multiplyFetchedOrderItemsIntoBatches,
  itForEachOrderItemWhereOrderItemsAreBatched,
  itShouldHaveCapacityForBatchedItems,
  itShouldReturnCorrectNumbersOfIsReservedByLeaseErrorAndHasInsufficientCapacityError,
};
