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
 */

// TODO TODO include this:
// // Ignore the error that a SessionSeries must have children as they haven't been combined yet.
// // This is being done because I don't know if there is a validator.validationMode for this, and without ignoring the broker does not run
// if (data['@type'] === 'SessionSeries' && errorShortMessage === 'A `SessionSeries` must have an `eventSchedule` or at least one `subEvent`.') {
//   // eslint-disable-next-line no-continue
//   continue;
// }

module.exports = {};
