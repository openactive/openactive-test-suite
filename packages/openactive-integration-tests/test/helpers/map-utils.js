const { always } = require('ramda');

/**
 * TODO TODO TODO document
 *
 * @template {Map<unknown>} TMap
 * @param {(mapThatIsMergedIntoMut: TMap, mapThatIsMergedFrom: TMap) => void} mergerFnMut
 *   Function that merges one map into another.
 * @param {TMap} mapThatIsMergedIntoMut Maps will be merged into this one. It will be mutated.
 * @param {TMap[]} maps
 * @returns {TMap}
 */
function mergeMapsWithMut(mergerFnMut, mapThatIsMergedIntoMut, maps) {
  for (const map of maps) {
    mergerFnMut(mapThatIsMergedIntoMut, map);
  }
  return mapThatIsMergedIntoMut;
}

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
   * @param {[TKey, TValue][]} [entries]
   */
  constructor(getDefaultFn, entries) {
    super(entries);
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
  /**
   * @param {[TKey, number][]} [entries]
   */
  constructor(entries) {
    super(always(0), entries);
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
   * Merges TallyMaps by adding the tallies together for keys which are in both maps.
   *
   * @template TKey
   * @param {TallyMap<TKey>} mapThatIsMergedIntoMut
   * @param {TallyMap<TKey>} mapThatIsMergedFrom
   */
  static mergerMut(mapThatIsMergedIntoMut, mapThatIsMergedFrom) {
    mapThatIsMergedFrom.forEach((tally, key) => {
      mapThatIsMergedIntoMut.add(key, tally);
    });
  }

  /**
   * @template TKey
   * @param {TallyMap<TKey>[]} tallyMaps
   * @returns {TallyMap<TKey>}
   */
  static combine(tallyMaps) {
    return mergeMapsWithMut(TallyMap.mergerMut, new TallyMap(), tallyMaps);
  }
}

module.exports = {
  mergeMapsWithMut,
  DefaultMap,
  TallyMap,
};
