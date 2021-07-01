const { Listeners } = require('../listeners/listeners');

const IsOrderUuidPresent = {
  createState() {
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
       * e.g. `Map { 'OrdersFeed (auth:primary)' => false, 'OrderProposalsFeed (auth:secondary)' => true, ... }`
       *
       * @type {Map<string, boolean>}
       */
      hasReachedEndOfFeedMap: new Map(),
      /**
       * Listeners which are waiting for info on whether or not a given Order UUID is present in a given feed.
       *
       * Key of this map is a `feedContextIdentifier` e.g. 'OrdersFeed (auth:secondary)'
       */
      listeners: Listeners.createListenersMap(),
    };
  },
};

module.exports = {
  IsOrderUuidPresent,
};
