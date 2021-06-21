// workers/auth.js
const { validate } = require('@openactive/data-model-validator');
const { expose } = require('threads/worker');
const { silentlyAllowInsecureConnections } = require('../util/suppress-unauthorized-warning');

// Note this is duplicated between app.js and validator.js, for efficiency
const VALIDATOR_TMP_DIR = './tmp';

silentlyAllowInsecureConnections();

/**
 * Use OpenActive validator to validate the RPDE item
 *
 * @param {any} body the data item
 */
async function validateItem(body, validationMode) {
  /* When re-harvesting the feed frequently during development, this can speed up the process. However, note
  that leaving this on may allow Broker to miss some critical issues which will cause confusing errors later down
  the line */
  if (process.env.DEBUG_BROKER_NO_VALIDATE === 'true') {
    return [];
  }
  /**
   * @type {{
   *   loadRemoteJson: boolean,
   *   remoteJsonCachePath: string,
   *   remoteJsonCacheTimeToLive: number,
   *   validationMode?: string,
   * }}
   */
  const optionsWithRemoteJson = {
    loadRemoteJson: true,
    remoteJsonCachePath: VALIDATOR_TMP_DIR,
    remoteJsonCacheTimeToLive: 3600,
    validationMode,
  };

  const errors = (await validate(body, optionsWithRemoteJson))
    .filter((result) => result.severity === 'failure');

  return errors;
}

expose({
  validateItem,
});
