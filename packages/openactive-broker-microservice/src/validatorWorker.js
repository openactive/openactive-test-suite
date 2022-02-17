const { workerData, parentPort } = require('worker_threads');

/**
 * @typedef {{
 *   errors: {
 *     opportunityId: string;
 *     error: unknown[];
 *   }[];
 *   numItemsPerFeed: {
 *     [feedContextIdentifier: string]: number;
 *   };
 * }} ValidatorWorkerResponse
 *
 * @typedef {{
 *   validationMode: string;
 *   item: unknown;
 *   feedContextIdentifier: string;
 * }[]} ValidatorWorkerRequestParsed
 */

/** @type {ValidatorWorkerRequestParsed} */
let requestParsed;
try {
  requestParsed = JSON.parse(workerData);
} catch (err) {
  console.error('validatorWorker requestParsed error. data:', String(workerData));
  throw err;
}
/** @type {ValidatorWorkerResponse} */
const response = {
  errors: [],
  numItemsPerFeed: requestParsed.reduce((accum, requestItem) => {
    // eslint-disable-next-line no-param-reassign
    accum[requestItem.feedContextIdentifier] = (accum[requestItem.feedContextIdentifier] ?? 0) + 1;
    return accum;
  }, /** @type {ValidatorWorkerResponse['numItemsPerFeed']} */({})),
};
parentPort.postMessage(response);

// TODO TODO include this:
// // Ignore the error that a SessionSeries must have children as they haven't been combined yet.
// // This is being done because I don't know if there is a validator.validationMode for this, and without ignoring the broker does not run
// if (data['@type'] === 'SessionSeries' && errorShortMessage === 'A `SessionSeries` must have an `eventSchedule` or at least one `subEvent`.') {
//   // eslint-disable-next-line no-continue
//   continue;
// }

// This is just required in order to use the ValidatorWorkResponse type in other files
module.exports = {};
