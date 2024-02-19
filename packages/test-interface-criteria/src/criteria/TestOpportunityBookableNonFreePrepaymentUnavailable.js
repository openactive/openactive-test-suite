const { shapeConstraintRecipes, NON_FREE_PRICE_QUANTITATIVE_VALUE, prepaymentOptionNodeConstraint, openBookingFlowRequirementArrayConstraint } = require('../testDataShape');
const {
  createCriteria,
  remainingCapacityMustBeAtLeastTwo,
  mustNotBeOpenBookingInAdvanceUnavailable,
  mustBeInsideBookingWindowIfOneExists,
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
      'Must be within the booking window (`validFromBeforeStartDate` and/or `validThroughBeforeStartDate`) if one exists',
      mustBeInsideBookingWindowIfOneExists,
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
  testDataShape: (options) => ({
    opportunityConstraints: {
      ...shapeConstraintRecipes.remainingCapacityMustBeAtLeast(2),
      ...shapeConstraintRecipes.sellerMustAllowOpenBooking(),
      ...shapeConstraintRecipes.startDateMustBe2HrsInAdvance(options),
      ...shapeConstraintRecipes.eventStatusMustNotBeCancelledOrPostponed(),
    },
    offerConstraints: {
      ...shapeConstraintRecipes.mustHaveBookableOffer(options),
      // onlyPaidBookableOffersWithPrepaymentUnavailable
      'schema:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
      'oa:openBookingPrepayment': prepaymentOptionNodeConstraint({
        allowlist: ['https://openactive.io/Unavailable'],
      }),
      // mustNotRequireAttendeeDetails, mustNotRequireAdditionalDetails
      'oa:openBookingFlowRequirement': openBookingFlowRequirementArrayConstraint({
        excludesAll: [
          'https://openactive.io/OpenBookingAttendeeDetails',
          'https://openactive.io/OpenBookingIntakeForm',
        ],
      }),
    },
  }),
});

module.exports = {
  TestOpportunityBookableNonFreePrepaymentUnavailable,
};
