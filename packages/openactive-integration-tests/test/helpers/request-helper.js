const assert = require("assert");
const chakram = require("chakram");
const uuidv5 = require("uuid/v5");
const fs = require("fs");
const config = require("config");

var BOOKING_API_BASE = config.get("tests.bookingApiBase");
var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");
var TEST_DATASET_IDENTIFIER = config.get("tests.testDatasetIdentifier");

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

  async _request(stage, method, url, params, headers) {
    let responsePromise = chakram[method.toLowerCase()](url, params, headers);

    this.logger.recordRequestResponse(stage, {
      method: method.toUpperCase(),
      url: url,
      params: params,
      headers: headers
    }, responsePromise);

    if (params) {
      this.logger.recordRequest(stage, params);
    }

    let response = await responsePromise;
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

  opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria) {
    var template = null;
    switch (opportunityType) {
      case 'ScheduledSession':
        template = {
          "@type": "ScheduledSession",
          "superEvent": {
              "@type": "SessionSeries"
          }
        };
        break;
      case 'FacilityUseSlot':
        template = {
          "@type": "Slot",
          "facilityUse": {
              "@type": "FacilityUse"
          }
        };
        break;
      case 'IndividualFacilityUseSlot':
        template = {
          "@type": "Slot",
          "facilityUse": {
              "@type": "IndividualFacility"
          }
        };
        break;
      case 'CourseInstance':
        template = {
          "@type": "CourseInstance"
        };
        break;
      case 'CourseInstanceSubEvent':
        template = {
          "@type": "Event",
          "superEvent": {
              "@type": "CourseInstance"
          }
        };
        break;
      case 'HeadlineEvent':
        template = {
          "@type": "HeadlineEvent"
        };
        break;
      case 'HeadlineEventSubEvent':
        template = {
          "@type": "Event",
          "superEvent": {
              "@type": "HeadlineEvent"
          }
        };
        break;
      case 'Event':
        template = {
          "@type": "Event"
        };
        break;
      case 'OnDemandEvent':
        template = {
          "@type": "OnDemandEvent"
        };
        break;
      default:
        throw new Error('Unrecognised opportunity type')
    }
    template["@context"] = [
      "https://openactive.io/",
      "https://openactive.io/test-interface"
    ];
    template["test:testOpportunityCriteria"] = `https://openactive.io/test-interface#${testOpportunityCriteria}`;
    return template;
  }

  bookingTemplate(logger, templateJson, replacementMap) {
    let jsonResult = templateJson(replacementMap);

    // Remove payment if not required due to free session
    if (replacementMap.totalPaymentDue == 0) delete jsonResult.payment;

    return jsonResult;
  }

  async getOrder(uuid) {
    const ordersFeedUpdate = await this.get(
      'get-order',
      MICROSERVICE_BASE + "get-order/" + uuid,
      {
        timeout: 30000
      }
    );

    return ordersFeedUpdate;
  }

  async getMatch(eventId) {
    const respObj = await this.get(
      'get-match',
      MICROSERVICE_BASE + "get-cached-opportunity/" + encodeURIComponent(eventId),
      {
        timeout: 60000
      }
    );

    return respObj;
  }

  async getDatasetSite() {
    const respObj = await this.get(
      'dataset-site',
      MICROSERVICE_BASE + "dataset-site",
      {
        timeout: 5000
      }
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
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
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
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    return c2Response;
  }

  async putOrder(uuid, params) {
    const payload = this.bookingTemplate(this.logger, breq, params);

    const bResponse = await this.put(
      'B',
      BOOKING_API_BASE + "orders/" + uuid,
      payload,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
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
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    return uResponse;
  }

  async createOpportunity(opportunityType, testOpportunityCriteria, params) {
    let respObj;

    respObj = await this.post(
      'create-session',
      `${BOOKING_API_BASE}test-interface/datasets/${TEST_DATASET_IDENTIFIER}/opportunities`,
      this.opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria),
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );

    return respObj;
  }

  async getRandomOpportunity(opportunityType, testOpportunityCriteria, params) {
    let respObj;

    respObj = await this.post(
      'random-opportunity',
      `${MICROSERVICE_BASE}test-interface/datasets/${TEST_DATASET_IDENTIFIER}/opportunities`,
      this.opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria),
      {
        timeout: 10000
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
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
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
