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
      'Must be outside booking window (`validFromBeforeStartDate`)',
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
        minDate: options.harvestStartTimeTwoHoursLater.toISO(),
      }),
      'oa:validThroughBeforeStartDate': dateRange({
        maxDate: options.harvestStartTime.toISO(),
      }),
    },
  }),
});

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};
