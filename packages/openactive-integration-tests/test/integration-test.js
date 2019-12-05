const assert = require("assert");
const chakram = require("chakram");
const mustache = require("mustache");
const uuidv5 = require("uuid/v5");
const fs = require("fs");
const config = require("config");
const TestHelper = require("./test-helper");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const c1req = require("./c1-req.json");
const c2req = require("./c2-req.json");
const breq = require("./b-req.json");
const ureq = require("./u-req.json");

var BOOKING_API_BASE = config.get("tests.bookingApiBase");
var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");

var MEDIA_TYPE_HEADERS = {
  "Content-Type": "application/vnd.openactive.booking+json; version=1"
};

var expect = chakram.expect;

function bookingRequest(logger, templateJson, replacementMap, removePayment) {
  if (typeof replacementMap.totalPaymentDue !== "undefined")
    templateJson.totalPaymentDue.price = replacementMap.totalPaymentDue;
  var template = JSON.stringify(templateJson, null, 2);

  var req = mustache.render(template, replacementMap);

  logger.log("\n\n** REQUEST **: \n\n" + req);

  jsonResult = JSON.parse(req);
  if (removePayment) delete jsonResult.payment;
  return jsonResult;
}

function delay(t, v) {
  return new Promise(function(resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}

describe("Create test event", function() {
  this.timeout(10000);

  var apiResponse;

  var testEvent = {
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    superEvent: {
      "@type": "SessionSeries",
      name: "Testevent2",
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
  };

  before(function() {
    apiResponse = chakram.get(MICROSERVICE_BASE + "get-match/Testevent2");

    delay(500).then(x =>
      chakram.post(
        BOOKING_API_BASE + "test-interface/scheduledsession",
        testEvent,
        {
          headers: MEDIA_TYPE_HEADERS
        }
      )
    );

    return apiResponse;
  });

  after(function() {
    var name = testEvent.superEvent.name;
    return chakram.delete(
      BOOKING_API_BASE +
        "test-interface/scheduledsession/" +
        encodeURIComponent(name),
      {
        headers: MEDIA_TYPE_HEADERS
      }
    );
  });

  it("should return 200 on success", function() {
    return expect(apiResponse).to.have.status(200);
  });

  it("should return newly created event", function() {
    expect(apiResponse).to.have.json("data.@type", "ScheduledSession");
    expect(apiResponse).to.have.json("data.superEvent.name", "Testevent2");
    return chakram.wait();
  });

  it("should have one offer", function() {
    return expect(apiResponse).to.have.schema("data.superEvent.offers", {
      minItems: 1,
      maxItems: 1
    });
  });

  it("offer should have price of 14.95", function() {
    return expect(apiResponse).to.have.json(
      "data.superEvent.offers[0].price",
      14.95
    );
  });
});

var data = [
  {
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
  {
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
];
var testWithData = function(dataItem) {
  return function() {
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

      var logger = {
        workingLog: "",
        flush: function() {
          var filename = "./output/" + dataItem.title + ".txt";
          fs.writeFile(filename, this.workingLog, function(err) {
            if (err) {
              return console.log(err);
            }

            //console.log("FILE SAVED: " + filename);
          });
        },
        log: function(text) {
          this.workingLog += text + "\n";
          this.flush(); // TODO: Do we need to flush on each write?
        }
      };

      const testHelper = new TestHelper(logger);

      before(function() {
        logger.log(
          "\n\n** Test Event **: \n\n" + JSON.stringify(testEvent, null, 2)
        );

        uuid = uuidv5(
          "https://www.example.com/example/id/" +
            Math.floor(Math.random() * 100000),
          uuidv5.URL
        ); //TODO: generate uuid v5 based on Seller ID - and fix this so it is unique

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
            orderItemId
          }));
        })();

        (async () => {
          await testHelper.delay(500);
          await testHelper.createScheduledSession(testEvent);
        })();

        return chakram.all([apiResponse, orderResponse]);
      });

      after(async function() {
        await testHelper.deleteScheduledSession(eventName);
        await testHelper.deleteOrder(uuid);
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
  };
};

data.forEach(function(dataItem) {
  describe(dataItem.title, testWithData(dataItem));
});
