const { validate } = require('@openactive/data-model-validator');
const fs = require('fs').promises;
const { execPipe, filter, toArray, map } = require('iter-tools');
const { workerData, parentPort } = require('worker_threads');
const { silentlyAllowInsecureConnections } = require('../util/suppress-unauthorized-warning');
const { VALIDATOR_TMP_DIR } = require('../broker-config');

/**
 * @typedef {import('./types').ValidatorWorkerRequestParsed} ValidatorWorkerRequestParsed
 * @typedef {import('./types').ValidatorWorkerResponse} ValidatorWorkerResponse
 */

silentlyAllowInsecureConnections();

async function run() {
  const filePath = workerData;
  const fileData = await fs.readFile(filePath);
  // JSON parsing is included in the validatorWorker as it's CPU intensive
  /** @type {ValidatorWorkerRequestParsed} */
  const requestParsed = JSON.parse(fileData.toString());
  /** @type {ValidatorWorkerResponse['numItemsPerFeed']} */
  const numItemsPerFeed = {};
  /** @type {ValidatorWorkerResponse['errors']} */
  const errors = [];
  for (const { feedContextIdentifier, validationMode, item } of requestParsed) {
    numItemsPerFeed[feedContextIdentifier] = (numItemsPerFeed[feedContextIdentifier] ?? 0) + 1;

    const allOaValidationErrors = await validate(item, {
      loadRemoteJson: true,
      remoteJsonCachePath: VALIDATOR_TMP_DIR,
      remoteJsonCacheTimeToLive: 3600,
      validationMode,
    });
    const newErrors = execPipe(allOaValidationErrors,
      filter((oaValidationError) => (
        oaValidationError.severity === 'failure'
        && !isIgnorableResult(item, oaValidationError)
      )),
      map(((oaValidationError) => ({
        opportunityId: item['@id'],
        error: oaValidationError,
      }))),
      toArray);
    errors.push(...newErrors);
  }
  /** @type {ValidatorWorkerResponse} */
  const response = {
    errors,
    numItemsPerFeed,
  };
  parentPort.postMessage(response);
}

/**
 * @param {any} item
 * @param {any} oaValidationResult
 * @returns {boolean}
 */
function isIgnorableResult(item, oaValidationResult) {
  // Ignore the error that a SessionSeries must have children as they haven't been combined yet.
  // This is being done because I don't know if there is a validator.validationMode for this, and without ignoring the broker does not run
  if (item['@type'] === 'SessionSeries' && oaValidationResult.message.startsWith('A `SessionSeries` must have an `eventSchedule` or at least one `subEvent`.')) {
    return true;
  }
  return false;
}

run();

// This is just required in order to use the ValidatorWorkResponse type in other files
module.exports = {};
