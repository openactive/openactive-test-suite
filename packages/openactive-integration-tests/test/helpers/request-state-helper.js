const RequestHelper = require("./request-helper");
const pMemoize = require("p-memoize");

class RequestStateHelper {
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

  async createScheduledSession(event) {
    let session = await this.requestHelper.createScheduledSession(event, {
      sellerId: this.sellerId
    });

    this.eventId = session.body["@id"];

    return session;
  }

  async deleteScheduledSession() {
    await this.requestHelper.deleteScheduledSession(eventId, {
      sellerId
    });
  }

  /**
   * Assigns rpdeItem, ordersFeedUpdate
   * @returns {Promise<RequestStateHelper>}
   */
  async getOrder () {
    let result = await this.requestHelper.getOrder(this.uuid);

    this.ordersFeedUpdate = result;

    return this;
  }

  get rpdeItem() {
    if (!this.ordersFeedUpdate) return;

    return this.ordersFeedUpdate.body;
  }

  /**
   * Assigns apiResponse, opportunityId,  offerId, sellerId
   * @returns {Promise<RequestStateHelper>}
   */
  async getMatch () {
    let result = await this.requestHelper.getMatch(this.eventId);

    this.apiResponse = result;

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

  /**
   * Assigns c1Response, totalPaymentDue
   * @returns {Promise<RequestStateHelper>}
   */
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

  /**
   * Assigns c2Response, totalPaymentDue
   * @returns {Promise<RequestStateHelper>}
   */
  async putOrderQuote () {
    let result = await this.requestHelper.putOrderQuote(this.uuid, this);

    this.c2Response = result;

    return this;
  }

  /**
   * Assigns bResponse, orderItemId
   * @returns {Promise<RequestStateHelper>}
   */
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

  /**
   * Assigns uResponse
   * @returns {Promise<RequestStateHelper>}
   */
  async cancelOrder () {
    let result = await this.requestHelper.cancelOrder(this.uuid, this);

    this.uResponse = result;

    return this;
  }
}

module.exports = {
  RequestStateHelper
};
