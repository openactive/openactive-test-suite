/**
 * TODO document
 *
 * @template {Record<string, any>} TObj
 * @template {keyof TObj} TKey
 * @param {TKey[]} keys
 * @param {TObj} obj
 * @returns {[picked: Pick<TObj, TKey>, rest: Omit<TObj, TKey>]}
 */
export function pickPartition<TObj extends Record<string, any>, TKey extends keyof TObj>(keys: TKey[], obj: TObj): [picked: Pick<TObj, TKey>, rest: Omit<TObj, TKey>];
