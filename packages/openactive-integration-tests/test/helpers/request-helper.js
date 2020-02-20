const assert = require("assert");
const chakram = require("chakram");
const mustache = require("mustache");
const uuidv5 = require("uuid/v5");
const fs = require("fs");
const config = require("config");

var BOOKING_API_BASE = config.get("tests.bookingApiBase");
var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");
var USE_RANDOM_OPPORTUNITIES = config.get("tests.useRandomOpportunities");

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
      "Content-Type": "application/vnd.openactive.booking+json; version=1",
      "X-OpenActive-Test-Client-Id": "test",
      "X-OpenActive-Test-Seller-Id": sellerId
    };
  }

  bookingTemplate(logger, templateJson, replacementMap, removePayment) {
    if (typeof replacementMap.totalPaymentDue !== "undefined" && templateJson.totalPaymentDue)
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

    return ordersFeedUpdate;
  }

  async getMatch(eventId) {
    const respObj = await chakram.get(
      MICROSERVICE_BASE + "get-cached-opportunity/" + encodeURIComponent(eventId)
    );
    const rpdeItem = respObj.body;

    this.log(
      "\n\n** Opportunity RPDE excerpt **: \n\n" +
        JSON.stringify(rpdeItem, null, 2)
    );

    return respObj;
  }

  async putOrderQuoteTemplate(uuid, params) {
    let payload = this.bookingTemplate(this.logger, c1req, params);

    this.logger && this.logger.recordRequest('C1', payload);

    let c1Response = await chakram.put(
      BOOKING_API_BASE + "order-quote-templates/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    this.logger && this.logger.recordResponse('C1', c1Response);

    this.log(
      "\n\n** C1 response: ** \n\n" + JSON.stringify(c1Response.body, null, 2)
    );

    return c1Response;
  }

  async putOrderQuote(uuid, params) {
    const payload = this.bookingTemplate(this.logger, c2req, params);

    this.logger && this.logger.recordRequest('C2', payload);

    const c2Response = await chakram.put(
      BOOKING_API_BASE + "order-quotes/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    this.logger && this.logger.recordResponse('C2', c2Response);

    this.log(
      "\n\n** C2 response: ** \n\n" + JSON.stringify(c2Response.body, null, 2)
    );
    return c2Response;
  }

  async putOrder(uuid, params) {
    const payload = this.bookingTemplate(this.logger, breq, params, true);

    this.logger && this.logger.recordRequest('B', payload);

    const bResponse = await chakram.put(
      BOOKING_API_BASE + "orders/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    this.logger && this.logger.recordResponse('B', payload);

    this.log(
      "\n\n** B response:" +
        bResponse.response.statusCode +
        " **\n\n" +
        JSON.stringify(bResponse.body, null, 2)
    );

    return bResponse;
  }

  async cancelOrder(uuid, params) {
    const payload = this.bookingTemplate(this.logger, ureq, params);

    this.logger && this.logger.recordRequest('U', payload);

    const uResponse = await chakram.patch(
      BOOKING_API_BASE + "orders/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    this.logger && this.logger.recordResponse('U', payload);

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

    return uResponse;
  }

  async createScheduledSession(event, params) {
    let respObj;
    if (USE_RANDOM_OPPORTUNITIES) {
      respObj = await chakram.get(
        "http://localhost:3000/get-random-opportunity"
      )
    }
    else {
      respObj = await chakram.post(
        BOOKING_API_BASE + "test-interface/scheduledsession",
        event,
        {
          headers: this.createHeaders(params.sellerId)
        }
      );
    }

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

    this.logger && this.logger.recordResponse('create-session', respObj);

    return respObj;
  }

  async deleteScheduledSession(eventId, params = {}) {
    if (USE_RANDOM_OPPORTUNITIES) return null;

    const respObj = await chakram.delete(
      BOOKING_API_BASE +
        "test-interface/scheduledsession/" +
        encodeURIComponent(eventId),
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

    this.logger && this.logger.recordResponse('delete-session', respObj);

    return respObj;
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

    this.logger && this.logger.recordResponse('delete-order', respObj);

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
