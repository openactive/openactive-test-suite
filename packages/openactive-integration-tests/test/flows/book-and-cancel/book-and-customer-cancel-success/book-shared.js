const chakram = require("chakram");
const expect = chakram.expect;

const {Logger} = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");
const sharedValidationTests = require("../../../shared-behaviours/validation");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  const logger = new Logger(dataItem.name, this, {
    description: `A successful end to end booking and customer cancellation run.`
  });

  const state = new RequestState(logger);
  const flow = new FlowHelper(state);

  beforeAll(async function() {
    await state.createScheduledSession(testEvent);
    await flow.getMatch();

    return chakram.wait();
  });

  afterAll(async function() {
    await state.deleteScheduledSession();

    await testHelper.deleteOrder(state.uuid, {
      sellerId: state.sellerId
    });
    return chakram.wait();
  });

  describe("C1", function() {
    beforeAll(async function() {
      await flow.C1();
    });

    it("should return 200 on success", function() {
      expect(state.c1Response).to.have.status(200);
    });

    it("should return newly created event", function() {
      expect(state.c1Response).to.have.json(
        "orderedItem[0].orderedItem.@type",
        "ScheduledSession"
      );
      expect(state.c1Response).to.have.json(
        "orderedItem[0].orderedItem.superEvent.name",
        eventName
      );
    });

    it("offer should have price of " + price, function() {
      expect(state.c1Response).to.have.json(
        "orderedItem[0].acceptedOffer.price",
        price
      );
    });

    it("C1 Order or OrderQuote should have one orderedItem", function() {
      expect(state.c1Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    sharedValidationTests.shouldBeValidResponse(() => state.c1Response, "C1", logger, {
        validationMode: "C1Response"
      }
    );
  });

  describe("C2", function() {
    beforeAll(async function() {
      await flow.C2();
    });

    it("should return 200 on success", async function() {
      expect(state.c2Response).to.have.status(200);
    });

    it("offer should have price of " + price, async function() {
      expect(state.c2Response).to.have.json(
        "orderedItem[0].acceptedOffer.price",
        price
      );
    });

    it("Order or OrderQuote should have one orderedItem", async function() {
      expect(state.c2Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    sharedValidationTests.shouldBeValidResponse(
      () => state.c2Response,
      "C2",
      logger,
      {
        validationMode: "C2Response"
      }
    );
  });

  describe("B", function() {
    beforeAll(async function() {
      await flow.B();
    });

    it("should return 200 on success", function() {
      expect(state.bResponse).to.have.status(200);
    });

    it("should have price of " + price, function() {
      expect(state.bResponse).to.have.json(
        "orderedItem[0].acceptedOffer.price",
        price
      );
    });

    it("B Order or OrderQuote should have one orderedItem", function() {
      expect(state.bResponse).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    it("Result from B should OrderItemConfirmed orderItemStatus", function() {
      expect(state.bResponse).to.have.json(
        "orderedItem[0].orderItemStatus",
        "https://openactive.io/OrderItemConfirmed"
      );
    });

    sharedValidationTests.shouldBeValidResponse(() => state.bResponse, "B", logger, {
      validationMode: "BResponse"
    });
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
      "Orders feed OrderItem should correct price of " + price,
      function() {
        expect(state.ordersFeedUpdate).to.have.json(
          "data.orderedItem[0].acceptedOffer.price",
          price
        );
      }
    );

    it("Orders feed totalPaymentDue should be correct", function() {
      expect(state.ordersFeedUpdate).to.have.json(
        "data.totalPaymentDue.price",
        0
      );
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

    sharedValidationTests.shouldBeValidResponse(() => state.ordersFeedUpdate, "Orders feed", logger, {
      validationMode: "OrdersFeed",
    });
  });
}

module.exports = {
  performTests
};
