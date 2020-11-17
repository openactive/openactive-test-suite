const chakram = require('chakram');
const config = require('config');

const { c1ReqTemplates } = require('../templates/c1-req.js');
const { c2ReqTemplates } = require('../templates/c2-req.js');
const { bReqTemplates } = require('../templates/b-req.js');
const { pReqTemplates } = require('../templates/p-req.js');
const { uReqTemplates } = require('../templates/u-req.js');

/**
 * @typedef {import('./logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('chakram').RequestMethod} RequestMethod
 * @typedef {import('chakram').RequestOptions} RequestOptions
 * @typedef {import('./sellers').SellerConfig} SellerConfig
 */


/** @type {SellerConfig['requestHeaders']} */
const DEFAULT_REQUEST_HEADERS = config.get('sellers.primary.requestHeaders');

const { MICROSERVICE_BASE, BOOKING_API_BASE, TEST_DATASET_IDENTIFIER } = global;


class RequestHelper {
  /**
   * @param {BaseLoggerType} logger
   * @param {SellerConfig | null} [sellerConfig]
   */
  constructor(logger, sellerConfig) {
    this.logger = logger;
    this._sellerConfig = sellerConfig;
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
      url,
      jsonBody,
      requestOptions,
    }, responsePromise);

    if (jsonBody) {
      this.logger.recordRequest(stage, jsonBody);
    }

    const response = await responsePromise;
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

  _getSellerRequestHeaders() {
    if (this._sellerConfig) {
      return this._sellerConfig.requestHeaders;
    }
    return DEFAULT_REQUEST_HEADERS;
  }

  createHeaders() {
    return {
      'Content-Type': 'application/vnd.openactive.booking+json; version=1',
      ...this._getSellerRequestHeaders(),
    };
  }

  /**
   * @param {string} opportunityType
   * @param {string} testOpportunityCriteria
   * @param {string | null} [sellerId]
   * @param {string | null} [sellerType]
   */
  opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria, sellerId = null, sellerType = null) {
    let template = null;
    const seller = sellerId ? {
      '@type': sellerType,
      '@id': sellerId,
    } : undefined;
    switch (opportunityType) {
      case 'ScheduledSession':
        template = {
          '@type': 'ScheduledSession',
          superEvent: {
            '@type': 'SessionSeries',
            organizer: seller,
          },
        };
        break;
      case 'FacilityUseSlot':
        template = {
          '@type': 'Slot',
          facilityUse: {
            '@type': 'FacilityUse',
            provider: seller,
          },
        };
        break;
      case 'IndividualFacilityUseSlot':
        template = {
          '@type': 'Slot',
          facilityUse: {
            '@type': 'IndividualFacilityUse',
            provider: seller,
          },
        };
        break;
      case 'CourseInstance':
        template = {
          '@type': 'CourseInstance',
          organizer: seller,
        };
        break;
      case 'CourseInstanceSubEvent':
        template = {
          '@type': 'Event',
          superEvent: {
            '@type': 'CourseInstance',
            organizer: seller,
          },
        };
        break;
      case 'HeadlineEvent':
        template = {
          '@type': 'HeadlineEvent',
          organizer: seller,
        };
        break;
      case 'HeadlineEventSubEvent':
        template = {
          '@type': 'Event',
          superEvent: {
            '@type': 'HeadlineEvent',
            organizer: seller,
          },
        };
        break;
      case 'Event':
        template = {
          '@type': 'Event',
          organizer: seller,
        };
        break;
      case 'OnDemandEvent':
        template = {
          '@type': 'OnDemandEvent',
          organizer: seller,
        };
        break;
      default:
        throw new Error('Unrecognised opportunity type');
    }
    template['@context'] = [
      'https://openactive.io/',
      'https://openactive.io/test-interface',
    ];
    template['test:testOpportunityCriteria'] = `https://openactive.io/test-interface#${testOpportunityCriteria}`;
    return template;
  }

  /**
   * @param {string} uuid
   */
  async getOrder(uuid) {
    const ordersFeedUpdate = await this.get(
      'get-order',
      `${MICROSERVICE_BASE}/get-order/${uuid}`,
      {
        timeout: 30000,
      },
    );

    return ordersFeedUpdate;
  }

  /**
   * @param {string} eventId
   * @param {unknown} orderItemPosition
   * @param {boolean} [useCacheIfAvailable] If true, Broker will potentially return the
   *   item from its cache.
   *   Set to false if you want to wait for a new update to the feed.
   *   Default is: true.
   */
  async getMatch(eventId, orderItemPosition, useCacheIfAvailable) {
    const useCacheIfAvailableQuery = useCacheIfAvailable === false ? 'false' : 'true';
    const respObj = await this.get(
      `Opportunity Feed extract for OrderItem ${orderItemPosition}`,
      `${MICROSERVICE_BASE}/opportunity/${encodeURIComponent(eventId)}?useCacheIfAvailable=${useCacheIfAvailableQuery}`,
      {
        timeout: 60000,
      },
    );

    return respObj;
  }

  async getDatasetSite() {
    const respObj = await this.get(
      'Dataset Site Cached Proxy',
      `${MICROSERVICE_BASE}/dataset-site`,
      {
        timeout: 5000,
      },
    );

    return respObj;
  }

  /**
   * @param {string} uuid
   * @param {import('../templates/c1-req').C1ReqTemplateData} params
   * @param {import('../templates/c1-req').C1ReqTemplateRef | null} [maybeC1ReqTemplateRef]
   */
  async putOrderQuoteTemplate(uuid, params, maybeC1ReqTemplateRef) {
    const c1ReqTemplateRef = maybeC1ReqTemplateRef || 'standard';
    const templateFn = c1ReqTemplates[c1ReqTemplateRef];
    const payload = templateFn(params);

    const c1Response = await this.put(
      'C1',
      `${BOOKING_API_BASE}/order-quote-templates/${uuid}`,
      payload,
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );

    return c1Response;
  }

  /**
   * @param {string} uuid
   * @param {import('../templates/c2-req').C2ReqTemplateData} params
   * @param {import('../templates/c2-req').C2ReqTemplateRef | null} [maybeC2ReqTemplateRef]
   */
  async putOrderQuote(uuid, params, maybeC2ReqTemplateRef) {
    const c2ReqTemplateRef = maybeC2ReqTemplateRef || 'standard';
    const templateFn = c2ReqTemplates[c2ReqTemplateRef];
    const payload = templateFn(params);

    const c2Response = await this.put(
      'C2',
      `${BOOKING_API_BASE}/order-quotes/${uuid}`,
      payload,
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );

    return c2Response;
  }

  /**
   * @param {string} uuid
   * @param {import('../templates/b-req').BReqTemplateData} params
   * @param {import('../templates/b-req').BReqTemplateRef | null} [maybeBReqTemplateRef]
   */
  async putOrder(uuid, params, maybeBReqTemplateRef) {
    const bReqTemplateRef = maybeBReqTemplateRef || 'standard';
    const templateFn = bReqTemplates[bReqTemplateRef];
    const payload = templateFn(params);

    const bResponse = await this.put(
      'B',
      `${BOOKING_API_BASE}/orders/${uuid}`,
      payload,
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );

    return bResponse;
  }

  /**
   * @param {string} uuid
   * @param {import('../templates/p-req').PReqTemplateData} params
   * @param {import('../templates/p-req').PReqTemplateRef | null} [maybePReqTemplateRef]
   */
  async putOrderProposal(uuid, params, maybePReqTemplateRef) {
    const pReqTemplateRef = maybePReqTemplateRef || 'standard';
    const templateFn = pReqTemplates[pReqTemplateRef];
    const requestBody = templateFn(params);

    const pResponse = await this.put(
      'P',
      `${BOOKING_API_BASE}/order-proposals/${uuid}`,
      requestBody,
      {
        headers: this.createHeaders(),
        // allow a bit of time leeway for this request, as the P request must be
        // processed atomically
        timeout: 10000,
      },
    );

    return pResponse;
  }

  /**
   * @param {string} uuid
   * @param {{ sellerId: string }} params
   */
  async cancelOrder(uuid, params, uReqTemplateRef = 'standard') {
    const templateFn = uReqTemplates[uReqTemplateRef];
    const payload = templateFn(params, uuid);

    const uResponse = await this.patch(
      'U',
      `${BOOKING_API_BASE}/orders/${uuid}`,
      payload,
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );

    return uResponse;
  }

  async createOpportunity(opportunityType, testOpportunityCriteria, orderItemPosition, sellerId, sellerType) {
    const respObj = await this.post(
      `Booking System Test Interface for OrderItem ${orderItemPosition}`,
      `${BOOKING_API_BASE}/test-interface/datasets/${TEST_DATASET_IDENTIFIER}/opportunities`,
      this.opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria, sellerId, sellerType),
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );

    return respObj;
  }

  async getRandomOpportunity(opportunityType, testOpportunityCriteria, orderItemPosition, sellerId, sellerType) {
    const respObj = await this.post(
      `Local Microservice Test Interface for OrderItem ${orderItemPosition}`,
      `${MICROSERVICE_BASE}/test-interface/datasets/${TEST_DATASET_IDENTIFIER}/opportunities`,
      this.opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria, sellerId, sellerType),
      {
        timeout: 10000,
      },
    );

    return respObj;
  }

  /**
   * @param {object} args
   * @param {object} args.action
   * @param {string} args.action.type
   * @param {string} args.action.objectType
   * @param {string} args.action.objectId
   */
  async callTestInterfaceAction({ action: { type, objectType, objectId } }) {
    const response = await this.post(
      `Call TestInterface Action of type: ${type}`,
      `${BOOKING_API_BASE}/test-interface/actions`,
      {
        '@context': [
          'https://openactive.io/',
          'https://openactive.io/test-interface',
        ],
        '@type': type,
        object: {
          '@type': objectType,
          '@id': objectId,
        },
      },
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );
    return response;
  }

  /**
   * @param {string} opportunityType
   * @param {string} testOpportunityCriteria
   */
  async callAssertUnmatchedCriteria(opportunityType, testOpportunityCriteria) {
    const response = await this.post(
      `Assert Unmatched Criteria '${testOpportunityCriteria}' for '${opportunityType}'`,
      `${MICROSERVICE_BASE}/assert-unmatched-criteria`,
      this.opportunityCreateRequestTemplate(opportunityType, testOpportunityCriteria),
      {
        timeout: 10000,
      },
    );
    return response;
  }

  /**
   * @param {string} uuid
   * @param {{ sellerId: string }} params
   */
  async deleteOrder(uuid, params) {
    const respObj = await this.delete(
      'delete-order',
      `${BOOKING_API_BASE}/orders/${uuid}`,
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );
    return respObj;
  }

  /**
   * @param {string} uuid
   */
  async deleteOrderQuote(uuid) {
    const respObj = await this.delete(
      'delete-order-quote',
      `${BOOKING_API_BASE}/order-quotes/${uuid}`,
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );
    return respObj;
  }

  /**
   * @param {string} uuid
   */
  async getOrderStatus(uuid) {
    const respObj = await this.get(
      'get-order-status',
      `${BOOKING_API_BASE}/orders/${uuid}`,
      {
        headers: this.createHeaders(),
        timeout: 10000,
      },
    );
    return respObj;
  }  

  delay(t, v) {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null, v), t);
    });
  }
}

/**
 * @typedef {InstanceType<typeof RequestHelper>} RequestHelperType
 */

module.exports = RequestHelper;
