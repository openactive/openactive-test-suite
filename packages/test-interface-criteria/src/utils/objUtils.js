/**
 * TODO document
 *
 * @template {Record<string, any>} TObj
 * @template {keyof TObj} TKey
 * @param {TKey[]} keys
 * @param {TObj} obj
 * @returns {[picked: Pick<TObj, TKey>, rest: Omit<TObj, TKey>]}
 */
function pickPartition(keys, obj) {
  const picked = {};
  const rest = {};
  for (const [key, value] of Object.entries(obj)) {
    if (keys.includes(/** @type {TKey} */(key))) {
      picked[key] = value;
    } else {
      rest[key] = value;
    }
  }
  return [
    /** @type {Pick<TObj, TKey>} */(picked),
    /** @type {Omit<TObj, TKey>} */(rest),
  ];
}

module.exports = {
  pickPartition,
};
