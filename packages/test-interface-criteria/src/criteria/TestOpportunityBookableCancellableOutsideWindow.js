const moment = require('moment');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function offersMustHaveCancellationWindowOutsideRange(offer, opportunity) {
  return moment(opportunity.startDate).subtract((moment.duration(offer.latestCancellationBeforeStartDate))).isBefore();
}

/**
 * Implements https://openactive.io/test-interface/#TestOpportunityBookableCancellableOutsideWindow
 */
const TestOpportunityBookableCancellableOutsideWindow = createCriteria(
  'TestOpportunityBookableCancellableOutsideWindow',
  [],
  [
    [
      'Offers must have cancellation window outside range',
      offersMustHaveCancellationWindowOutsideRange,
    ],
  ],
  TestOpportunityBookable,
);

module.exports = {
  TestOpportunityBookableCancellableOutsideWindow,
};
