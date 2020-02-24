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

  async _request(stage, method, url, params, headers) {
    let response = await chakram[method.toLowerCase()](url, params, headers);

    this.logger.recordRequestResponse(stage, {
      method: method.toUpperCase(),
      url: url,
      params: params,
      headers: headers
    }, response);

    if (params) {
      this.logger.recordRequest(stage, params);
    }
    this.logger.recordResponse(stage, response);

    return response;
  }

  async get(stage, url, headers) {
    return await this._request(stage, 'GET', url, null, headers);
  }
  async put(stage, url, params, headers) {
    return await this._request(stage, 'PUT', url, params, headers);
  }

  async post(stage, url, params, headers) {
    return await this._request(stage, 'POST', url, params, headers);
  }

  async patch(stage, url, params, headers) {
    return await this._request(stage, 'PATCH', url, params, headers);
  }

  async delete(stage, url, params, headers) {
    return await this._request(stage, 'DELETE', url, params, headers);
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

    let jsonResult = JSON.parse(req);
    if (removePayment) delete jsonResult.payment;
    return jsonResult;
  }

  async getOrder(uuid) {
    const ordersFeedUpdate = await this.get(
      'get-order',
      MICROSERVICE_BASE + "get-order/" + uuid
    );

    return ordersFeedUpdate;
  }

  async getMatch(eventId) {
    const respObj = await this.get(
      'get-match',
      MICROSERVICE_BASE + "get-cached-opportunity/" + encodeURIComponent(eventId)
    );

    return respObj;
  }

  async putOrderQuoteTemplate(uuid, params) {
    let payload = this.bookingTemplate(this.logger, c1req, params);

    let c1Response = await this.put(
      'C1',
      BOOKING_API_BASE + "order-quote-templates/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    return c1Response;
  }

  async putOrderQuote(uuid, params) {
    const payload = this.bookingTemplate(this.logger, c2req, params);

    const c2Response = await this.put(
      'C2',
      BOOKING_API_BASE + "order-quotes/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    return c2Response;
  }

  async putOrder(uuid, params) {
    const payload = this.bookingTemplate(this.logger, breq, params, true);

    const bResponse = await this.put(
      'B',
      BOOKING_API_BASE + "orders/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    return bResponse;
  }

  async cancelOrder(uuid, params) {
    const payload = this.bookingTemplate(this.logger, ureq, params);

    const uResponse = await this.patch(
      'U',
      BOOKING_API_BASE + "orders/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    return uResponse;
  }

  async createScheduledSession(event, params) {
    let respObj;
    if (USE_RANDOM_OPPORTUNITIES) {
      respObj = await this.get(
        'create-session',
        "http://localhost:3000/get-random-opportunity"
      )
    }
    else {
      respObj = await this.post(
        'create-session',
        BOOKING_API_BASE + "test-interface/scheduledsession",
        event,
        {
          headers: this.createHeaders(params.sellerId)
        }
      );
    }

    return respObj;
  }

  async deleteScheduledSession(eventId, params = {}) {
    if (USE_RANDOM_OPPORTUNITIES) return null;

    const respObj = await this.delete(
      'delete-session',
      BOOKING_API_BASE +
        "test-interface/scheduledsession/" +
        encodeURIComponent(eventId),
      null,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

    return respObj;
  }

  async deleteOrder(uuid, params) {
    const respObj = await this.delete(
      'delete-order',
      BOOKING_API_BASE + "orders/" + uuid,
      null,
      {
        headers: this.createHeaders(params.sellerId)
      }
    );

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
