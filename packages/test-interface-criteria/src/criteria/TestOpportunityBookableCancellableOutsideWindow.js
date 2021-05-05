const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, getDateBeforeWhichCancellationsCanBeMade } = require('./criteriaUtils');
const { dateRange } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustBeOutsideCancellationWindow(offer, opportunity, options) {
  const dateBeforeWhichCancellationsCanBeMade = getDateBeforeWhichCancellationsCanBeMade(offer, opportunity);
  if (dateBeforeWhichCancellationsCanBeMade == null) {
    return false; // has no cancellation window
  }
  // it has to be too late to cancel
  return options.harvestStartTime > dateBeforeWhichCancellationsCanBeMade;
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
  testDataShape: (options) => ({
    offerConstraints: {
      // mustBeOutsideCancellationWindow
      'oa:latestCancellationBeforeStartDate': dateRange({
        maxDate: options.harvestStartTime,
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellableOutsideWindow,
};
