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
