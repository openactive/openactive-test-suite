const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustBeOutsideCancellationWindow } = require('./criteriaUtils');
const { dateRange } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

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
        // -1s to match the non-equaling comparison in the non-ShEx constraint
        maxDate: options.harvestStartTime.minus({ seconds: 1 }).toISO(),
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellableOutsideWindow,
};
