const chakram = require("chakram");
const RequestHelper = require("../../helpers/request-helper");
const Logger = require("../../helpers/logger");
const sharedValidationTests = require("../../shared-behaviours/validation");
const pMemoize = require("p-memoize");

const expect = chakram.expect;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function performTests(dataItem) {
  describe("Basic end-to-end booking", function() {
    // this.timeout(10000);

    const { event: testEvent, price, name: eventName } = dataItem;

    var opportunityId;
    var offerId;
    var sellerId;
    var uuid;
    var totalPaymentDue;
    var orderItemId;

    var c1Response;
    var c2Response;
    var bResponse;
    var uResponse;
    var getOrderPromise;
    var ordersFeedUpdate;

    const logger = new Logger(dataItem.title);

    const testHelper = new RequestHelper(logger);

    beforeAll(async function() {
      logger.log(
        "\n\n** Test Event **: \n\n" + JSON.stringify(testEvent, null, 2)
      );

      uuid = testHelper.uuid();

      // get the getMatch in before we create the session (helps with race conditions)
      performGetMatch();

      let session = await testHelper.createScheduledSession(testEvent, {
        sellerId
      });

      return chakram.wait();
    });

    afterAll(async function() {
      // by the end, it should have done this already, but let's force it through if it hasn't

      await testHelper.deleteScheduledSession(eventName, {
        sellerId
      });
      await testHelper.deleteOrder(uuid, {
        sellerId
      });
      return chakram.wait();
    });

    const performGetMatch = pMemoize(async function performGetMatch() {
      ({ opportunityId, offerId, sellerId } = await testHelper.getMatch(
        eventName
      ));
    });

    const performC1 = pMemoize(async function performC1() {
      await performGetMatch();

      ({ c1Response, totalPaymentDue } = await testHelper.putOrderQuoteTemplate(
        uuid,
        {
          opportunityId,
          offerId,
          sellerId,
          uuid
        }
      ));
    });

    const performC2 = pMemoize(async function performC2() {
      await performC1();

      ({ c2Response, totalPaymentDue } = await testHelper.putOrderQuote(uuid, {
        opportunityId,
        offerId,
        sellerId,
        uuid
      }));
    });

    const performB = pMemoize(async function performB() {
      getOrderPromise = testHelper.getOrder(uuid).then(res => {
        ({ ordersFeedUpdate } = res);
      });

      await performC2();

      ({ bResponse, orderItemId } = await testHelper.putOrder(uuid, {
        opportunityId,
        offerId,
        sellerId,
        uuid,
        totalPaymentDue
      }));
    });

    // cancel
    const performU = pMemoize(async function performU() {
      await performB();

      ({ uResponse } = await testHelper.cancelOrder(uuid, {
        orderItemId,
        sellerId
      }));
    });

    const performGetFeedUpdate = pMemoize(
      async function performGetFeedUpdate() {
        await performU();

        await getOrderPromise;
      }
    );

    describe("C1", function() {
      beforeAll(async function() {
        await performC1();
      });

      it("should return 200 on success", async function() {
        expect(c1Response).to.have.status(200);
      });

      it("should return 200 on success", async function() {
        expect(bResponse).to.have.status(200);
      });

      it("should return newly created event", async function() {
        expect(c1Response).to.have.json(
          "orderedItem[0].orderedItem.@type",
          "ScheduledSession"
        );
        expect(c1Response).to.have.json(
          "orderedItem[0].orderedItem.superEvent.name",
          eventName
        );
      });

      it("offer should have price of " + price, async function() {
        expect(c1Response).to.have.json(
          "orderedItem[0].acceptedOffer.price",
          price
        );
      });

      it("C1 Order or OrderQuote should have one orderedItem", async function() {
        expect(c1Response).to.have.schema("orderedItem", {
          minItems: 1,
          maxItems: 1
        });
      });

      sharedValidationTests.shouldBeValidResponse(() => c1Response.body, "C1", {
        validationMode: "C1Response"
      });
    });

    describe("C2", function() {
      beforeAll(async function() {
        await performC2();
      });

      it("should return 200 on success", async function() {
        expect(c2Response).to.have.status(200);
      });

      it("offer should have price of " + price, async function() {
        expect(c2Response).to.have.json(
          "orderedItem[0].acceptedOffer.price",
          price
        );
      });

      it("Order or OrderQuote should have one orderedItem", async function() {
        expect(c2Response).to.have.schema("orderedItem", {
          minItems: 1,
          maxItems: 1
        });
      });

      sharedValidationTests.shouldBeValidResponse(() => c2Response.body, "C2", {
        validationMode: "C2Response"
      });
    });

    describe("B", function() {
      beforeAll(async function() {
        await performB();
      });

      it("should have price of " + price, async function() {
        expect(bResponse).to.have.json(
          "orderedItem[0].acceptedOffer.price",
          price
        );
      });

      it("B Order or OrderQuote should have one orderedItem", async function() {
        expect(bResponse).to.have.schema("orderedItem", {
          minItems: 1,
          maxItems: 1
        });
      });

      it("Result from B should OrderConfirmed orderItemStatus", async function() {
        return expect(bResponse).to.have.json(
          "orderedItem[0].orderItemStatus",
          "https://openactive.io/OrderConfirmed"
        );
      });

      sharedValidationTests.shouldBeValidResponse(() => bResponse.body, "B", {
        validationMode: "BResponse"
      });
    });

    describe("Orders Feed", function() {
      beforeAll(async function() {
        await performGetFeedUpdate();
      });

      it("Orders feed result should have one orderedItem", async function() {
        return expect(ordersFeedUpdate).to.have.schema("data.orderedItem", {
          minItems: 1,
          maxItems: 1
        });
      });

      it(
        "Orders feed OrderItem should correct price of " + price,
        async function() {
          return expect(ordersFeedUpdate).to.have.json(
            "data.orderedItem[0].acceptedOffer.price",
            price
          );
        }
      );

      it("Orders feed totalPaymentDue should be correct", async function() {
        return expect(ordersFeedUpdate).to.have.json(
          "data.totalPaymentDue.price",
          0
        );
      });

      it("Order Cancellation return 204 on success", async function() {
        return expect(uResponse).to.have.status(204);
      });

      it("Orders feed should have CustomerCancelled as orderItemStatus", async function() {
        return expect(ordersFeedUpdate).to.have.json(
          "data.orderedItem[0].orderItemStatus",
          "https://openactive.io/CustomerCancelled"
        );
      });

      sharedValidationTests.shouldBeValidResponse(
        () => ordersFeedUpdate.body,
        "Orders feed"
      );
    });
  });
}

module.exports = {
  performTests
};
