const RequestHelper = require("./request-helper");
const pMemoize = require("p-memoize");
const config = require("config");

var USE_RANDOM_OPPORTUNITIES = config.get("tests.useRandomOpportunities");

function isResponse20x(response) {
  if (!response || !response.response) return false;

  let statusCode = response.response.statusCode;

  return statusCode >= 200 && statusCode < 300;
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

  /*
    {
      opportunityType: 'ScheduledSession',
      opportunityCriteria: 'TestOpportunityNotBookableViaAvailableChannel',
      control: false
    },
    {
      opportunityType: 'ScheduledSession',
      opportunityCriteria: 'TestOpportunityBookable',
      control: true
    },
    {
      opportunityType: 'ScheduledSession',
      opportunityCriteria: 'TestOpportunityBookable',
      control: true
    }

    TODO rename to createOpportunities
  */
  async createOpportunity(orderItemCriteriaList) {
    const pArray = orderItemCriteriaList.map(async orderItemCriteriaItem => {
      if (USE_RANDOM_OPPORTUNITIES) {
        return await this.requestHelper.getRandomOpportunity(orderItemCriteriaItem.opportunityType, orderItemCriteriaItem.opportunityCriteria, {});
      }
      else {
        return await this.requestHelper.createOpportunity(orderItemCriteriaItem.opportunityType, orderItemCriteriaItem.opportunityCriteria, {
          sellerId: this.sellerId
        });
      }
    });

    this.orderItemResponses = await Promise.all(pArray);

    //TODO: The below needs to happen after getMatch

    //TODO: The test interface needs to ensure that all test items returned are for only one seller...
    // Do we allow an array of opportunity criteria to be provided to the test interface? Similar to an array of orderItems?

    this.orderItems = this.orderItemResponses.map((x, i) => ({
      orderedItem: x.body,
      acceptedOffer: this.getRandomRelevantOffer(x.body, orderItemCriteriaList[i].opportunityCriteria),
      'test:primary': orderItemCriteriaList[i].primary,
      'test:control': orderItemCriteriaList[i].control
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
          (!x.availableChannel || x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
          && x.advanceBooking != "https://openactive.io/Unavailable"
          && (x.validFromBeforeStartDate && moment(startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isAfter());
        default: 
          return x =>
          (!x.availableChannel || x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
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
    // Only attempt getMatch if we have an eventId
    if (this.eventId) {
      let result = await this.requestHelper.getMatch(this.eventId);

      this.apiResponse = result;
    }

    return this;
  }

  get getMatchResponseSucceeded() {
    return isResponse20x(this.apiResponse);
  }

  get opportunityType() {
    if (!this.apiResponse) return;

    return this.apiResponse.body.data["@type"];
  }

  get opportunityId() {
    if (!this.apiResponse) return;

    return this.apiResponse.body.data["@id"];
  }

  get offerId() {
    if (!this.apiResponse) return;

    if (this.apiResponse.body.data["@type"] === "Slot") {
      return this.apiResponse.body.data.offers[0]["@id"];
    } else if (typeof this.apiResponse.body.data.superEvent.offers !== "undefined") {
      return this.apiResponse.body.data.superEvent.offers[0]["@id"];
    } else {
      return this.apiResponse.body.data.offers[0]["@id"];
    }
  }

  get sellerId() {
    if (!this.apiResponse) return;

    if (this.apiResponse.body.data["@type"] === "Slot") {
      return this.apiResponse.body.data.facilityUse.provider["@id"];
    } else {
      return this.apiResponse.body.data.superEvent.organizer["@id"];
    }
  }

  async putOrderQuoteTemplate () {
    let result = await this.requestHelper.putOrderQuoteTemplate(this.uuid, this);

    this.c1Response = result;

    return this;
  }

  get C1ResponseSucceeded() {
    return isResponse20x(this.c1Response);
  }

  get totalPaymentDue() {
    let response = this.c2Response || this.c1Response;

    if (!response) return;

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

  async putOrder () {
    let result = await this.requestHelper.putOrder(this.uuid, this);

    this.bResponse = result;

    return this;
  }

  get BResponseSucceeded() {
    return isResponse20x(this.bResponse);
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
}

module.exports = {
  RequestState
};
