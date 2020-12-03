const { always } = require('ramda');

/**
 * Map that has a default value when an element doesn't exist. Inspired by defaultdict in Python.
 *
 * @template TKey
 * @template TValue
 * @extends {Map<TKey, TValue>}
 */
class DefaultMap extends Map {
  /**
   * @param {() => TValue} getDefaultFn
   */
  constructor(getDefaultFn) {
    super();
    this._getDefaultFn = getDefaultFn;
  }

  /**
   * Get element from the map. If it doesn't exist, it's set to the default value
   * (MUTATION) and the default value is returned
   *
   * @param {TKey} key
   */
  get(key) {
    const value = super.get(key);
    if (value !== undefined) {
      return value;
    }
    const defaultValue = this._getDefaultFn();
    this.set(key, defaultValue);
    return defaultValue;
  }
}

/**
 * A Map of tallies. The value under each key is a tally that can be added to. The
 * tally defaults to 0.
 *
 * @template TKey
 * @extends {DefaultMap<TKey, number>}
 */
class TallyMap extends DefaultMap {
  constructor() {
    super(always(0));
  }

  /**
   * Add to the tally at `key`. If there was no tally at this key before, the tally
   * will be initialized to 0 and then added to.
   *
   * @param {TKey} key
   * @param {number} amount
   */
  add(key, amount) {
    this.set(key, this.get(key) + amount);
  }

  /**
   * Add tallys from another Map.
   *
   * @param {Map<TKey, number>} anotherMap
   */
  addFromAnotherMap(anotherMap) {
    anotherMap.forEach((tally, key) => {
      this.add(key, tally);
    });
  }

  // /**
  //  * @param {TKey} key
  //  */
  // increment(key) {
  //   this.add(key, 1);
  // }
}

module.exports = {
  DefaultMap,
  TallyMap,
};
