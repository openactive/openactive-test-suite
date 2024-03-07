const querystring = require('querystring');
const chakram = require('chakram');
const config = require('config');
const { isNil } = require('lodash');

const { c1ReqTemplates } = require('../templates/c1-req');
const { c2ReqTemplates } = require('../templates/c2-req');
const { bReqTemplates } = require('../templates/b-req');
const { cancelOrderReqTemplates } = require('../templates/cancel-order-req');
const { rejectOrderProposalReqTemplates } = require('../templates/reject-order-proposal-req');
const { createTestInterfaceOpportunity } = require('./test-interface-opportunities');

/**
 * @typedef {import('chakram').RequestMethod} RequestMethod
 * @typedef {import('chakram').RequestOptions} RequestOptions
 * @typedef {import('./logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../types/SellerConfig').SellerConfig} SellerConfig
 * @typedef {import('../types/OpportunityCriteria').BookingFlow} BookingFlow
 * @typedef {import('../types/TestInterfaceOpportunity').TestInterfaceOpportunity} TestInterfaceOpportunity
 * @typedef {import('../templates/b-req').BReqTemplateData} BReqTemplateData
 * @typedef {import('../templates/b-req').BReqTemplateRef} BReqTemplateRef
 * @typedef {import('../templates/b-req').PReqTemplateData} PReqTemplateData
 * @typedef {import('../templates/b-req').PReqTemplateRef} PReqTemplateRef
 */

/**
 * @typedef {{
 *   opportunityType: string,
 *   testOpportunityCriteria: string,
 *   orderItemPosition: number,
 *   bookingFlow: BookingFlow,
 *   sellerId?: string | null,
 *   sellerType?: string | null,
 * }} TestInterfaceRequestArgs
 */

const { MICROSERVICE_BASE, BOOKING_API_BASE, TEST_DATASET_IDENTIFIER, SELLER_CONFIG } = global;

const OPEN_BOOKING_API_REQUEST_TIMEOUT = config.get('integrationTests.openBookingApiRequestTimeout');
const BROKER_MICROSERVICE_FEED_REQUEST_TIMEOUT = config.get('integrationTests.waitForItemToUpdateInFeedTimeout');

const BROKER_CHAKRAM_REQUEST_OPTIONS = {
  timeout: BROKER_MICROSERVICE_FEED_REQUEST_TIMEOUT,
};

class RequestHelper {
  /**
   * @param {BaseLoggerType} logger
   * @param {SellerConfig | null} [sellerConfig]
   */
  constructor(logger, sellerConfig) {
    this.logger = logger;
    this._sellerConfig = sellerConfig ?? SELLER_CONFIG.primary;
  }

