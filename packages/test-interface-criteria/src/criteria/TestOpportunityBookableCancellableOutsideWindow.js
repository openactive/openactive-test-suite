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
        maxDate: options.harvestStartTime.toISO(),
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellableOutsideWindow,
};
