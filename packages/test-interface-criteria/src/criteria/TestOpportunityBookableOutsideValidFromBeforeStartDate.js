const { getDateAfterWhichBookingsCanBeMade, getDateBeforeWhichBookingsCanBeMade, remainingCapacityMustBeAtLeastTwo, createCriteria, mustNotBeOpenBookingInAdvanceUnavailable } = require('./criteriaUtils');
const { dateRange, shapeConstraintRecipes } = require('../testDataShape');
const { InternalCriteriaFutureScheduledAndDoesNotRequireDetails } = require('./internal/InternalCriteriaFutureScheduledAndDoesNotRequireDetails');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustHaveBookingWindowAndBeOutsideOfIt(offer, opportunity, options) {
  const dateAfterWhichBookingsCanBeMade = getDateAfterWhichBookingsCanBeMade(offer, opportunity);
  const dateBeforeWhichBookingsCanBeMade = getDateBeforeWhichBookingsCanBeMade(offer, opportunity);
  /* If, within 2 hours, the booking window would be reached, it may be possible for this to happen
  during the test run. So, to be on the safe side, we only accept Opportunities whose booking window
  starts at least 2 hours in the future. */
  return (dateAfterWhichBookingsCanBeMade !== null && options.harvestStartTimeTwoHoursLater < dateAfterWhichBookingsCanBeMade)
    || (dateBeforeWhichBookingsCanBeMade !== null && options.harvestStartTime > dateBeforeWhichBookingsCanBeMade);
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate
 */
const TestOpportunityBookableOutsideValidFromBeforeStartDate = createCriteria({
  name: 'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  opportunityConstraints: [
    [
      'Remaining capacity must be at least two (or one for IndividualFacilityUse)',
      remainingCapacityMustBeAtLeastTwo,
    ],
  ],
  offerConstraints: [
    [
      'openBookingInAdvance of offer must not be `https://openactive.io/Unavailable`',
      mustNotBeOpenBookingInAdvanceUnavailable,
    ],
    [
      'Must have a booking window (`validFromBeforeStartDate` and/or `validThroughBeforeStartDate`) and be outside of it',
      mustHaveBookingWindowAndBeOutsideOfIt,
    ],
  ],
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledAndDoesNotRequireDetails,
  testDataShape: (options) => ({
    opportunityConstraints: {
      ...shapeConstraintRecipes.remainingCapacityMustBeAtLeast(2),
    },
    offerConstraints: {
      // mustHaveBookingWindowAndBeOutsideOfIt
      'oa:validFromBeforeStartDate': dateRange({
        // +1s to match the non-equaling comparison in the non-ShEx constraint
        minDate: options.harvestStartTimeTwoHoursLater.plus({ seconds: 1 }).toISO(),
      }),
      'oa:validThroughBeforeStartDate': dateRange({
        // -1s to match the non-equaling comparison in the non-ShEx constraint
        maxDate: options.harvestStartTime.minus({ seconds: 1 }).toISO(),
      }),
    },
  }),
});

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};
