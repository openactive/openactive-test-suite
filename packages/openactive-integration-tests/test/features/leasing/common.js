const { expect } = require('chai');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 */

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

module.exports = {
  itForEachOrderItemWhereOrderItemsAreBatched,
};
