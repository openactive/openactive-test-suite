// workers/auth.js
const { validate } = require('@openactive/data-model-validator');
const { expose } = require('threads/worker');

// Note this is duplicated between app.js and validator.js, for efficiency
const VALIDATOR_TMP_DIR = './tmp';

/**
 * Use OpenActive validator to validate the RPDE item
 *
 * @param {any} body the data item
 */
async function validateItem(body) {
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
    validationMode: 'BookableRPDEFeed',
  };

  const errors = (await validate(body, optionsWithRemoteJson))
    .filter((result) => result.severity === 'failure');

  return errors;
}

expose({
  validateItem,
});
