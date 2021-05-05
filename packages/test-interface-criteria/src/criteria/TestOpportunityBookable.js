const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const {
  createCriteria,
  mustNotRequireAttendeeDetails,
  mustNotRequireAdditionalDetails,
  remainingCapacityMustBeAtLeastTwo,
  mustHaveBookableOffer,
  sellerMustAllowOpenBooking,
} = require('./criteriaUtils');
const {
  quantitativeValue,
  dateRange,
  advanceBookingOptionNodeConstraint,
  TRUE_BOOLEAN_CONSTRAINT,
  openBookingFlowRequirementArrayConstraint,
} = require('../testDataShape');

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookable.
 */
const TestOpportunityBookable = createCriteria({
  name: 'TestOpportunityBookable',
  opportunityConstraints: [
    [
      'Remaining capacity must be at least two (or one for IndividualFacilityUse)',
      remainingCapacityMustBeAtLeastTwo,
    ],
    [
      'Seller must allow Open Booking',
      sellerMustAllowOpenBooking,
    ],
  ],
  offerConstraints: [
    [
      'Must have "bookable" offer',
      mustHaveBookableOffer,
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
    opportunityConstraints: ({
      // remainingCapacityMustBeAtLeastTwo
      'placeholder:remainingCapacity': quantitativeValue({
        mininclusive: 2,
      }),
      // sellerMustAllowOpenBooking
      'oa:isOpenBookingAllowed': TRUE_BOOLEAN_CONSTRAINT,
    }),
    offerConstraints: ({
      // mustHaveBookableOffer
      'oa:validFromBeforeStartDate': dateRange({
        maxDate: options.harvestStartTime,
        allowNull: true,
      }),
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
    }),
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityBookable,
};
