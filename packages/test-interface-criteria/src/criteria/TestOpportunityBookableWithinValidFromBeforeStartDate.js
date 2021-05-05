const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, getDateAfterWhichBookingsCanBeMade } = require('./criteriaUtils');
const { dateRange } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustHaveBookingWindowAndBeWithinIt(offer, opportunity, options) {
  const dateAfterWhichBookingsCanBeMade = getDateAfterWhichBookingsCanBeMade(offer, opportunity);
  if (dateAfterWhichBookingsCanBeMade == null) {
    return false; // has no booking window
  }
  return options.harvestStartTime > dateAfterWhichBookingsCanBeMade;
}

const TestOpportunityBookableWithinValidFromBeforeStartDate = createCriteria({
  name: 'TestOpportunityBookableWithinValidFromBeforeStartDate',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must have booking window and be within it',
      mustHaveBookingWindowAndBeWithinIt,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
  testDataShape: (options) => ({
    offerConstraints: {
      // mustHaveBookingWindowAndBeWithinIt
      'oa:validFromBeforeStartDate': dateRange({
        maxDate: options.harvestStartTime.toISO(),
        // This differs from TestOpportunityBookable as it does not allow null values
      }),
    },
  }),
});

module.exports = {
  TestOpportunityBookableWithinValidFromBeforeStartDate,
};
