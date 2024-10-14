const jsonpath = require('jsonpath');
const { isEqual, isNil } = require('lodash');

/**
 * @typedef {import('../models/core').OrderFeedType} OrderFeedType
 */
/**
 * @typedef {object} ListenerItemRequirement
 *   As an example, with the following requirement:
 *   ```
 *   {
 *     jsonPath: '$.data.orderedItem[*].orderItemStatus',
 *     checkType: 'anyNotEquals',
 *     checkValue: 'https://openactive.io/OrderItemConfirmed'
 *   }
 *   ```
 *   This requirement will be satisfied by an Order, which, for example, has one
 *   cancelled OrderItem.
 * @property {string} jsonPath A JSONPath query. This query will extract an
 *   array of specific values from the item. The extracted values will be
 *   checked against the `checkValue` property using the specified `checkType`.
 * @property {'allNotEqual' | `atLeastNNotEqual`} checkType What type of check to perform. Types:
 *   - `allNotEqual`: All of the extracted values must not equal `checkValue`.
 *     This will return `false` if there are no extracted values.
 *   - `atLeastNNotEqual`: At least N of the extracted values must not equal
 *     `checkValue`. This will return `false` if there are no extracted values.
 *     `N` must be specified in `checkArgs.n`.
 *
 *   Equality is determined using `lodash.isEqual`, so arrays/objects/etc can be
 *   compared.
 * @property {unknown} checkValue The value to compare against.
 * @property {{ n?: number }} [checkArgs] Arguments that can modify the kind of
 *   check.
 */
/**
 * @typedef {object} Listener
 * @property {ListenerItemRequirement[]} itemRequirements
 *   TODO2 document
 * @property {any | null} item When the listener finds the item, it will be
 *   stored here if collection has not yet been requested.
 * @property {import('express').Response | null} collectRes When collection is
 *   requested, the express response will be stored here. This can then be used
 *   to send the found item to the client.
 *
 * @typedef {Map<string, Listener>} ListenersMap
 */

/**
 * "2-phase" listeners because the listening and collection happen as two
 * separate API calls (a POST to set up the listener and a GET to retrieve the
 * found item).
 */
