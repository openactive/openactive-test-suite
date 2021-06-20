const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const {
  createCriteria,
  remainingCapacityMustBeAtLeastTwo,
  mustNotBeOpenBookingInAdvanceUnavailable,
  mustHaveBeInsideValidFromBeforeStartDateWindow,
  sellerMustAllowOpenBooking,
  mustNotRequireAttendeeDetails,
  mustNotRequireAdditionalDetails,
  startDateMustBe2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
} = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentUnavailable(offer) {
  return offer.price > 0 && offer.openBookingPrepayment === 'https://openactive.io/Unavailable';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable
 */
const TestOpportunityBookableNonFreePrepaymentUnavailable = createCriteria({
  name: 'TestOpportunityBookableNonFreePrepaymentUnavailable',
  opportunityConstraints: [
    [
      'Remaining capacity must be at least two (or one for IndividualFacilityUse)',
      remainingCapacityMustBeAtLeastTwo,
    ],
    [
      'organizer or provider must include isOpenBookingAllowed = true',
      sellerMustAllowOpenBooking,
    ],
    [
      'startDate must be 2hrs in advance for random tests to use',
      startDateMustBe2HrsInAdvance,
    ],
    [
      'eventStatus must not be Cancelled or Postponed',
      eventStatusMustNotBeCancelledOrPostponed,
    ],
  ],
  offerConstraints: [
    [
      'openBookingInAdvance of offer must not be `https://openactive.io/Unavailable`',
      mustNotBeOpenBookingInAdvanceUnavailable,
    ],
    [
      'Must be within validFromBeforeStartDate window',
      mustHaveBeInsideValidFromBeforeStartDateWindow,
    ],
    [
      'Only paid bookable offers with openBookingPrepayment unavailable',
      onlyPaidBookableOffersWithPrepaymentUnavailable,
    ],
    [
      'Must not require attendee details',
      mustNotRequireAttendeeDetails,
    ],
    [
      'Must not require additional details',
      mustNotRequireAdditionalDetails,
    ],
  ],
  testDataShape: () => ({
    // TODO: Add data shape
  }),
});

module.exports = {
  TestOpportunityBookableNonFreePrepaymentUnavailable,
};
