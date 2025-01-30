const { DO_NOT_HARVEST_ORDERS_FEED, ORDERS_FEED_IDENTIFIER, ORDER_PROPOSALS_FEED_IDENTIFIER } = require('../broker-config');
const { state } = require('../state');
const { error400IfExpressParamsAreMissing } = require('../util/api-utils');
const { orderFeedContextIdentifier } = require('../util/feed-context-identifier');
const { withOrdersRpdeHeaders, getOrdersFeedHeader } = require('../util/request-utils');
const { TwoPhaseListeners } = require('./twoPhaseListeners');
const { error409IfListenerAlreadyExists } = require('./utils');

/**
 * @typedef {import('express').Handler} ExpressHandler
 * @typedef {import('../models/core').OrderFeedType} OrderFeedType
 */

/**
 * @type {ExpressHandler}
 */
function createOpportunityListenerApi(req, res) {
  if (!error400IfExpressParamsAreMissing(req, res, ['id'])) { return; }
  const { id } = req.params;
  if (!error409IfListenerAlreadyExists(res, state.twoPhaseListeners.byOpportunityId, 'opportunities', id)) { return; }
  // At present, item expectations are only supported for Orders.
  state.twoPhaseListeners.byOpportunityId.set(id, TwoPhaseListeners.createNewListener([]));
  res.status(204).send();
}

/**
 * @type {ExpressHandler}
 */
function getOpportunityListenerApi(req, res) {
  if (!error400IfExpressParamsAreMissing(req, res, ['id'])) { return; }
  const { id } = req.params;
  // At present, item expectations are only supported for Orders.
  if (!TwoPhaseListeners.doPendOrRespondToGetListenerRequest(res, state.twoPhaseListeners.byOpportunityId, id)) {
    res.status(404).json({
      error: `Listener for Opportunity with @id "${id}" not found`,
    });
  }
}

/**
 * @type {ExpressHandler}
 */
function getOrderListenerApi(req, res) {
  if (!error400IfExpressParamsAreMissing(req, res, ['type', 'bookingPartnerIdentifier', 'uuid'])) { return; }
  const { type, bookingPartnerIdentifier, uuid } = req.params;
  const listenerId = TwoPhaseListeners.getOrderListenerId(/** @type {OrderFeedType} */(type), bookingPartnerIdentifier, uuid);
  if (!TwoPhaseListeners.doPendOrRespondToGetListenerRequest(res, state.twoPhaseListeners.byOrderUuid, listenerId)) {
    res.status(404).json({
      error: `Listener for Order with Listener ID "${listenerId}" not found`,
    });
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function createOrderListenerApi(req, res) {
  if (DO_NOT_HARVEST_ORDERS_FEED) {
    res.status(403).json({
      error: 'Order feed items are not available as \'disableOrdersFeedHarvesting\' is set to \'true\' in the test suite configuration.',
    });
    return;
  }
  if (!error400IfExpressParamsAreMissing(req, res, ['type', 'bookingPartnerIdentifier', 'uuid'])) { return; }
  const { type, bookingPartnerIdentifier, uuid } = req.params;
  const itemExpectations = req.body?.itemExpectations ?? [];
  const listenerId = TwoPhaseListeners.getOrderListenerId(/** @type {OrderFeedType} */(type), bookingPartnerIdentifier, uuid);
  if (!error409IfListenerAlreadyExists(res, state.twoPhaseListeners.byOrderUuid, type, listenerId)) { return; }
  state.twoPhaseListeners.byOrderUuid.set(listenerId, TwoPhaseListeners.createNewListener(itemExpectations));
  const feedContext = state.feedContextMap.get(
    orderFeedContextIdentifier(
      type === 'orders' ? ORDERS_FEED_IDENTIFIER : ORDER_PROPOSALS_FEED_IDENTIFIER,
      bookingPartnerIdentifier,
    ),
  );
  res.status(200).send({
    headers: await withOrdersRpdeHeaders(getOrdersFeedHeader(bookingPartnerIdentifier))(),
    startingFeedPage: feedContext?.currentPage,
    message: `Listening for UUID: '${uuid}' in feed: ${type}, for Booking Partner: ${bookingPartnerIdentifier} from startingFeedPage using headers`,
  });
}

module.exports = {
  createOpportunityListenerApi,
  getOpportunityListenerApi,
  createOrderListenerApi,
  getOrderListenerApi,
};
