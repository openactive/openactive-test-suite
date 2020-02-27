const RequestHelper = require("./request-helper");
const pMemoize = require("p-memoize");

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

  async createOpportunity(dataItem) {
    let session = dataItem.randomEvent ?
      await this.requestHelper.getRandomOpportunity(dataItem.randomEvent, {}) :
      await this.requestHelper.createOpportunity(dataItem.event, {
        sellerId: this.sellerId
      });

    this.eventId = session.body["@id"];
    this.eventType = session.body["@type"];

    this.readonlyEvent = typeof dataItem.randomEvent !== "undefined";

    return session;
  }

  async deleteOpportunity() {
    if (!this.readonlyEvent) {
      await this.requestHelper.deleteOpportunity(this.eventId, this.eventType, {
        sellerId: this.sellerId
      });
    }
  }

  async getOrder () {
    let result = await this.requestHelper.getOrder(this.uuid);

    this.ordersFeedUpdate = result;

    return this;
  }

  get eventFound() {
    return this.getMatchSucceeded || false;
  }

  get rpdeItem() {
    if (!this.ordersFeedUpdate) return;

    return this.ordersFeedUpdate.body;
  }

  async getMatch () {
    // Only attempt getMatch if we have an eventId
    if (this.eventId) {
      let result = await this.requestHelper.getMatch(this.eventId);

      this.apiResponse = result;

      if (result.statusCode === 200 && typeof result.body.data !== "undefined") {
        this.getMatchSucceeded = true;
        return this;
      }
    }

    this.getMatchSucceeded = false;
    return this;
  }

  get opportunityId() {
    if (!this.apiResponse) return;

    return this.apiResponse.body.data["@id"];
  }

  get offerId() {
    if (!this.apiResponse) return;

    return this.apiResponse.body.data.superEvent.offers[0]["@id"];
  }

  get sellerId() {
    if (!this.apiResponse) return;

    return this.apiResponse.body.data.superEvent.organizer["@id"];
  }

  async putOrderQuoteTemplate () {
    let result = await this.requestHelper.putOrderQuoteTemplate(this.uuid, this);

    this.c1Response = result;

    return this;
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

  async putOrder () {
    let result = await this.requestHelper.putOrder(this.uuid, this);

    this.bResponse = result;

    return this;
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
}

module.exports = {
  RequestState
};
