const { shapeConstraintRecipes, advanceBookingOptionNodeConstraint, openBookingFlowRequirementArrayConstraint, dateRange } = require('../testDataShape');
const {
  createCriteria,
  remainingCapacityMustBeAtLeastTwo,
  mustNotBeOpenBookingInAdvanceUnavailable,
  sellerMustAllowOpenBooking,
  endDateMustBeInThePast,
  eventStatusMustNotBeCancelledOrPostponed,
  mustNotRequireAttendeeDetails,
  mustNotRequireAdditionalDetails,
  excludePaidBookableOffersWithPrepaymentUnavailable,
} = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableInPast
 */
const TestOpportunityBookableInPast = createCriteria({
  name: 'TestOpportunityBookableInPast',
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
      'endDate must be in the past',
      endDateMustBeInThePast,
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
      'Must not require attendee details',
      mustNotRequireAttendeeDetails,
    ],
    [
      'Must not require additional details',
      mustNotRequireAdditionalDetails,
    ],
    [
      'Offer must not be non-free with openBookingPrepayment unavailable',
      excludePaidBookableOffersWithPrepaymentUnavailable,
    ],
  ],
  testDataShape: (options) => ({
    opportunityConstraints: {
      ...shapeConstraintRecipes.remainingCapacityMustBeAtLeast(2),
      ...shapeConstraintRecipes.sellerMustAllowOpenBooking(),
      // endDateMustBeInThePast
      'schema:endDate': dateRange({
        maxDate: options.harvestStartTime.minus({ seconds: 1 }).toISO(),
      }),
      ...shapeConstraintRecipes.eventStatusMustNotBeCancelledOrPostponed(),
    },
    offerConstraints: {
      // mustNotBeOpenBookingInAdvanceUnavailable
      'oa:openBookingInAdvance': advanceBookingOptionNodeConstraint({
        blocklist: ['https://openactive.io/Unavailable'],
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
  TestOpportunityBookableInPast,
};
