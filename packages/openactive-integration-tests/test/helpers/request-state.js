const config = require('config');
const { getRelevantOffers } = require('@openactive/test-interface-criteria');
const RequestHelper = require('./request-helper');

/**
 * @typedef {import('../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 */

const USE_RANDOM_OPPORTUNITIES = config.get('useRandomOpportunities');
const SELLER_CONFIG = config.get('sellers');

function isResponse20x(response) {
  if (!response || !response.response) return false;

  const { statusCode } = response.response;

  return statusCode >= 200 && statusCode < 300;
}

function isResponse(response) {
  if (!response || !response.response) return false;

  const { statusCode } = response.response;

  return statusCode >= 200 && statusCode < 600;
}

class RequestState {
  /**
   *
   * @param {InstanceType<import('./logger')['Logger']>} logger
   * @param {object} [options]
   * @param {string | null} [options.uuid] Order UUID. If not provided, a new
   *   one will be generated randomly
   * @param {import('../templates/c1-req').C1ReqTemplateRef} [options.c1ReqTemplateRef]
   *   Which template to use for C1 requests. Defaults to 'standard'
   * @param {import('../templates/c2-req').C2ReqTemplateRef} [options.c2ReqTemplateRef]
   *   Which template to use for C2 requests. Defaults to 'standard'
   * @param {import('../templates/b-req').BReqTemplateRef} [options.bReqTemplateRef]
   *   Which template to use for B requests. Defaults to 'standard'
   */
  constructor(logger, { uuid, c1ReqTemplateRef, c2ReqTemplateRef, bReqTemplateRef } = {}) {
    this.requestHelper = new RequestHelper(logger);
    if (uuid) {
      this._uuid = uuid;
    }
    this._c1ReqTemplateRef = c1ReqTemplateRef;
    this._c2ReqTemplateRef = c2ReqTemplateRef;
    this._bReqTemplateRef = bReqTemplateRef;
  }

  get uuid() {
    if (this._uuid) return this._uuid;

    this._uuid = this.requestHelper.uuid();
    return this._uuid;
  }

  /**
   * For each of the Opportunity Criteria, fetch an opportunity that matches
   * the criteria from the [test interface](https://openactive.io/test-interface/).
   *
   * The responses only contain minimal info like ID, so `getMatch()` needs to
   * be called afterwards to actually get the full data of each opportunity.
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {boolean} [randomModeOverride]
   */
  async fetchOpportunities(orderItemCriteriaList, randomModeOverride) {
    this.orderItemCriteriaList = orderItemCriteriaList;

    // If an opportunityReuseKey is set, reuse the same opportunity for each OrderItem with that same opportunityReuseKey
    const reusableOpportunityPromises = new Map();

    /**
     * Test interface responses - one for each criteria. Only contains id
     *
     * @type {{
     *   body: {
     *     '@id': string,
     *     [k: string]: unknown,
     *   },
     * }[]}
     */
    this.testInterfaceResponses = await Promise.all(this.orderItemCriteriaList.map(async (orderItemCriteriaItem, i) => {
      // If an opportunity is available for reuse, return it
      if (orderItemCriteriaItem.hasOwnProperty('opportunityReuseKey') && reusableOpportunityPromises.has(orderItemCriteriaItem.opportunityReuseKey)) {
        return await reusableOpportunityPromises.get(orderItemCriteriaItem.opportunityReuseKey);
      }

      const sellerKey = orderItemCriteriaItem.seller || 'primary';
      const seller = SELLER_CONFIG[sellerKey];
      const opportunityPromise = (randomModeOverride !== undefined ? randomModeOverride : USE_RANDOM_OPPORTUNITIES)
        ? this.requestHelper.getRandomOpportunity(orderItemCriteriaItem.opportunityType, orderItemCriteriaItem.opportunityCriteria, i, seller['@id'], seller['@type'])
        : this.requestHelper.createOpportunity(orderItemCriteriaItem.opportunityType, orderItemCriteriaItem.opportunityCriteria, i, seller['@id'], seller['@type']);

      // If this opportunity can be reused, store it
      if (orderItemCriteriaItem.hasOwnProperty('opportunityReuseKey')) {
        reusableOpportunityPromises.set(orderItemCriteriaItem.opportunityReuseKey, opportunityPromise);
      }

      return await opportunityPromise;
    }));
  }

  getRandomRelevantOffer(opportunity, opportunityCriteria) {
    const relevantOffers = getRelevantOffers(opportunityCriteria, opportunity);
    if (relevantOffers.length == 0) return null;

    return relevantOffers[Math.floor(Math.random() * relevantOffers.length)];
  }

  async getOrder() {
    const result = await this.requestHelper.getOrder(this.uuid);

    this.ordersFeedUpdate = result;

    return this;
  }

