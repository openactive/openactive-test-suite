const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class Common {

  static itForOrderItem(orderItemCriteria, state, stage, responseAccessor, name, cb) {
    this.itForOrderItemByControl(orderItemCriteria, state, stage, responseAccessor, name, cb, name, cb);
  }

  static itForOrderItemByControl(orderItemCriteria, state, stage, responseAccessor, testName, testCb, controlName, controlCb) {
    orderItemCriteria.forEach((c, i) => {
      it(`OrderItem at position ${i} ${c.control ? controlName : testName}`, () => {
        stage.expectResponseReceived();

        const feedOrderItem = state.orderItems[i];

        expect(responseAccessor().body.orderedItem).to.be.an('array');

        const responseOrderItem = responseAccessor().body.orderedItem.find(x => x.position === feedOrderItem.position);

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
