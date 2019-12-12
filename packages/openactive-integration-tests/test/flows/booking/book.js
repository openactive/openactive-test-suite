const chakram = require("chakram");
const RequestHelper = require("../../helpers/request-helper");
const Logger = require("../../helpers/logger");
const withData = require("leche").withData;

const expect = chakram.expect;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var data = {
  "single session, 5 spaces, free": {
    title: "Single session, 5 spaces, free",
    name: "OpenActiveTestEvent2",
    price: 0,
    event: {
      "@context": "https://openactive.io/",
      "@type": "ScheduledSession",
      superEvent: {
        "@type": "SessionSeries",
        name: "OpenActiveTestEvent2",
        offers: [
          {
            "@type": "Offer",
            price: 0
          }
        ]
      },
      startDate: "2019-11-20T17:26:16.0731663+00:00",
      endDate: "2019-11-20T19:12:16.0731663+00:00",
      maximumAttendeeCapacity: 5
    }
  },
  "single session, 5 spaces, non-free": {
    title: "Single session, 5 spaces, non-free",
    name: "OpenActiveTestEvent1",
    price: 14.95,
    event: {
      "@context": "https://openactive.io/",
      "@type": "ScheduledSession",
      superEvent: {
        "@type": "SessionSeries",
        name: "OpenActiveTestEvent1",
        offers: [
          {
            "@type": "Offer",
            price: 14.95
          }
        ]
      },
      startDate: "2019-11-20T17:26:16.0731663+00:00",
      endDate: "2019-11-20T19:12:16.0731663+00:00",
      maximumAttendeeCapacity: 5
    }
  }
};

withData(data, function(dataItem) {
  describe("Basic end-to-end booking", function() {
    this.timeout(10000);

    var testEvent = dataItem.event;
    var price = dataItem.price;
    var eventName = dataItem.name;

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
    var ordersFeedUpdate;

    const logger = new Logger(dataItem.title);

    const testHelper = new RequestHelper(logger);

    before(function() {
      logger.log(
        "\n\n** Test Event **: \n\n" + JSON.stringify(testEvent, null, 2)
      );

      uuid = testHelper.uuid();

      const orderResponse = testHelper.getOrder(uuid).then(res => {
        ({ ordersFeedUpdate } = res);
      });

      const apiResponse = (async () => {
        ({ opportunityId, offerId, sellerId } = await testHelper.getMatch(
          eventName
        ));

        ({
          c1Response,
          totalPaymentDue
        } = await testHelper.putOrderQuoteTemplate(uuid, {
          opportunityId,
          offerId,
          sellerId,
          uuid
        }));

        ({ c2Response, totalPaymentDue } = await testHelper.putOrderQuote(
          uuid,
          {
            opportunityId,
            offerId,
            sellerId,
            uuid
          }
        ));

        ({ bResponse, orderItemId } = await testHelper.putOrder(uuid, {
          opportunityId,
          offerId,
          sellerId,
          uuid,
          totalPaymentDue
        }));

        ({ uResponse } = await testHelper.cancelOrder(uuid, {
          orderItemId,
          sellerId
        }));
      })();

      (async () => {
        await testHelper.delay(500);
        await testHelper.createScheduledSession(testEvent, {
          sellerId
        });
      })();

      return chakram.all([apiResponse, orderResponse]);
    });

    after(async function() {
      await testHelper.deleteScheduledSession(eventName, {
        sellerId
      });
      await testHelper.deleteOrder(uuid, {
        sellerId
      });
    });

    it("should return 200 on success", function() {
      expect(c1Response).to.have.status(200);
      expect(c2Response).to.have.status(200);
      expect(bResponse).to.have.status(200);
      return chakram.wait();
    });

    it("should return newly created event", function() {
      expect(c1Response).to.have.json(
        "orderedItem[0].orderedItem.@type",
        "ScheduledSession"
      );
      expect(c1Response).to.have.json(
        "orderedItem[0].orderedItem.superEvent.name",
        eventName
      );
      return chakram.wait();
    });

    it("offer should have price of " + price, function() {
      expect(c1Response).to.have.json(
        "orderedItem[0].acceptedOffer.price",
        price
      );
      expect(c2Response).to.have.json(
        "orderedItem[0].acceptedOffer.price",
        price
      );
      expect(bResponse).to.have.json(
        "orderedItem[0].acceptedOffer.price",
        price
      );
      return chakram.wait();
    });

    it("Order or OrderQuote should have one orderedItem", function() {
      expect(c1Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
      expect(c2Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
      expect(bResponse).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
      return chakram.wait();
    });

    it("Result from B should OrderConfirmed orderItemStatus", function() {
      return expect(bResponse).to.have.json(
        "orderedItem[0].orderItemStatus",
        "https://openactive.io/OrderConfirmed"
      );
    });

    it("Orders feed result should have one orderedItem", function() {
      return expect(ordersFeedUpdate).to.have.schema("data.orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    it("Orders feed OrderItem should correct price of " + price, function() {
      return expect(ordersFeedUpdate).to.have.json(
        "data.orderedItem[0].acceptedOffer.price",
        price
      );
    });

    it("Orders feed totalPaymentDue should be correct", function() {
      return expect(ordersFeedUpdate).to.have.json(
        "data.totalPaymentDue.price",
        0
      );
    });

    it("Order Cancellation return 204 on success", function() {
      return expect(uResponse).to.have.status(204);
    });

    it("Orders feed should have CustomerCancelled as orderItemStatus", function() {
      return expect(ordersFeedUpdate).to.have.json(
        "data.orderedItem[0].orderItemStatus",
        "https://openactive.io/CustomerCancelled"
      );
    });
  });
});
