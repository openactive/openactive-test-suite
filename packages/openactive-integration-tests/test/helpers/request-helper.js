const assert = require("assert");
const chakram = require("chakram");
const mustache = require("mustache");
const uuidv5 = require("uuid/v5");
const fs = require("fs");
const config = require("config");

var BOOKING_API_BASE = config.get("tests.bookingApiBase");
var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");

var MEDIA_TYPE_HEADERS = {
  "Content-Type": "application/vnd.openactive.booking+json; version=1"
};

const c1req = require("../templates/c1-req.json");
const c2req = require("../templates/c2-req.json");
const breq = require("../templates/b-req.json");
const ureq = require("../templates/u-req.json");

class RequestHelper {
  constructor(logger) {
    this.logger = logger;
  }

  log(msg) {
    if (!this.logger) return;

    this.logger.log(msg);
  }

  createHeaders(sellerId) {
    return {
      'Content-Type': 'application/vnd.openactive.booking+json; version=1',
      'X-OpenActive-Test-Client-Id': 'test',
      'X-OpenActive-Test-Seller-Id': sellerId
    };
  }

  bookingTemplate(logger, templateJson, replacementMap, removePayment) {
    if (typeof replacementMap.totalPaymentDue !== "undefined")
      templateJson.totalPaymentDue.price = replacementMap.totalPaymentDue;
    var template = JSON.stringify(templateJson, null, 2);

    var req = mustache.render(template, replacementMap);

    logger.log("\n\n** REQUEST **: \n\n" + req);

    let jsonResult = JSON.parse(req);
    if (removePayment) delete jsonResult.payment;
    return jsonResult;
  }

  async getOrder(uuid) {
    const ordersFeedUpdate = await chakram.get(
      MICROSERVICE_BASE + "get-order/" + uuid
    );
    const rpdeItem = ordersFeedUpdate.body;

    this.log(
      "\n\n** Orders RPDE excerpt " +
      ordersFeedUpdate.response.statusCode +
      "**: \n\n" +
      JSON.stringify(rpdeItem, null, 2)
    );

    return {
      rpdeItem,
      ordersFeedUpdate
    };
  }

  async getMatch(eventName) {
    const respObj = await chakram.get(
      MICROSERVICE_BASE + "get-match/" + encodeURIComponent(eventName)
    );
    const rpdeItem = respObj.body;

    this.log(
      "\n\n** Opportunity RPDE excerpt **: \n\n" +
        JSON.stringify(rpdeItem, null, 2)
    );

    let opportunityId, offerId, sellerId;

    if (rpdeItem) {
      opportunityId = rpdeItem.data["@id"]; // TODO : Support duel feeds: .subEvent[0]
      offerId = rpdeItem.data.superEvent.offers[0]["@id"];
      sellerId = rpdeItem.data.superEvent.organizer["@id"];
    }

    this.log(`opportunityId: ${opportunityId}; offerId: ${offerId}`);

    return {
      apiResponse: respObj,
      opportunityId,
      offerId,
      sellerId
    };
  }

  async putOrderQuoteTemplate(uuid, params) {
    let c1Response = await chakram.put(
      BOOKING_API_BASE + "order-quote-templates/" + uuid,
      this.bookingTemplate(this.logger, c1req, params),
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    this.log(
      "\n\n** C1 response: ** \n\n" + JSON.stringify(c1Response.body, null, 2)
    );
    const totalPaymentDue = c1Response.body.totalPaymentDue.price;

    return {
      c1Response,
      totalPaymentDue
    };
  }

  async putOrderQuote(uuid, params) {
    const c2Response = await chakram.put(
      BOOKING_API_BASE + "order-quotes/" + uuid,
      this.bookingTemplate(this.logger, c2req, params),
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    this.log(
      "\n\n** C2 response: ** \n\n" + JSON.stringify(c2Response.body, null, 2)
    );
    const totalPaymentDue = c2Response.body.totalPaymentDue.price;

    return {
      c2Response,
      totalPaymentDue
    };
  }

  async putOrder(uuid, params) {
    const bResponse = await chakram.put(
      BOOKING_API_BASE + "orders/" + uuid,
      this.bookingTemplate(this.logger, breq, params, true),
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    this.log(
      "\n\n** B response:" +
      bResponse.response.statusCode +
      " **\n\n" +
      JSON.stringify(bResponse.body, null, 2)
    );
    const orderItemId =
      bResponse.body && bResponse.body.orderedItem
        ? bResponse.body.orderedItem[0]["@id"]
        : "NONE";

    return {
      bResponse,
      orderItemId
    };
  }

  async cancelOrder(uuid, params) {
    const uResponse = await chakram.patch(
      BOOKING_API_BASE + "orders/" + uuid,
      this.bookingTemplate(this.logger, ureq, params),
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    if (uResponse.body) {
      this.log(
        "\n\n** Order Cancellation response: " +
        respObj.response.statusCode +
        " **\n\n" +
          JSON.stringify(uResponse.body, null, 2)
      );
    } else {
      this.log("\n\n** Order Cancellation response: **\n\nNO CONTENT");
    }

    return {
      uResponse
    };
  }

  async createScheduledSession(event, params) {
    const respObj = await chakram.post(
      BOOKING_API_BASE + "test-interface/scheduledsession",
      event,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    if (respObj.body) {
      this.log(
        "\n\n** Test Interface POST response: " +
          respObj.response.statusCode +
          " **\n\n" +
          JSON.stringify(respObj.body, null, 2)
      );
    } else {
      this.log(
        "\n\n** Test Interface POST response: " +
          respObj.response.statusCode +
          " **\n\nNO CONTENT"
      );
    }

    return {
      respObj
    };
  }

  async deleteScheduledSession(eventName, params = {}) {
    const respObj = await chakram.delete(
      BOOKING_API_BASE +
        "test-interface/scheduledsession/" +
        encodeURIComponent(eventName),
      null,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    if (respObj.body) {
      this.log(
        "\n\n** Test Interface DELETE response: " +
          respObj.response.statusCode +
          " **\n\n" +
          JSON.stringify(respObj.body, null, 2)
      );
    } else {
      this.log(
        "\n\n** Test Interface DELETE response: " +
          respObj.response.statusCode +
          " **\n\nNO CONTENT"
      );
    }

    return {respObj};
  }

  async deleteOrder(uuid, params) {
    const respObj = await chakram.delete(
      BOOKING_API_BASE + "orders/" + uuid,
      null,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    if (respObj.body) {
      this.log(
        "\n\n** Orders DELETE response: " +
          respObj.response.statusCode +
          " **\n\n" +
          JSON.stringify(respObj.body, null, 2)
      );
    } else {
      this.log(
        "\n\n** Orders DELETE response: " +
          respObj.response.statusCode +
          " **\n\nNO CONTENT"
      );
    }

    return !!respObj.body;
  }

  delay(t, v) {
    return new Promise(function(resolve) {
      setTimeout(resolve.bind(null, v), t);
    });
  }

  uuid(sellerId = null) {
    return uuidv5(
      "https://www.example.com/example/id/" +
      Math.floor(Math.random() * 100000),
      uuidv5.URL
    ); //TODO: generate uuid v5 based on Seller ID - and fix this so it is unique
  }
}

module.exports = RequestHelper;