  get rpdeItem() {
    if (!this.ordersFeedUpdate) return;

    return this.ordersFeedUpdate.body;
  }

  async getDatasetSite() {
    const result = await this.requestHelper.getDatasetSite();

    this.datasetSite = result;

    return this;
  }

  async getMatch() {
    const reusableMatchPromises = new Map();

    /**
     * Full opportunity data for each opportunity fetched by fetchOpportunities() - one for each criteria.
     */
    this.opportunityFeedExtractResponses = await Promise.all(this.testInterfaceResponses.map(async (testInterfaceResponse, i) => {
      // Only attempt getMatch if test interface response was successful
      if (isResponse20x(testInterfaceResponse) && testInterfaceResponse.body['@id']) {
        // If a match for this @id is already being requested, just reuse the same response
        if (reusableMatchPromises.has(testInterfaceResponse.body['@id'])) {
          return await reusableMatchPromises.get(testInterfaceResponse.body['@id']);
        }

        const matchPromise = this.requestHelper.getMatch(testInterfaceResponse.body['@id'], i);
        reusableMatchPromises.set(testInterfaceResponse.body['@id'], matchPromise);
        return await matchPromise;
      }
      return null;
    }));

    this.orderItems = this.opportunityFeedExtractResponses.map((x, i) => {
      if (x && isResponse20x(x)) {
        const acceptedOffer = this.getRandomRelevantOffer(x.body.data, this.orderItemCriteriaList[i].opportunityCriteria);
        if (acceptedOffer === null) {
          throw new Error(`Opportunity for OrderItem ${i} did not have a relevant offer for the specified testOpportunityCriteria: ${this.orderItemCriteriaList[i].opportunityCriteria}`);
        }
        return {
          position: i,
          orderedItem: x.body.data,
          acceptedOffer,
          'test:primary': this.orderItemCriteriaList[i].primary,
          'test:control': this.orderItemCriteriaList[i].control,
        };
      }
      return null;
    });

    return this;
  }

  get fetchOpportunitiesSucceeded() {
    return this.testInterfaceResponses.every(x => isResponse20x(x));
  }

  get getMatchResponseSucceeded() {
    return !this.orderItems.some(x => x == null);
  }

  get sellerId() {
    return SELLER_CONFIG.primary['@id'];
  }

  async putOrderQuoteTemplate() {
    const result = this._c1ReqTemplateRef
      ? await this.requestHelper.putOrderQuoteTemplate(this.uuid, this, this._c1ReqTemplateRef)
      : await this.requestHelper.putOrderQuoteTemplate(this.uuid, this);

    this.c1Response = result;

    return this;
  }

  get C1ResponseSucceeded() {
    return isResponse20x(this.c1Response);
  }

  get C1ResponseReceived() {
    return isResponse(this.c1Response);
  }

  get totalPaymentDue() {
    const response = this.c2Response || this.c1Response;

    if (!response) return;

    if (!response.body.totalPaymentDue) return;

    return response.body.totalPaymentDue.price;
  }

  async putOrderQuote() {
    const result = this._c2ReqTemplateRef
      ? await this.requestHelper.putOrderQuote(this.uuid, this, this._c2ReqTemplateRef)
      : await this.requestHelper.putOrderQuote(this.uuid, this);

    this.c2Response = result;

    return this;
  }

  get C2ResponseSucceeded() {
    return isResponse20x(this.c2Response);
  }

  get C2ResponseReceived() {
    return isResponse(this.c2Response);
  }

  async putOrder() {
    const result = this._bReqTemplateRef
      ? await this.requestHelper.putOrder(this.uuid, this, this._bReqTemplateRef)
      : await this.requestHelper.putOrder(this.uuid, this);

    this.bResponse = result;

    return this;
  }

  get BResponseSucceeded() {
    return isResponse20x(this.bResponse);
  }

  get BResponseReceived() {
    return isResponse(this.bResponse);
  }

  get orderItemId() {
    if (!this.bResponse) return;

    if (this.bResponse.body && this.bResponse.body.orderedItem) {
      return this.bResponse.body.orderedItem[0]['@id'];
    }

    return 'NONE';
  }

  async deleteOrder() {
    const result = await this.requestHelper.deleteOrder(this.uuid, {
      sellerId: this.sellerId,
    });

    this.deletionResponse = result;

    return this;
  }

  async cancelOrder() {
    const result = await this.requestHelper.cancelOrder(this.uuid, this);

    this.uResponse = result;

    return this;
  }

  get UResponseSucceeded() {
    return isResponse20x(this.uResponse);
  }

  get UResponseReceived() {
    return isResponse(this.uResponse);
  }
}

/**
 * @typedef {InstanceType<typeof RequestState>} RequestStateType
 */

module.exports = {
  RequestState,
};
