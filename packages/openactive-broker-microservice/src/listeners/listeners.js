/**
 * @typedef {import('../models/core').OrderFeedType} OrderFeedType
 *
 * @typedef {{
 *   item: any | null,
 *   collectRes: import('express').Response | null,
 * }} Listener
 *
 * @typedef {Map<string, Listener>} ListenersMap
 */

const Listeners = {
  /**
   * @param {OrderFeedType} type
   * @param {string} bookingPartnerIdentifier
   * @param {string} uuid
   */
  getOrderListenerId(type, bookingPartnerIdentifier, uuid) {
    return `${type}::${bookingPartnerIdentifier}::${uuid}`;
  },
  /** @returns {ListenersMap} */
  createListenersMap() {
    return new Map();
  },
  /**
   * Listener that has just been created.
   *
   * @returns {Listener}
   */
  createNewListener() {
    return {
      item: null,
      collectRes: null,
    };
  },
  /**
   * Listener which is awaiting response from a Broker API client.
   *
   * @param {import('express').Response} res
   * @returns {Listener}
   */
  createPendingListener(res) {
    return {
      item: null,
      collectRes: res,
    };
  },
  /**
   * Listener whose item has been found but it is not yet awaiting response from a Broker API client.
   *
   * @param {Listener['item']} item
   * @returns {Listener}
   */
  createResolvedButNotPendingListener(item) {
    return {
      item,
      collectRes: null,
    };
  },
  /**
   * Once an item has been found for a listener and the Broker API client is awaiting a response, use this
   * to respond to the client and then clear the listener.
   *
   * @param {ListenersMap} listenersMap
   * @param {string} listenerId
   * @param {import('express').Response} res
   * @param {any} item
   */
  doRespondToAndDeleteListener(listenersMap, listenerId, res, item) {
    res.json(item);
    listenersMap.delete(listenerId);
  },
  /**
   * For an item being harvested from RPDE, check if there is a listeners listening for it.
   *
   * If so, respond to that listener.
   *
   * @param {ListenersMap} listenersMap
   * @param {string} listenerId
   * @param {any} item
   */
  doNotifyListener(listenersMap, listenerId, item) {
    // If there is a listener for this ID, either the listener map needs to be populated with the item or
    // the collection request must be fulfilled
    if (listenersMap.has(listenerId)) {
      const { collectRes } = listenersMap.get(listenerId);
      // If there's already a collection request, fulfill it
      if (collectRes) {
        Listeners.doRespondToAndDeleteListener(listenersMap, listenerId, collectRes, item);
      } else {
        // If not, set the opportunity so that it can returned when the collection call arrives
        listenersMap.set(listenerId, Listeners.createResolvedButNotPendingListener(item));
      }
    }
  },
};

module.exports = {
  Listeners,
};
