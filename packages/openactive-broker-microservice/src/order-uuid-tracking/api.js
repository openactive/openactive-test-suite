const { error409IfListenerAlreadyExists } = require('../twoPhaseListeners/api');
const { TwoPhaseListeners: Listeners } = require('../twoPhaseListeners/twoPhaseListeners');
const { state } = require('../state');
const { error400IfExpressParamsAreMissing } = require('../util/api-utils');
const { orderFeedContextIdentifier } = require('../util/feed-context-identifier');
const { orderFeedTypeToIdentifier } = require('./order-uuid-tracking');

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
  const feedIdentifier = orderFeedTypeToIdentifier(/** @type {OrderFeedType} */(type));
  const feedContextIdentifier = orderFeedContextIdentifier(feedIdentifier, bookingPartnerIdentifier);
  if (!error409IfListenerAlreadyExists(res, state.orderUuidTracking.isPresentListeners, 'Order Tracking', feedContextIdentifier)) { return; }
  // If the UUID has been seen already, then we can answer immediately - it's present
  const isOrderUuidPresentSoFar = state.orderUuidTracking.uuidsInOrderMap.get(feedContextIdentifier)?.has(uuid);
  if (isOrderUuidPresentSoFar) {
    res.json(true);
    return;
  }
  // Otherwise, if the end of the feed has already been reached, we know that the UUID is NOT present
  if (state.orderUuidTracking.hasReachedEndOfFeedMap.get(feedContextIdentifier)) {
    res.json(false);
    return;
  }
  // Otherwise, we do not yet have sufficient information. Wait until we do.
  const listenerId = Listeners.getOrderListenerId(/** @type {OrderFeedType} */(type), bookingPartnerIdentifier, uuid);
  // Since we're just tracking that it's UUID has been seend, and so we don't need any item requirements
  state.orderUuidTracking.isPresentListeners.set(listenerId, Listeners.createPendingListener(res, []));
}

module.exports = {
  getIsOrderUuidPresentApi,
};
