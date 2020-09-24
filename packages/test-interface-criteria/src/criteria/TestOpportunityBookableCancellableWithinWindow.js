const moment = require('moment');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function offersMustHaveCancellationWindowInRange(offer, opportunity) {
  return moment(opportunity.startDate).subtract((moment.duration(offer.latestCancellationBeforeStartDate))).isAfter();
}

/**
 * @type {OfferConstraint}
 */
function offersMustAllowCustomerCancellationFullRefund(offer) { // offer, opportunity) {
  // TODO: check for allowCustomerCancellationFullRefund for each orderItem
  return offer.allowCustomerCancellationFullRefund;
}
/**
 * Implements https://openactive.io/test-interface/#TestOpportunityBookableCancellableWithinWindow
 */
const TestOpportunityBookableCancellableWithinWindow = createCriteria(
  'TestOpportunityBookableCancellableWithinWindow',
  [],
  [
    [
      'Offers must have cancellation window in range',
      offersMustHaveCancellationWindowInRange,
    ],
    [
      'Offers must allow customer cancellation full refund',
      offersMustAllowCustomerCancellationFullRefund,
    ],
  ],
  TestOpportunityBookable,
);

module.exports = {
  TestOpportunityBookableCancellableWithinWindow,
};
