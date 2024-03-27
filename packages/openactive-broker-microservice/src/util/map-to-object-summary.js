/**
 * Convert an ES Map to a plain object (recursively), summarising some aspects
 * as follows:
 *
 * - Any value that is an ES Set will be replaced with its size
 * - Hide any properties which start with the character '_' in objects
 * - OpportunityIdCacheTypeBucket objects have special handling
 *
 * @param {Map | Set} map
 * @returns {{[k: string]: any} | number}
 */
function mapToObjectSummary(map) {
  if (map instanceof Map) {
    // Return a object representation of a Map
    const obj = Object.assign(Object.create(null), ...[...map].map((v) => (typeof v[1] === 'object' && v[1].size === 0
      ? {}
      : {
        [v[0]]: mapToObjectSummary(v[1]),
      })));
    if (JSON.stringify(obj) === JSON.stringify({})) {
      return undefined;
    }
    return obj;
  }
  if (map instanceof Set) {
    // Return just the size of a Set, to render at the leaf nodes of the resulting tree,
    // instead of outputting the whole set contents. This reduces the size of the output for display.
    return map.size;
  }
  // Special handling for OpportunityIdCacheTypeBuckets
  // @ts-ignore
  if (map.contents) {
    // @ts-ignore
    const result = mapToObjectSummary(map.contents);
    if (result && Object.keys(result).length > 0) {
      // @ts-ignore
      return result;
    }
    // @ts-ignore
    if (map.criteriaErrors && map.criteriaErrors.size > 0) {
      return {
        // @ts-ignore
        criteriaErrors: Object.fromEntries(map.criteriaErrors),
      };
    }
    return undefined;
  }
  // @ts-ignore
  if (map instanceof Object) {
    // Hide any properties that start with the character '_' in objects, as these are not intended for display
    return Object.fromEntries(Object.entries(map).filter(([k]) => k.charAt(0) !== '_'));
  }
  return map;
}

module.exports = {
  mapToObjectSummary,
};
