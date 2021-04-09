const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustAllowFullRefund } = require('./criteriaUtils');
const { BLOCKED_FIELD } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function offersMustNotHaveCancellationWindow(offer) {
  // TODO TODO TODO this should instead check that latestCancellationBeforeStartDate is either missing or such that it can be cancelled now
  // There should also be a separate criteria for outside cancellation window (https://imin.slack.com/archives/D03BQL0P1/p1605884759021000)
  return !offer.latestCancellationBeforeStartDate;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellable
 */
const TestOpportunityBookableCancellable = createCriteria({
  name: 'TestOpportunityBookableCancellable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Offers must not have cancellation window',
      offersMustNotHaveCancellationWindow,
    ],
    [
      'Offer must be fully refundable on customer cancellation',
      mustAllowFullRefund,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      'oa:latestCancellationBeforeStartDate': BLOCKED_FIELD,
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellable,
};
