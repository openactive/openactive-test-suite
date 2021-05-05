const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const {
  createCriteria,
  mustNotRequireAttendeeDetails,
  mustNotRequireAdditionalDetails,
  remainingCapacityMustBeAtLeastTwo,
  mustHaveBookableOffer,
  sellerMustAllowOpenBooking,
} = require('./criteriaUtils');
const { quantitativeValue, dateRange, advanceBookingOptionNodeConstraint, TRUE_BOOLEAN_CONSTRAINT } = require('../testDataShape');

// TODO TODO TODO why does this have a validFrom ShEx but not relevant offerConstraint?
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
      'placeholder:remainingCapacity': quantitativeValue({
        mininclusive: 2,
      }),
      'oa:isOpenBookingAllowed': TRUE_BOOLEAN_CONSTRAINT,
    }),
    offerConstraints: ({
      'oa:validFromBeforeStartDate': dateRange({
        maxDate: options.harvestStartTime,
        allowNull: true,
      }),
      'oa:openBookingInAdvance': advanceBookingOptionNodeConstraint({
        blocklist: ['https://openactive.io/Unavailable'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityBookable,
};
