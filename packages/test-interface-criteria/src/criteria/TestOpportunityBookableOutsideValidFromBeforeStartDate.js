const { getDateAfterWhichBookingsCanBeMade, remainingCapacityMustBeAtLeastTwo, createCriteria } = require('./criteriaUtils');
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
  if (dateAfterWhichBookingsCanBeMade == null) {
    return false; // has no booking window
  }
  /* If, within 2 hours, the booking window would be reached, it may be possible for this to happen
  during the test run. So, to be on the safe side, we only accept Opportunities whose booking window
  starts at least 2 hours in the future. */
  return options.harvestStartTimeTwoHoursLater < dateAfterWhichBookingsCanBeMade;
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
      'Must be outside booking window (`validFromBeforeStartDate`)',
      mustHaveBookingWindowAndBeOutsideOfIt,
    ],
  ],
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledAndDoesNotRequireDetails,
  testDataShape: options => ({
    opportunityConstraints: {
      ...shapeConstraintRecipes.remainingCapacityMustBeAtLeast(2),
    },
    offerConstraints: {
      // mustHaveBookingWindowAndBeOutsideOfIt
      'oa:validFromBeforeStartDate': dateRange({
        minDate: options.harvestStartTimeTwoHoursLater.toISO(),
      }),
    },
  }),
});

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};
