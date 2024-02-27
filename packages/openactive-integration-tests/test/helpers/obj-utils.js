const _ = require('lodash');

/**
 * ```js
 * > recursivelyObjectEntries({ a: { ab: { abc: 1 } }, b: 2 })
 * [
 *   [ 'a', [
 *     [ 'ab', [
 *       [ 'abc', 1 ]
 *     ]]
 *   ]],
 *   [ 'b', 2 ]
 * ]
 * ```
 *
 * @param {Record<string, unknown>} obj
 * @returns {[key: string, value: unknown][]}
 */
function recursivelyObjectEntries(obj) {
  return Object.entries(obj).map(([key, value]) => {
    if (_.isPlainObject(value)) {
      return [
        key,
        recursivelyObjectEntries(/** @type {Record<string, unknown>} */(value)),
      ];
    }
    return [key, value];
  });
}

module.exports = {
  recursivelyObjectEntries,
};
