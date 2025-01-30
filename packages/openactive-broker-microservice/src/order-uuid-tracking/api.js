const { state } = require('../state');
const { error400IfExpressParamsAreMissing } = require('../util/api-utils');
const { OrderUuidTracking } = require('./order-uuid-tracking');

/**
 * @typedef {import('express').Handler} ExpressHandler
 * @typedef {import('../models/core').OrderFeedType} OrderFeedType
 * @typedef {import('../models/core').OrderFeedIdentifier} OrderFeedIdentifier
 */

/**
 * @type {ExpressHandler}
 */
function getIsOrderUuidPresentApi(req, res) {
  if (!error400IfExpressParamsAreMissing(req, res, ['type', 'bookingPartnerIdentifier', 'uuid'])) { return; }
  const { type, bookingPartnerIdentifier, uuid } = req.params;
  OrderUuidTracking.checkIfOrderUuidIsPresentAndPotentiallyListenForIt(state.orderUuidTracking, {
    orderFeedType: /** @type {OrderFeedType} */(type),
    bookingPartnerIdentifier,
    uuid,
    res,
  });
}

module.exports = {
  getIsOrderUuidPresentApi,
};
