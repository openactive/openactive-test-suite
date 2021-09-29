const { log } = require('./util/log');

/**
 * @typedef {object} OnePhaseListener
 * @property {(json: unknown) => void} send
 * @property {() => void} cancel
 * @property {(item: unknown) => boolean} doesItemMatchCriteria
 */

/* TODO this logic can be merged with TwoPhaseListeners, which is very similar, but just has a different internal
interface (e.g. .collectRes(..) rather than .send(..)) */
class OnePhaseListeners {
  constructor() {
    /** @type {Map<string, OnePhaseListener>} */
    this._listeners = new Map();
  }

  /**
   * @param {string} listenerId
   */
  _cancelListenerIfExists(listenerId) {
    const listener = this._listeners.get(listenerId);
    if (listener) {
      listener.cancel();
    }
  }

  /**
   * @param {string} listenerId
   * @param {(item: unknown) => boolean} doesItemMatchCriteria Use this to filter which items the listener will trigger
   *   for. e.g., for a Slot, using `doesItemMatchCriteria=(slot) => slot.remainingSpaces === 2` will mean that the
   *   is only triggered for a Slot if it has `remainingSpaces` equal to 2. This means the listener will ignore an item
   *   with the correct ID if its `remainingSpaces` is equal to 3.
   *   If you just want any item with matching ID to be returned, regardless of its data, pass in `() => true`.
   * @param {import('express').Response} res
   */
  createListener(listenerId, doesItemMatchCriteria, res) {
    this._cancelListenerIfExists(listenerId);
    this._listeners.set(listenerId, {
      send: (json) => {
        res.json(json);
      },
      cancel: () => {
        log(`Ignoring previous request for One-Phase Listener: "${listenerId}"`);
        res.status(400).json({
          error: `A newer request to wait for One-Phase Listener "${listenerId}" has been received, so this request has been cancelled.`,
        });
      },
      doesItemMatchCriteria,
    });
  }

  /**
   * @param {string} listenerId
   * @param {unknown} item
   */
  doRespondToAndDeleteListenerIfExistsAndMatchesCriteria(listenerId, item) {
    const listener = this._listeners.get(listenerId);
    if (listener && listener.doesItemMatchCriteria(item)) {
      listener.send(item);
      this._listeners.delete(listenerId);
      return {
        didRespond: true,
      };
    }
    return {
      didRespond: false,
    };
  }
}

module.exports = {
  OnePhaseListeners,
};
