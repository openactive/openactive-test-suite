const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { testOfferDataRequirements, BLOCKED_FIELD } = require('../testDataRequirements');

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
  ],
  testDataRequirements: () => ({
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:latestCancellationBeforeStartDate': BLOCKED_FIELD,
    }),
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellable,
};