const TwoPhaseListeners = {
  /**
   * @param {OrderFeedType} type
   * @param {string} bookingPartnerIdentifier
   * @param {string} uuid
   */
  getOrderListenerId(type, bookingPartnerIdentifier, uuid) {
    return `${type}::${bookingPartnerIdentifier}::${uuid}`;
  },
  /**
   * Is this Order listener ID from this feed with this booking partner identifier?
   *
   * @param {string} listenerId
   * @param {OrderFeedType} feedType
   * @param {string} bookingPartnerIdentifier
   */
  isOrderListenerIdFromSameFeed(listenerId, feedType, bookingPartnerIdentifier) {
    return listenerId.startsWith(`${feedType}::${bookingPartnerIdentifier}`);
  },
  /** @returns {ListenersMap} */
  createListenersMap() {
    return new Map();
  },
  /**
   * Listener that has just been created.
   *
   * @param {ListenerItemRequirement[]} itemRequirements
   * @returns {Listener}
   */
  createNewListener(itemRequirements) {
    return {
      itemRequirements,
      item: null,
      collectRes: null,
    };
  },
  /**
   * Listener which is awaiting response from a Broker API client.
   *
   * @param {import('express').Response} res
   * @param {ListenerItemRequirement[]} itemRequirements
   * @returns {Listener}
   */
  createPendingListener(res, itemRequirements) {
    return {
      itemRequirements,
      item: null,
      collectRes: res,
    };
  },
  /**
   * Listener whose item has been found but it is not yet awaiting response from a Broker API client.
   *
   * @param {Listener['item']} item
   * @param {ListenerItemRequirement[]} itemRequirements
   * @returns {Listener}
   */
  createResolvedButNotPendingListener(item, itemRequirements) {
    return {
      itemRequirements,
      item,
      collectRes: null,
    };
  },
  /**
   * For an item being harvested from RPDE, check if there is a listener listening for it.
   *
   * If yes, and the item meets the listener's requirements, respond to that listener.
   *
   * @param {ListenersMap} listenersMap
   * @param {string} listenerId
   * @param {any} item
   */
  doNotifyListener(listenersMap, listenerId, item) {
    // If there is a listener for this ID, either the listener map needs to be populated with the item or
    // the collection request must be fulfilled
    if (listenersMap.has(listenerId)) {
      const { collectRes, itemRequirements } = listenersMap.get(listenerId);
      const meetsRequirements = doesItemMeetItemRequirements(listenerId, itemRequirements, item);
      if (!meetsRequirements) {
        return;
      }
      // If there's already a collection request, fulfill it
      if (collectRes) {
        doRespondToAndDeleteListener(listenersMap, listenerId, collectRes, item);
      } else {
        // If not, set the opportunity so that it can returned when the collection call arrives
        listenersMap.set(listenerId, TwoPhaseListeners.createResolvedButNotPendingListener(item, itemRequirements));
      }
    }
  },

  /**
   * TODO2 document this. Similar style to `doNotifyListener`.
   *
   * @param {import('express').Response} res
   * @param {Map<string, Listener>} listenersMap
   * @param {string} listenerId
   * @param {import('./twoPhaseListeners').ListenerItemRequirement[]} itemRequirements
   * @returns {boolean} `true` if it was found. `false` if no listener was found.
   */
  doPendOrRespondToGetListenerRequest(res, listenersMap, listenerId, itemRequirements) {
    if (!listenersMap.has(listenerId)) {
      return false;
    }
    const { item } = listenersMap.get(listenerId);
    if (!item) {
      listenersMap.set(listenerId, TwoPhaseListeners.createPendingListener(res, itemRequirements));
    } else {
      doRespondToAndDeleteListener(listenersMap, listenerId, res, item);
    }
    return true;
  },
};

/**
 * Once an item has been found for a listener and the Broker API client is awaiting a response, use this
 * to respond to the client and then clear the listener.
 *
 * @param {ListenersMap} listenersMap
 * @param {string} listenerId
 * @param {import('express').Response} res
 * @param {any} item
 */
function doRespondToAndDeleteListener(listenersMap, listenerId, res, item) {
  res.json(item);
  listenersMap.delete(listenerId);
}

/**
 * @param {string} listenerId Used for error messages
 * @param {unknown} item
 * @param {ListenerItemRequirement[]} itemRequirements
 */
function doesItemMeetItemRequirements(listenerId, itemRequirements, item) {
  if (itemRequirements.length === 0) {
    return true;
  }
  return itemRequirements.every(({ jsonPath, checkType, checkValue, checkArgs }, i) => {
    const extractedValues = jsonpath.query(item, jsonPath);
    switch (checkType) {
      case 'allNotEqual': {
        if (extractedValues.length === 0) {
          return false;
        }
        return extractedValues.every((value) => !isEqual(value, checkValue));
      }
      case 'atLeastNNotEqual': {
        if (extractedValues.length === 0) {
          return false;
        }
        const { n } = checkArgs;
        if (isNil(n)) {
          throw new Error(`ListenerItemRequirement (index: ${i}, for listener ID: ${listenerId}) is missing \`n\` in \`checkArgs\` for \`atLeastNNotEqual\` check type`);
        }
        const valuesWhichAreNotEqual = extractedValues.filter((value) => !isEqual(value, checkValue));
        const amountWhichAreNotEqual = valuesWhichAreNotEqual.length;
        return amountWhichAreNotEqual >= n;
      }
      default:
        throw new Error(`Unknown check type: ${checkType}`);
    }
  });
}

module.exports = {
  TwoPhaseListeners,
};
