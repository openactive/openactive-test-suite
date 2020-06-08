const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class Common {

  static itForOrderItem(orderItemCriteria, state, stage, orderAccessor, name, cb) {
    this.itForOrderItemByControl(orderItemCriteria, state, stage, orderAccessor, name, cb, name, cb);
  }

  static itForOrderItemByControl(orderItemCriteria, state, stage, orderAccessor, testName, testCb, controlName, controlCb) {
    orderItemCriteria.forEach((c, i) => {
      it(`OrderItem at position ${i} ${c.control ? controlName : testName}`, () => {
        if (stage) stage.expectResponseReceived();

        const feedOrderItem = state.orderItems[i];

        expect(orderAccessor().orderedItem).to.be.an('array');

        const responseOrderItem = orderAccessor().orderedItem.find(x => x.position === feedOrderItem.position);

        const responseOrderItemErrorTypes = (responseOrderItem.error || []).map(x => x['@type']);

        const cb = c.control ? controlCb : testCb;

        cb(feedOrderItem, responseOrderItem, responseOrderItemErrorTypes);
      });
    });
  }
}

module.exports = {
  Common
};
