const assert = require("assert");
const chakram = require("chakram");
const uuidv5 = require("uuid/v5");
const fs = require("fs");
const config = require("config");

var BOOKING_API_BASE = config.get("tests.bookingApiBase");
var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");
var USE_RANDOM_OPPORTUNITIES = config.get("tests.useRandomOpportunities");

var MEDIA_TYPE_HEADERS = {
  "Content-Type": "application/vnd.openactive.booking+json; version=1"
};

const c1req = require("../templates/c1-req.js");
const c2req = require("../templates/c2-req.js");
const breq = require("../templates/b-req.js");
const ureq = require("../templates/u-req.js");

class RequestHelper {
  constructor(logger) {
    this.logger = logger;
  }

  createHeaders(sellerId) {
    return {
      "Content-Type": "application/vnd.openactive.booking+json; version=1",
      "X-OpenActive-Test-Client-Id": "test",
      "X-OpenActive-Test-Seller-Id": sellerId
    };
  }

  bookingTemplate(logger, templateJson, replacementMap, removePayment) {
    let jsonResult = templateJson(replacementMap, removePayment);
    if (removePayment) delete jsonResult.payment;

    return jsonResult;
  }

  async getOrder(uuid) {
    const ordersFeedUpdate = await chakram.get(
      MICROSERVICE_BASE + "get-order/" + uuid,
      {
        timeout: 30000
      }
    );
    const rpdeItem = ordersFeedUpdate.body;

    this.logger && this.logger.recordResponse('get-order', ordersFeedUpdate);

    return ordersFeedUpdate;
  }

  async getMatch(eventId) {
    const respObj = await chakram.get(
      MICROSERVICE_BASE + "get-cached-opportunity/" + encodeURIComponent(eventId),
      {
        timeout: 60000
      }
    );
    const rpdeItem = respObj.body;

    this.logger && this.logger.recordResponse('get-match', respObj);

    return respObj;
  }

  async putOrderQuoteTemplate(uuid, params) {
    let payload = this.bookingTemplate(this.logger, c1req, params);

    this.logger && this.logger.recordRequest('C1', payload);

    let c1Response = await chakram.put(
      BOOKING_API_BASE + "order-quote-templates/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    this.logger && this.logger.recordResponse('C1', c1Response);

    return c1Response;
  }

  async putOrderQuote(uuid, params) {
    const payload = this.bookingTemplate(this.logger, c2req, params);

    this.logger && this.logger.recordRequest('C2', payload);

    const c2Response = await chakram.put(
      BOOKING_API_BASE + "order-quotes/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    this.logger && this.logger.recordResponse('C2', c2Response);

    return c2Response;
  }

  async putOrder(uuid, params) {
    const payload = this.bookingTemplate(this.logger, breq, params, true);

    this.logger && this.logger.recordRequest('B', payload);

    const bResponse = await chakram.put(
      BOOKING_API_BASE + "orders/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    this.logger && this.logger.recordResponse('B', bResponse);

    return bResponse;
  }

  async cancelOrder(uuid, params) {
    const payload = this.bookingTemplate(this.logger, ureq, params);

    this.logger && this.logger.recordRequest('U', payload);

    const uResponse = await chakram.patch(
      BOOKING_API_BASE + "orders/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    this.logger && this.logger.recordResponse('U', uResponse);

    return uResponse;
  }

  async createOpportunity(event, params) {
    let respObj;

    respObj = await chakram.post(
      BOOKING_API_BASE + "test-interface/" + event['@type'],
      event,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    this.logger && this.logger.recordResponse('create-session', respObj);

    return respObj;
  }

  async getRandomOpportunity(type, params) {
    let respObj;

    respObj = await chakram.get(
      "http://localhost:3000/get-random-opportunity" + ( type ? "?type=" + type : "" )
    )

    // TODO: Do we need to rename this from 'create-session'?
    this.logger && this.logger.recordResponse('random-opportunity', respObj);

    return respObj;
  }

  async deleteOpportunity(eventId, eventType, params = {}) {
    if (USE_RANDOM_OPPORTUNITIES) return null;

    const respObj = await chakram.delete(
      BOOKING_API_BASE +
        "test-interface/" + eventType + "/" +
        encodeURIComponent(eventId),
      null,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    this.logger && this.logger.recordResponse('delete-session', respObj);

    return respObj;
  }

  async deleteOrder(uuid, params) {
    const respObj = await chakram.delete(
      BOOKING_API_BASE + "orders/" + uuid,
      null,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

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
