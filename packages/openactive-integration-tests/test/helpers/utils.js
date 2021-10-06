/**
 * A kind of map(..) function
 *
 * @template TInputItem
 * @template TCacheKey
 * @template TOutputItem
 *
 * @param {TInputItem[]} collection
 * @param {(item: TInputItem) => TCacheKey} getCacheKey
 * @param {(item: TInputItem, key: TCacheKey) => Promise<TOutputItem>} getValue
 */
async function pMapWithCache(collection, getCacheKey, getValue) {
  /** @type {Map<TCacheKey, Promise<TOutputItem>>} */
  const cache = new Map();
  const resultPromises = collection.map((item) => {
    const cacheKey = getCacheKey(item);
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const resultPromise = getValue(item, cacheKey);
    cache.set(cacheKey, resultPromise);
    return resultPromise;
  });
  return await Promise.all(resultPromises);
}

module.exports = {
  pMapWithCache,
};
