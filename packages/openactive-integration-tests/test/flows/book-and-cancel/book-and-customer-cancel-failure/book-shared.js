const chakram = require("chakram");
const expect = chakram.expect;
const {Logger} = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");
const sharedValidationTests = require("../../../shared-behaviours/validation");
const {C1} = require("../../../shared-behaviours/c1");
const {C2} = require("../../../shared-behaviours/c2");
const {B} = require("../../../shared-behaviours/B");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  const logger = new Logger(dataItem.name, this, {
    description: `End to end booking and cancellation. Cancellation is expected to fail as Opportunity.startDate is in the past.`
  });

  const state = new RequestState(logger);
  const flow = new FlowHelper(state);

  beforeAll(async function() {
    await state.createOpportunity(dataItem);
    await flow.getMatch();

    return chakram.wait();
  });

  afterAll(async function() {
    await state.deleteOpportunity();

    await testHelper.deleteOrder(state.uuid, {
      sellerId: state.sellerId
    });
    return chakram.wait();
  });

  describe("C1", function() {
    (new C1({state, flow, logger, dataItem}))
    .beforeSetup()
    .successChecks()
    .validationTests();
  });

  describe("C2", function() {
    (new C2({state, flow, logger, dataItem}))
    .beforeSetup()
    .successChecks()
    .validationTests();
  });

  describe("B", function() {
    (new B({state, flow, logger, dataItem}))
    .beforeSetup()
    .successChecks()
    .validationTests();
  });

  describe("Orders Feed", function() {
    beforeAll(async function() {
      await flow.getFeedUpdate();
    });

    it("Orders feed result should have one orderedItem", function() {
      expect(state.ordersFeedUpdate).to.have.schema("data.orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    it(
      "Orders feed OrderItem should correct price of " + price, function() {
        expect(state.ordersFeedUpdate).to.have.json(
          "data.orderedItem[0].acceptedOffer.price",
          price
        );
      }
    );

    it("Orders feed totalPaymentDue should be correct", function() {
      expect(state.ordersFeedUpdate).to.have.json("data.totalPaymentDue.price", 0);
    });

    it("Order Cancellation return 204 on success", function() {
      expect(state.uResponse).to.have.status(204);
    });

    it("Orders feed should have CustomerCancelled as orderItemStatus", function() {
      expect(state.ordersFeedUpdate).to.have.json(
        "data.orderedItem[0].orderItemStatus",
        "https://openactive.io/CustomerCancelled"
      );
    });

    it("Order Cancellation return 400 on error", function() {
      expect(state.uResponse).to.have.status(400);
    });

    it("Order Cancellation should return CancellationNotPermittedError", function() {
      expect(state.uResponse).to.have.json("@type", "CancellationNotPermittedError");
    });

    sharedValidationTests.shouldBeValidResponse(
      () => state.ordersFeedUpdate,
      "Orders feed",
      logger,
      {
        validationMode: "OrdersFeed",
      }
    );
  });
}

module.exports = {
  performTests
};