  /**
   * @param {string} stage
   * @param {RequestMethod} method
   * @param {string} url
   * @param {unknown | null} jsonBody Data to send - generally not applicable to
   *   GET requests. A JSON-serializable object.
   * @param {RequestOptions} requestOptions
   * @param {any} [requestMetadata]
   */
  async _request(stage, method, url, jsonBody, requestOptions, requestMetadata) {
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
    },
    requestMetadata,
    responsePromise);

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
   * @param {any} [requestMetadata]
   */
  async get(stage, url, requestOptions, requestMetadata) {
    return await this._request(stage, 'GET', url, null, requestOptions, requestMetadata);
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
    // If broker microservice authentication fails, no accessToken will be supplied
    const accessToken = this._sellerConfig?.authentication?.bookingPartnerTokenSets?.primary?.access_token;
    const requestHeaders = this._sellerConfig?.authentication?.requestHeaders;
    return {
      ...(!accessToken ? undefined : {
        Authorization: `Bearer ${accessToken}`,
      }),
      ...requestHeaders,
    };
    // if (this._sellerConfig) {
    //   return this._sellerConfig.authentication.requestHeaders;
    //   // return this._sellerConfig.requestHeaders;
    // }
    // return DEFAULT_REQUEST_HEADERS;
  }

  createHeaders() {
    return {
      'Content-Type': 'application/vnd.openactive.booking+json; version=1',
      ...this._getSellerRequestHeaders(),
    };
  }

  /**
   * @param {string} eventId
   * @param {unknown} orderItemPosition
   * @param {boolean} [useCacheIfAvailable] If true, Broker will potentially return the
   *   item from its cache.
   *   Set to false if you want to wait for a new update to the feed.
   *   Default is: true.
   * @param {object} [moreOptions]
   * @param {number} [moreOptions.expectedCapacity]
   */
  async getMatch(eventId, orderItemPosition, useCacheIfAvailable, moreOptions) {
    const expectedCapacity = moreOptions?.expectedCapacity ?? null;
    const qs = querystring.stringify({
      useCacheIfAvailable: useCacheIfAvailable === false ? 'false' : 'true',
      ...(isNil(expectedCapacity)
        ? {}
        : { expectedCapacity }),
    });
    const respObj = await this.get(
      `Opportunity Feed extract for OrderItem ${orderItemPosition}`,
      `${MICROSERVICE_BASE}/opportunity/${encodeURIComponent(eventId)}?${qs}`,
      BROKER_CHAKRAM_REQUEST_OPTIONS,
      {
        feedExtract: {
          id: eventId,
          type: 'opportunities',
        },
      },
    );

    return respObj;
  }

  /**
   * @param {string} id
   * @param {number} orderItemPosition
   */
  async postOpportunityFeedChangeListener(id, orderItemPosition) {
    return await this.post(
      `Opportunity Feed listen for OrderItem ${orderItemPosition} (id: ${id}) change`,
      `${MICROSERVICE_BASE}/opportunity-listeners/${encodeURIComponent(id)}`,
      null,
      BROKER_CHAKRAM_REQUEST_OPTIONS,
    );
  }

  /**
   * @param {string} id
   * @param {number} orderItemPosition
   */
  async getOpportunityFeedChangeCollection(id, orderItemPosition) {
    return await this.get(
      `Opportunity Feed collect for OrderItem ${orderItemPosition} (id: ${id}) change`,
      `${MICROSERVICE_BASE}/opportunity-listeners/${encodeURIComponent(id)}`,
      BROKER_CHAKRAM_REQUEST_OPTIONS,
      {
        feedExtract: {
          id,
          type: 'opportunities',
        },
      },
    );
  }

  /**
   * @param {'orders' | 'order-proposals'} type
   * @param {string} bookingPartnerIdentifier
   * @param {string} uuid
   */
  async postOrderFeedChangeListener(type, bookingPartnerIdentifier, uuid) {
    return await this.post(
      `Orders (${type}) Feed listen for '${uuid}' change (auth: ${bookingPartnerIdentifier})`,
      `${MICROSERVICE_BASE}/order-listeners/${type}/${bookingPartnerIdentifier}/${uuid}`,
      null,
      BROKER_CHAKRAM_REQUEST_OPTIONS,
    );
  }

  /**
   * @param {'orders' | 'order-proposals'} type
   * @param {string} bookingPartnerIdentifier
   * @param {string} uuid
   */
  async getOrderFeedChangeCollection(type, bookingPartnerIdentifier, uuid) {
    return await this.get(
      `Orders (${type}) Feed collect for '${uuid}' change (auth: ${bookingPartnerIdentifier})`,
      `${MICROSERVICE_BASE}/order-listeners/${type}/${bookingPartnerIdentifier}/${uuid}`,
      BROKER_CHAKRAM_REQUEST_OPTIONS,
      {
        feedExtract: {
          id: uuid,
          type,
        },
      },
    );
  }

  async getDatasetSite() {
    const respObj = await this.get(
      'Dataset Site Cached Proxy',
      `${MICROSERVICE_BASE}/dataset-site`,
      {
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
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
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
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
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );

    return c2Response;
  }

  /**
   * @param {string} uuid
   * @param {BReqTemplateData} params
   * @param {BReqTemplateRef | null} [maybeBReqTemplateRef]
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
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );

    return bResponse;
  }

  /**
   * @param {string} uuid
   * @param {PReqTemplateData} params
   * @param {PReqTemplateRef | null} [maybeBReqTemplateRef]
   */
  async putOrderProposal(uuid, params, maybeBReqTemplateRef) {
    const bReqTemplateRef = maybeBReqTemplateRef || 'standard';
    const templateFn = bReqTemplates[bReqTemplateRef];
    const requestBody = templateFn(params);

    const pResponse = await this.put(
      'P',
      `${BOOKING_API_BASE}/order-proposals/${uuid}`,
      requestBody,
      {
        headers: this.createHeaders(),
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );

    return pResponse;
  }

  /**
   * @param {string} uuid
   * @param {import('../templates/reject-order-proposal-req.js').RejectOrderProposalReqTemplateRef | null} [maybeRejectOrderProposalReqTemplateRef]
   */
  async customerRejectOrderProposal(uuid, maybeRejectOrderProposalReqTemplateRef) {
    const rejectOrderProposalReqTemplateRef = maybeRejectOrderProposalReqTemplateRef || 'standard';
    const templateFn = rejectOrderProposalReqTemplates[rejectOrderProposalReqTemplateRef];
    const payload = templateFn();

    const uResponse = await this.patch(
      'U Proposal',
      `${BOOKING_API_BASE}/order-proposals/${uuid}`,
      payload,
      {
        headers: this.createHeaders(),
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );

    return uResponse;
  }

  /**
   * @param {string} uuid
   * @param {import('../templates/cancel-order-req.js').CancelOrderReqTemplateData} params
   * @param {import('../templates/cancel-order-req.js').CancelOrderReqTemplateRef | null} [maybeCancelOrderReqTemplateRef]
   */
  async cancelOrder(uuid, params, maybeCancelOrderReqTemplateRef) {
    const cancelOrderReqTemplateRef = maybeCancelOrderReqTemplateRef || 'standard';
    const templateFn = cancelOrderReqTemplates[cancelOrderReqTemplateRef];
    const payload = templateFn(params);

    const uResponse = await this.patch(
      'U',
      `${BOOKING_API_BASE}/orders/${uuid}`,
      payload,
      {
        headers: this.createHeaders(),
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );

    return uResponse;
  }

  /**
   * @param {TestInterfaceRequestArgs} args
   */
  async createOpportunity({
    opportunityType,
    testOpportunityCriteria,
    orderItemPosition,
    bookingFlow,
    sellerId,
    sellerType,
  }) {
    const respObj = await this.post(
      `Booking System Test Interface for OrderItem ${orderItemPosition}`,
      `${BOOKING_API_BASE}/test-interface/datasets/${TEST_DATASET_IDENTIFIER}/opportunities`,
      createTestInterfaceOpportunity({
        opportunityType,
        testOpportunityCriteria,
        bookingFlow,
        sellerId,
        sellerType,
      }), {
        headers: this.createHeaders(),
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );

    return respObj;
  }

  /**
   * @param {TestInterfaceRequestArgs} args
   */
  async getRandomOpportunity({
    opportunityType,
    testOpportunityCriteria,
    orderItemPosition,
    bookingFlow,
    sellerId,
    sellerType,
  }) {
    const respObj = await this.post(
      `Local Microservice Test Interface for OrderItem ${orderItemPosition}`,
      `${MICROSERVICE_BASE}/test-interface/datasets/${TEST_DATASET_IDENTIFIER}/opportunities`,
      createTestInterfaceOpportunity({
        opportunityType,
        testOpportunityCriteria,
        bookingFlow,
        sellerId,
        sellerType,
      }), {
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
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
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );
    return response;
  }

  /**
   * @param {object} args
   * @param {string} args.opportunityType
   * @param {string} args.testOpportunityCriteria
   * @param {BookingFlow} args.bookingFlow
   */
  async callAssertUnmatchedCriteria({ opportunityType, testOpportunityCriteria, bookingFlow }) {
    const response = await this.post(
      `Assert Unmatched Criteria '${testOpportunityCriteria}' for '${opportunityType}'`,
      `${MICROSERVICE_BASE}/assert-unmatched-criteria`,
      createTestInterfaceOpportunity({
        opportunityType,
        testOpportunityCriteria,
        bookingFlow,
      }), {
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );
    return response;
  }

  /**
   * @param {string} uuid
   * @param {{ sellerId: string }} params
   */
  async deleteOrder(uuid, params) { // eslint-disable-line no-unused-vars
    const respObj = await this.delete(
      'delete-order',
      `${BOOKING_API_BASE}/orders/${uuid}`,
      {
        headers: this.createHeaders(),
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
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
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
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
        timeout: OPEN_BOOKING_API_REQUEST_TIMEOUT,
      },
    );
    return respObj;
  }
}

/**
 * @typedef {InstanceType<typeof RequestHelper>} RequestHelperType
 */

module.exports = RequestHelper;
