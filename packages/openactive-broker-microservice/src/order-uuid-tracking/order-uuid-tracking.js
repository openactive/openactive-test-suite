const { ORDERS_FEED_IDENTIFIER, ORDER_PROPOSALS_FEED_IDENTIFIER } = require('../broker-config');
const { Listeners } = require('../listeners/listeners');
const { orderFeedContextIdentifier } = require('../util/feed-context-identifier');

/**
 * @typedef {import('../models/core').OrderFeedType} OrderFeedType
 */

/**
 * - "Is Order UUID present?"
 *  - state:
 *      - uuidsInOrderFeeds: Map { {feedContextIdentifier} => Set<string> }
 *      - "has reached end of feed?": Map { {feedContextIdentifier} => boolean }
 *  - API:
 *      - GET /is-order-uuid-present/:type/:bpi/:uuid
 *      - If in uuidsInOrderFeeds: return true
 *      - else if "has reached end of feed?": return false
 *      - Set up an "Is Order UUID present?" listener
 *  - On order feed harvest item:
 *      - doNotify (item=true) on "Is Order UUID present?" listeners map
 *  - On end of order feed (setFeedIsUpToDate):
 *      - doNotify (item=false) on any pending "Is Order UUID present?" listeners for this feed (pseudo: `keys().filter(k => k.split('::')[0:2] == ['orders-feed', 'primary'])`)
 *  - As a listener..
 *      - item = boolean
 *      - If item is found, return `true`. If not found and end of feed is reached, return `false`.
 */

const OrderUuidTracking = {
  createState,
  /**
   * For an Order that's been harvested from RPDE, track that its UUID has been spotted and potentially respond to a
   * listener that's listening for it.
   *
   * @param {OrderUuidTrackingState} orderUuidTrackingState
   * @param {OrderFeedType} type
   * @param {string} bookingPartnerIdentifier
   * @param {string} uuid
   */
  doTrackOrderUuidAndUpdateListeners(orderUuidTrackingState, type, bookingPartnerIdentifier, uuid) {
    const feedIdentifier = orderFeedTypeToIdentifier(type);
    const feedContextIdentifier = orderFeedContextIdentifier(feedIdentifier, bookingPartnerIdentifier);
    // Since this is a newly harvested Order, the feed must still be being harvested
    orderUuidTrackingState.hasReachedEndOfFeedMap.set(feedContextIdentifier, false);
    // Record that this UUID has been seen in this feed
    const uuidsInOrderFeed = (() => {
      if (!orderUuidTrackingState.uuidsInOrderMap.has(feedContextIdentifier)) {
        orderUuidTrackingState.uuidsInOrderMap.set(feedContextIdentifier, new Set());
      }
      return orderUuidTrackingState.uuidsInOrderMap.get(feedContextIdentifier);
    })();
    uuidsInOrderFeed.add(uuid);
    // Notify listener if there is one
    const listenerId = Listeners.getOrderListenerId(type, bookingPartnerIdentifier, uuid);
    Listeners.doNotifyListener(orderUuidTrackingState.isPresentListeners, listenerId, true);
  },
  /**
   * Track that an order feed has been harvested to completion. This will also resolve UUID tracking listeners -
   * as their UUID hasn't been spotted yet, that UUID must not exist in the feed.
   *
   * @param {OrderUuidTrackingState} orderUuidTrackingState
   * @param {OrderFeedType} type
   * @param {string} bookingPartnerIdentifier
   */
  doTrackEndOfFeed(orderUuidTrackingState, type, bookingPartnerIdentifier) {
    const feedIdentifier = orderFeedTypeToIdentifier(type);
    const feedContextIdentifier = orderFeedContextIdentifier(feedIdentifier, bookingPartnerIdentifier);
    // Feed has reached the end.
    orderUuidTrackingState.hasReachedEndOfFeedMap.set(feedContextIdentifier, true);
    /* Notify any listeners for this feed. If they are still pending and the feed has ended, this must mean
    that these UUIDs have not been found */
    for (const listenerId of orderUuidTrackingState.isPresentListeners.keys()) {
      if (Listeners.isOrderListenerIdFromSameFeed(listenerId, type, bookingPartnerIdentifier)) {
        Listeners.doNotifyListener(orderUuidTrackingState.isPresentListeners, listenerId, false);
      }
    }
  },
};

function createState() {
  return {
    /**
     * Map { [feedContextIdentifier] => Set { [Order UUID 1], ... } }
     *
     * e.g. `Map { 'OrdersFeed (auth:primary)' => Set { '84409263-825a-4a73-a149-f05fa5b5ed8d', ... }, ... }`
     *
     * @type {Map<string, Set<string>>}
     */
    uuidsInOrderMap: new Map(),
    /**
     * Map { [feedContextIdentifier] => [has this feed been harvested to the end?] }
     *
     * If a feed is not in this map, then it has not been harvested to the end
     *
     * e.g. `Map { 'OrderProposalsFeed (auth:secondary)' => true, ... }`
     *
     * @type {Map<string, boolean>}
     */
    hasReachedEndOfFeedMap: new Map(),
    /**
     * Listeners which are waiting for info on whether or not a given Order UUID is present in a given feed.
     *
     * Keys of this map are of the form `{type}::{bookingPartnerIdentifier}::{orderUuid}` e.g.
     * `orders::primary::4324d932-a326-4cc7-bcc0-05fb491744c7`.
     *
     * The `item` in the Listener is a boolean. `true` if the Order UUID is present, `false` otherwise.
     */
    isPresentListeners: Listeners.createListenersMap(),
  };
}

/**
 * @param {import('../models/core').OrderFeedType} type
 * @returns {import('../models/core').OrderFeedIdentifier}
 */
function orderFeedTypeToIdentifier(type) {
  switch (type) {
    case 'orders':
      return ORDERS_FEED_IDENTIFIER;
    case 'order-proposals':
      return ORDER_PROPOSALS_FEED_IDENTIFIER;
    default:
      throw new Error(`Unrecognised Order Feed type: ${type}`);
  }
}

/**
 * @typedef {ReturnType<typeof createState>} OrderUuidTrackingState
 */

module.exports = {
  OrderUuidTracking,
  orderFeedTypeToIdentifier,
};
