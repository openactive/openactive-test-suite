const RequestHelper = require("./request-helper");
const pMemoize = require("p-memoize");
const config = require("config");

var USE_RANDOM_OPPORTUNITIES = config.get("useRandomOpportunities");
const SELLER_CONFIG = config.get("sellers");

function isResponse20x(response) {
  if (!response || !response.response) return false;

  let statusCode = response.response.statusCode;

  return statusCode >= 200 && statusCode < 300;
}

function isResponse(response) {
  if (!response || !response.response) return false;

  let statusCode = response.response.statusCode;

  return statusCode >= 200 && statusCode < 600;
}

class RequestState {
  constructor (logger) {
    this.requestHelper = new RequestHelper(logger);
    this.logger = logger;
  }

  log (msg) {
    if (!this.logger) return;

    this.logger.log(msg);
  }

  get uuid() {
    if (this._uuid) return this._uuid;

    this._uuid = this.requestHelper.uuid();
    return this._uuid;
  }

  async createOpportunity(orderItemCriteriaList) {
    this.orderItemCriteriaList = orderItemCriteriaList;

    // If an opportunityReuseKey is set, reuse the same opportunity for each OrderItem with that same opportunityReuseKey
    const reusableOpportunityPromises = new Map();

    this.testInterfaceResponses = await Promise.all(this.orderItemCriteriaList.map(async (orderItemCriteriaItem, i) => {
      // If an opportunity is available for reuse, return it
      if (orderItemCriteriaItem.hasOwnProperty('opportunityReuseKey') && reusableOpportunityPromises.has(orderItemCriteriaItem.opportunityReuseKey)) {
        return await reusableOpportunityPromises.get(orderItemCriteriaItem.opportunityReuseKey)
      }

      const sellerKey = orderItemCriteriaItem.seller || 'primary';
      const seller = SELLER_CONFIG[sellerKey];
      const opportunityPromise = USE_RANDOM_OPPORTUNITIES ?
        this.requestHelper.getRandomOpportunity(orderItemCriteriaItem.opportunityType, orderItemCriteriaItem.opportunityCriteria, i, seller['@id'], seller['@type']) :
        this.requestHelper.createOpportunity(orderItemCriteriaItem.opportunityType, orderItemCriteriaItem.opportunityCriteria, i, seller['@id'], seller['@type']);
      
      // If this opportunity can be reused, store it
      if (orderItemCriteriaItem.hasOwnProperty('opportunityReuseKey')) {
        reusableOpportunityPromises.set(orderItemCriteriaItem.opportunityReuseKey, opportunityPromise)
      }

      return await opportunityPromise;
    }));
  }

	getRandomRelevantOffer(opportunity, opportunityCriteria) {
    const getOffers = (opportunity) => {
      return opportunity.offers || (opportunity.superEvent && opportunity.superEvent.offers) || []; // Note FacilityUse does not have bookable offers, as it does not allow inheritance
    };
  
    const getOfferFilter = (opportunityCriteria) => {
      switch (opportunityCriteria) {
        case 'TestOpportunityBookableOutsideValidFromBeforeStartDate':
          return x =>
          (Array.isArray(x.availableChannel) && x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
          && x.advanceBooking != "https://openactive.io/Unavailable"
          && (x.validFromBeforeStartDate && moment(startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isAfter());
        default: 
          return x =>
          (Array.isArray(x.availableChannel) && x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
          && x.advanceBooking != "https://openactive.io/Unavailable"
          && (!x.validFromBeforeStartDate || moment(startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isBefore());
      }
    };

    const offers = getOffers(opportunity);
    if (!Array.isArray(offers)) return null;

    const relevantOffers = offers.filter(getOfferFilter(opportunityCriteria));
    if (relevantOffers.length == 0) return null;

    return relevantOffers[Math.floor(Math.random() * relevantOffers.length)];
	}

  async getOrder () {
    let result = await this.requestHelper.getOrder(this.uuid);

    this.ordersFeedUpdate = result;

    return this;
  }

  async deleteOrder () {
    return await testHelper.deleteOrder(this.uuid, {
      sellerId: this.sellerId,
    });
  }

  get rpdeItem() {
    if (!this.ordersFeedUpdate) return;

    return this.ordersFeedUpdate.body;
  }

  async getDatasetSite () {
    let result = await this.requestHelper.getDatasetSite();

    this.datasetSite = result;

    return this;
  }

  async getMatch () {
    this.opportunityFeedExtractResponses = await Promise.all(this.testInterfaceResponses.map(async (testInterfaceResponse, i) => {
      // Only attempt getMatch if test interface response was successful
      if (isResponse20x(testInterfaceResponse) && testInterfaceResponse.body['@id']) {
        return await this.requestHelper.getMatch(testInterfaceResponse.body['@id'], i);
      } else {
        return null;
      }
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
          'test:control': this.orderItemCriteriaList[i].control
        }
      } else {
        return null;
      }
    });

    return this;
  }

  get getMatchResponseSucceeded() {
    return !this.orderItems.some(x => x == null);
  }

  get sellerId() {
    return SELLER_CONFIG.primary['@id'];
  }

  async putOrderQuoteTemplate () {
    let result = await this.requestHelper.putOrderQuoteTemplate(this.uuid, this);

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
    let response = this.c2Response || this.c1Response;

    if (!response) return;

    if (!response.body.totalPaymentDue) return;

    return response.body.totalPaymentDue.price;
  }

  async putOrderQuote () {
    let result = await this.requestHelper.putOrderQuote(this.uuid, this);

    this.c2Response = result;

    return this;
  }

  get C2ResponseSucceeded() {
    return isResponse20x(this.c2Response);
  }

  get C2ResponseReceived() {
    return isResponse(this.c2Response);
  }

  async putOrder () {
    let result = await this.requestHelper.putOrder(this.uuid, this);

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
      return this.bResponse.body.orderedItem[0]["@id"]
    }
    else {
      return "NONE";
    }
  }

  async cancelOrder () {
    let result = await this.requestHelper.cancelOrder(this.uuid, this);

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

module.exports = {
  RequestState
};
