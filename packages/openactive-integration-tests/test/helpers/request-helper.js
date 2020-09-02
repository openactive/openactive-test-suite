const assert = require("assert");
const chakram = require("chakram");
const fs = require("fs");
const config = require("config");
const { generateUuid } = require('./generate-uuid');

const c1req = require("../templates/c1-req.js");
const c2req = require("../templates/c2-req.js");
const { bReqTemplates } = require("../templates/b-req.js");
const ureq = require("../templates/u-req.js");

/**
 * @typedef {import('./logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('chakram').RequestMethod} RequestMethod
 * @typedef {import('chakram').RequestOptions} RequestOptions
 */

const REQUEST_HEADERS = config.get("sellers.primary.requestHeaders");

const MICROSERVICE_BASE = global.MICROSERVICE_BASE;
const BOOKING_API_BASE = global.BOOKING_API_BASE;
const TEST_DATASET_IDENTIFIER = global.TEST_DATASET_IDENTIFIER;

class RequestHelper {
  /**
   * @param {BaseLoggerType} logger
   */
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * @param {string} stage
   * @param {RequestMethod} method
   * @param {string} url
   * @param {unknown | null} jsonBody Data to send - generally not applicable to
   *   GET requests. A JSON-serializable object.
   * @param {RequestOptions} requestOptions
   */
  async _request(stage, method, url, jsonBody, requestOptions) {
    const params = { ...requestOptions };
    if (jsonBody) {
      params.body = jsonBody;
      params.json = true;
    }
    const responsePromise = chakram.request(method, url, params);

    this.logger.recordRequestResponse(stage, {
      method: method.toUpperCase(),
      url: url,
      jsonBody,
      requestOptions,
    }, responsePromise);

    if (jsonBody) {
      this.logger.recordRequest(stage, jsonBody);
    }

    let response = await responsePromise;
    this.logger.recordResponse(stage, response);

    return response;
  }

  /**
   * @param {string} stage
   * @param {string} url
   * @param {RequestOptions} requestOptions
   */
  async get(stage, url, requestOptions) {
    return await this._request(stage, 'GET', url, null, requestOptions);
  }

  /**
   * @param {string} stage
   * @param {string} url
   * @param {unknown} jsonBody
   * @param {RequestOptions} requestOptions
   */
  async put(stage, url, jsonBody, requestOptions) {
    return await this._request(stage, 'PUT', url, jsonBody, requestOptions);
  }

  /**
   * @param {string} stage
   * @param {string} url
   * @param {unknown} jsonBody
   * @param {RequestOptions} requestOptions
   */
  async post(stage, url, jsonBody, requestOptions) {
    return await this._request(stage, 'POST', url, jsonBody, requestOptions);
  }

  /**
   * @param {string} stage
   * @param {string} url
   * @param {unknown} jsonBody
   * @param {RequestOptions} requestOptions
   */
  async patch(stage, url, jsonBody, requestOptions) {
    return await this._request(stage, 'PATCH', url, jsonBody, requestOptions);
  }

  /**
   * @param {string} stage
   * @param {string} url
   * @param {RequestOptions} requestOptions
   */
  async delete(stage, url, requestOptions) {
    return await this._request(stage, 'DELETE', url, null, requestOptions);
  }

  createHeaders(sellerId) {
    return  Object.assign({
      "Content-Type": "application/vnd.openactive.booking+json; version=1"
    }, REQUEST_HEADERS);
  }

  opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria, sellerId, sellerType) {
    var template = null;
    switch (opportunityType) {
      case 'ScheduledSession':
        template = {
          "@type": "ScheduledSession",
          "superEvent": {
              "@type": "SessionSeries",
              "organizer": {
                "@type": sellerType,
                "@id": sellerId
              }
          }
        };
        break;
      case 'FacilityUseSlot':
        template = {
          "@type": "Slot",
          "facilityUse": {
              "@type": "FacilityUse",
              "organizer": {
                "@type": sellerType,
                "@id": sellerId
              }
          }
        };
        break;
      case 'IndividualFacilityUseSlot':
        template = {
          "@type": "Slot",
          "facilityUse": {
              "@type": "IndividualFacility",
              "organizer": {
                "@type": sellerType,
                "@id": sellerId
              }
          }
        };
        break;
      case 'CourseInstance':
        template = {
          "@type": "CourseInstance",
          "organizer": {
            "@type": sellerType,
            "@id": sellerId
          }
        };
        break;
      case 'CourseInstanceSubEvent':
        template = {
          "@type": "Event",
          "superEvent": {
              "@type": "CourseInstance",
              "organizer": {
                "@type": sellerType,
                "@id": sellerId
              }
          }
        };
        break;
      case 'HeadlineEvent':
        template = {
          "@type": "HeadlineEvent",
          "organizer": {
            "@type": sellerType,
            "@id": sellerId
          }
        };
        break;
      case 'HeadlineEventSubEvent':
        template = {
          "@type": "Event",
          "superEvent": {
              "@type": "HeadlineEvent",
              "organizer": {
                "@type": sellerType,
                "@id": sellerId
              }
          }
        };
        break;
      case 'Event':
        template = {
          "@type": "Event",
          "organizer": {
            "@type": sellerType,
            "@id": sellerId
          }
        };
        break;
      case 'OnDemandEvent':
        template = {
          "@type": "OnDemandEvent",
          "organizer": {
            "@type": sellerType,
            "@id": sellerId
          }
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

  /**
   * @param {string} eventId
   * @param {unknown} orderItemPosition
   */
  async getMatch(eventId, orderItemPosition) {
    const respObj = await this.get(
      `Opportunity Feed extract for OrderItem ${orderItemPosition}`,
      MICROSERVICE_BASE + `opportunity/${encodeURIComponent(eventId)}?useCacheIfAvailable=true`,
      {
        timeout: 60000
      }
    );

    return respObj;
  }

  async getDatasetSite() {
    const respObj = await this.get(
      'Dataset Site Cached Proxy',
      MICROSERVICE_BASE + "dataset-site",
      {
        timeout: 5000
      }
    );

    return respObj;
  }

  async putOrderQuoteTemplate(uuid, params) {
    const payload = c1req(params);

    const c1Response = await this.put(
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
    const payload = c2req(params);

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

  /**
   * @param {string} uuid
   * @param {import('../templates/b-req').BReqTemplateData} params
   * @param {import('../templates/b-req').BReqTemplateRef} bReqTemplateRef
   */
  async putOrder(uuid, params, bReqTemplateRef = 'standard') {
    const templateFn = bReqTemplates[bReqTemplateRef];
    const payload = templateFn(params);

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
    const payload = ureq(params);

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

  async createOpportunity(opportunityType, testOpportunityCriteria, orderItemPosition, sellerId, sellerType) {
    let respObj;

    respObj = await this.post(
      `Booking System Test Interface for OrderItem ${orderItemPosition}`,
      `${BOOKING_API_BASE}test-interface/datasets/${TEST_DATASET_IDENTIFIER}/opportunities`,
      this.opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria, sellerId, sellerType),
      {
        headers: this.createHeaders(sellerId),
        timeout: 10000
      }
    );

    return respObj;
  }

  async getRandomOpportunity(opportunityType, testOpportunityCriteria, orderItemPosition, sellerId, sellerType) {
    let respObj;

    respObj = await this.post(
      `Local Microservice Test Interface for OrderItem ${orderItemPosition}`,
      `${MICROSERVICE_BASE}test-interface/datasets/${TEST_DATASET_IDENTIFIER}/opportunities`,
      this.opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria, sellerId, sellerType),
      {
        timeout: 10000
      }
    );

    return respObj;
  }

  /**
   * @param {string} uuid
   * @param {{ sellerId: string }} params 
   */
  async deleteOrder(uuid, params) {
    const respObj = await this.delete(
      'delete-order',
      BOOKING_API_BASE + "orders/" + uuid,
      {
        headers: this.createHeaders(params.sellerId),
        timeout: 10000
      }
    );
    return respObj;
  }

  delay(t, v) {
    return new Promise(function(resolve) {
      setTimeout(resolve.bind(null, v), t);
    });
  }

  /**
   * @param {string | null} sellerId
   */
  uuid(sellerId = null) {
    return generateUuid(sellerId);
  }
}

module.exports = RequestHelper;
