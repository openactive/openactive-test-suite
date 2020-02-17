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

  // var eventId;
  // var opportunityId;
  // var offerId;
  // var sellerId;
  // var uuid;
  // var totalPaymentDue;
  // var orderItemId;
  //
  // var c1Response;
  // var c2Response;
  // var bResponse;
  // var uResponse;
  // var getOrderPromise;
  // var ordersFeedUpdate;

  get uuid() {
    if (this._uuid) return this._uuid;

    this._uuid = this.requestHelper.uuid();
    return this._uuid;
  }

  async createScheduledSession(event) {
    let session = await this.requestHelper.createScheduledSession(event, {
      sellerId: this.sellerId
    });

    this.eventId = session.respObj.body["@id"];

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
    Object.assign(this, result);

    return this;
  }

  /**
   * Assigns apiResponse, opportunityId,  offerId, sellerId
   * @returns {Promise<RequestStateHelper>}
   */
  async getMatch () {
    let result = await this.requestHelper.getMatch(this.eventId);
    Object.assign(this, result);
    return this;
  }

  /**
   * Assigns c1Response, totalPaymentDue
   * @returns {Promise<RequestStateHelper>}
   */
  async putOrderQuoteTemplate () {
    let result = await this.requestHelper.putOrderQuoteTemplate(this.uuid, this);
    Object.assign(this, result);
    return this;
  }

  /**
   * Assigns c2Response, totalPaymentDue
   * @returns {Promise<RequestStateHelper>}
   */
  async putOrderQuote () {
    let result = await this.requestHelper.putOrderQuote(this.uuid, this);
    Object.assign(this, result);
    return this;
  }

  /**
   * Assigns bResponse, orderItemId
   * @returns {Promise<RequestStateHelper>}
   */
  async putOrder () {
    let result = await this.requestHelper.putOrder(this.uuid, this);
    Object.assign(this, result);
    return this;
  }

  /**
   * Assigns uResponse
   * @returns {Promise<RequestStateHelper>}
   */
  async cancelOrder () {
    let result = await this.requestHelper.cancelOrder(this.uuid, this);
    Object.assign(this, result);
    return this;
  }
}

module.exports = {
  RequestStateHelper
};
