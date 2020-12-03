/**
 * It is necessary to use this module rather than directly using config.get or config.has
 * because this module, when imported, sets up the config directory, which is at the
 * top openactive-test-suite level rather than being in this package.
 */
const path = require('path');

// Inform config library that config is in the root directory (https://github.com/lorenwest/node-config/wiki/Configuration-Files#config-directory)
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', '..', '..', '..', 'config');
const config = require('config');

/**
 * @typedef {import('../../../../config/default.json')} Config
 */

// TODO This could be improved so as to trivially accept a path with any level of nesting (rather than just {broker|integrationTests}.{key}).
// However, this requires either:
// - Switching to full TS (so we can use with template `TPath extends string[]`. We'd have to use const assertions with each invokation which is not possible in JSDoc)
//   And using ts-toolbelt's Object.Path type
// - Upgrading to TS 4.1 so we can use template literal types and then just use a dotted notation path (e.g. 'broker.datasetSiteUrl')
/**
 * Wrapper around config.get. Improves it by returning the correct type for the value.
 *
 * Note that this throws if the config var is not found
 *
 * @template {'broker' | 'integrationTests'} TSubConfigPath
 * @template {keyof Config[TSubConfigPath]} TKey
 * @param {TSubConfigPath} subConfigPath
 * @param {TKey} key
 * @returns {Config[TSubConfigPath][TKey]}
 */
function getConfigVarOrThrow(subConfigPath, key) {
  const dottedPath = `${subConfigPath}.${key}`;
  return config.get(dottedPath);
}

//  * @returns {import('ts-toolbelt').Object.Path<Config, [TSubConfigPath, TKey]>}
/**
 * Wrapper around config.get. Improves it by returning the correct type for the value.
 *
 * Instead of throwing if the path does not exist, a default value will be returned instead
 *
 * @template {'broker' | 'integrationTests'} TSubConfigPath
 * @template {keyof Config[TSubConfigPath]} TKey
 * @param {TSubConfigPath} subConfigPath
 * @param {TKey} key
 * @param {Config[TSubConfigPath][TKey]} defaultValue
 * @returns {Config[TSubConfigPath][TKey]}
 */
function getConfigVarOrDefault(subConfigPath, key, defaultValue) {
  const dottedPath = `${subConfigPath}.${key}`;
  if (config.has(dottedPath)) {
    return config.get(dottedPath);
  }
  return defaultValue;
}

module.exports = {
  getConfigVarOrThrow,
  getConfigVarOrDefault,
};
