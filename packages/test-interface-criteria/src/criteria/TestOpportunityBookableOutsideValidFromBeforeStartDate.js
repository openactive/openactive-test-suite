const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const { getDateAfterWhichBookingsCanBeMade, remainingCapacityMustBeAtLeastTwo, createCriteria } = require('./criteriaUtils');
const { quantitativeValue, dateRange } = require('../testDataShape');

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

  // const start = moment(opportunity.startDate);
  // const duration = moment.duration(offer.validFromBeforeStartDate);

  // // This constraint needs to stay valid for 2 hours
  // const valid = start.subtract(duration).add('PT2H').isAfter(options.harvestStartTime);
  // return valid;
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
      'Must be outside booking window',
      mustHaveBookingWindowAndBeOutsideOfIt,
    ],
  ],
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
  testDataShape: (options) => ({
    opportunityConstraints: {
      'placeholder:remainingCapacity': quantitativeValue({
        mininclusive: 2,
      }),
    },
    offerConstraints: {
      'oa:validFromBeforeStartDate': dateRange({
        minDate: options.harvestStartTimeTwoHoursLater.toISO(),
      }),
    },
  }),
});

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};
