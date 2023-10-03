const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, getDateAfterWhichBookingsCanBeMade, getDateBeforeWhichBookingsCanBeMade } = require('./criteriaUtils');
const { dateRange } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustHaveBookingWindowAndBeWithinIt(offer, opportunity, options) {
  const dateAfterWhichBookingsCanBeMade = getDateAfterWhichBookingsCanBeMade(offer, opportunity);
  const dateBeforeWhichBookingsCanBeMade = getDateBeforeWhichBookingsCanBeMade(offer, opportunity);
  if (dateAfterWhichBookingsCanBeMade == null && dateBeforeWhichBookingsCanBeMade == null) {
    return false; // has no booking window
  }
  /* If, within 2 hours, the end of the booking window would be reached, it may be possible for this to happen
  during the test run. So, to be on the safe side, we only accept Opportunities whose booking window
  ends at least 2 hours in the future. */
  return (dateAfterWhichBookingsCanBeMade == null || options.harvestStartTime > dateAfterWhichBookingsCanBeMade)
   && (dateBeforeWhichBookingsCanBeMade == null || options.harvestStartTimeTwoHoursLater < dateBeforeWhichBookingsCanBeMade);
}

const TestOpportunityBookableWithinValidFromBeforeStartDate = createCriteria({
  name: 'TestOpportunityBookableWithinValidFromBeforeStartDate',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must have booking window (`validFromBeforeStartDate` or `validThroughBeforeStartDate`) and be within it',
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
      'oa:validThroughBeforeStartDate': dateRange({
        minDate: options.harvestStartTimeTwoHoursLater.toISO(),
        // This differs from TestOpportunityBookable as it does not allow null values
      }),
    },
  }),
});

module.exports = {
  TestOpportunityBookableWithinValidFromBeforeStartDate,
};
