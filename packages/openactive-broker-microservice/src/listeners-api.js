const { DO_NOT_HARVEST_ORDERS_FEED, ORDERS_FEED_IDENTIFIER, ORDER_PROPOSALS_FEED_IDENTIFIER } = require('./broker-config');
const { state, Listeners, orderFeedContextIdentifier } = require('./state');
const { withOrdersRpdeHeaders, getOrdersFeedHeader } = require('./util/request-utils');

/**
 * @typedef {import('express').Handler} ExpressHandler
 * @typedef {import('./models/core').OrderFeedType} OrderFeedType
 * @typedef {import('./state').Listener} Listener
 */

/**
 * @type {ExpressHandler}
 */
function createOpportunityListenerApi(req, res) {
  if (!error400IfExpressParamsAreMissing(req, res, ['id'])) { return; }
  const { id } = req.params;
  if (!error409IfListenerAlreadyExists(res, state.listeners.byOpportunityId, 'opportunities', id)) { return; }
  if (state.listeners.byOpportunityId.has(id)) {
    res.status(409).send({
      error: `The @id "${id}" already has a listener registered. The same @id must not be used across multiple tests, or listened for multiple times concurrently within the same test.`,
    });
    return;
  }
  state.listeners.byOpportunityId.set(id, Listeners.createNewListener());
  res.status(204).send();
}

/**
 * @type {ExpressHandler}
 */
function getOpportunityListenerApi(req, res) {
  if (!error400IfExpressParamsAreMissing(req, res, ['id'])) { return; }
  const { id } = req.params;
  if (!doPendOrRespondToGetListenerRequest(res, state.listeners.byOpportunityId, id)) {
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
  const listenerId = Listeners.getOrderListenerId(/** @type {OrderFeedType} */(type), bookingPartnerIdentifier, uuid);
  if (!doPendOrRespondToGetListenerRequest(res, state.listeners.byOrderUuid, listenerId)) {
    res.status(404).json({
      error: `Listener for Order with Listener ID "${listenerId}" not found`,
    });
  }
}

/**
 * @param {Map<string, Listener>} listenersMap
 * @param {string} listenerId
 * @returns {boolean} `true` if it was found. `false` if no listener was found.
 */
function doPendOrRespondToGetListenerRequest(res, listenersMap, listenerId) {
  if (!state.listeners.byOrderUuid.has(listenerId)) {
    return false;
  }
  const { item } = listenersMap.get(listenerId);
  if (!item) {
    listenersMap.set(listenerId, Listeners.createPendingListener(res));
  } else {
    // TODO TODO TODO This can use the same function that handleListeners uses with { collectRes: res, item }
    res.json(item);
    listenersMap.delete(listenerId);
  }
  return true;
}

/**
 * @type {ExpressHandler}
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
  const listenerId = Listeners.getOrderListenerId(/** @type {OrderFeedType} */(type), bookingPartnerIdentifier, uuid);
  if (!error409IfListenerAlreadyExists(res, state.listeners.byOpportunityId, type, listenerId)) { return; }
  state.listeners.byOrderUuid.set(listenerId, Listeners.createNewListener());
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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string[]} requiredParamNames
 * @returns {boolean} If true, the required params are included
 */
function error400IfExpressParamsAreMissing(req, res, requiredParamNames) {
  for (const paramName of requiredParamNames) {
    if (!req.params[paramName]) {
      res.status(400).json({
        error: `${paramName} is required`,
      });
      return false;
    }
  }
  return true;
}

/**
 * @param {import('express').Response} res
 * @param {Map<string, Listener>} listenersMap
 * @param {string} type e.g. "opportunities"
 * @param {string} listenerId
 * @returns {boolean} If false, this caused an error.
 */
function error409IfListenerAlreadyExists(res, listenersMap, type, listenerId) {
  if (listenersMap.has(listenerId)) {
    res.status(409).send({
      error: `A listener for ${type} with ID: "${listenerId}" has already been registered. The same ${
        type === 'opportunities' ? 'Opportunity @id' : 'Order UUID'
      } must not be used across multiple tests, or listened for multiple times concurrently within the same test.`,
    });
    return false;
  }
  return true;
}

module.exports = {
  createOpportunityListenerApi,
  getOpportunityListenerApi,
  createOrderListenerApi,
  getOrderListenerApi,
};
