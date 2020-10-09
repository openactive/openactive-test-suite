const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

/**
 * @typedef {import('../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {InstanceType<import('../helpers/request-state')['RequestState']>} RequestState
 * @typedef {InstanceType<import('../shared-behaviours/c1')['C1']>} C1
 * @typedef {InstanceType<import('../shared-behaviours/c2')['C2']>} C2
 * @typedef {InstanceType<import('../shared-behaviours/b')['B']>} B
 */

class Common {

  /**
   * Note: This generates an it() block. Therefore, this must be run within a describe() block.
   *
   * @param {OpportunityCriteria[]} orderItemCriteria
   * @param {RequestState} state
   * @param {C1 | C2 | B} stage
   * @param {() => any} orderAccessor
   * @param {string} name Used for the it() test description
   * @param {(feedOrderItem: any, responseOrderItem: any, responseOrderItemErrorTypes: any) => void} cb
   */
  static itForOrderItem(orderItemCriteria, state, stage, orderAccessor, name, cb) {
    this.itForOrderItemByControl(orderItemCriteria, state, stage, orderAccessor, name, cb, name, cb);
  }

  /**
   * Note: This generates an it() block. Therefore, this must be run within a describe() block.
   *
   * @param {OpportunityCriteria[]} orderItemCriteria
   * @param {RequestState} state
   * @param {C1 | C2 | B} stage
   * @param {() => any} orderAccessor
   * @param {string} testName Used for the it() test description for order item criteria which are not controls
   * @param {(feedOrderItem: any, responseOrderItem: any, responseOrderItemErrorTypes: any) => void} testCb
   * @param {string} controlName Used for the it() test description for order item criteria which are controls
   * @param {(feedOrderItem: any, responseOrderItem: any, responseOrderItemErrorTypes: any) => void} controlCb
   */
  static itForOrderItemByControl(orderItemCriteria, state, stage, orderAccessor, testName, testCb, controlName, controlCb) {
    orderItemCriteria.forEach((c, i) => {
      if (controlName && !controlCb || !controlName && controlCb) {
        throw new Error("Either both controlName and controlCb must be set, or neither.")
      }

      if (!c.control || (c.control && controlName)) {
        it(`OrderItem at position ${i} ${c.control ? controlName : testName}`, () => {
          if (stage) stage.expectResponseReceived();

          const feedOrderItem = state.orderItems[i];

          expect(orderAccessor().orderedItem).to.be.an('array');

          const responseOrderItem = orderAccessor().orderedItem.find(x => x.position === feedOrderItem.position);

          const responseOrderItemErrorTypes = ((responseOrderItem && responseOrderItem.error) || []).map(x => x['@type']);

          const cb = c.control ? controlCb : testCb;

          cb(feedOrderItem, responseOrderItem, responseOrderItemErrorTypes);
        });
      }
    });
  }
}

module.exports = {
  Common
};
