const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustBeWithinCancellationWindow } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustBeOutsideCancellationWindow(offer, opportunity, options) {
  return offer.latestCancellationBeforeStartDate && !mustBeWithinCancellationWindow(offer, opportunity, options);
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellableOutsideWindow
 */
const TestOpportunityBookableCancellableOutsideWindow = createCriteria({
  name: 'TestOpportunityBookableCancellableOutsideWindow',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must be outside cancellation window',
      mustBeOutsideCancellationWindow,
    ],
  ],
  testDataShape: () => ({}), // TODO: Add data shape
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellableOutsideWindow,
};
