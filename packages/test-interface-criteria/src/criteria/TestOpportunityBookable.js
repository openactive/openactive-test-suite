const {
  createCriteria,
  remainingCapacityMustBeAtLeastTwo,
  mustHaveBookableOffer,
  sellerMustAllowOpenBooking,
} = require('./criteriaUtils');
const {
  dateRange,
  advanceBookingOptionNodeConstraint,
  TRUE_BOOLEAN_CONSTRAINT,
  shapeConstraintRecipes,
} = require('../testDataShape');
const { InternalCriteriaFutureScheduledAndDoesNotRequireDetails } = require('./internal/InternalCriteriaFutureScheduledAndDoesNotRequireDetails');

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
  ],
  testDataShape: (options) => ({
    opportunityConstraints: ({
      // remainingCapacityMustBeAtLeastTwo
      ...shapeConstraintRecipes.remainingCapacityMustBeAtLeastTwo(),
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
    }),
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledAndDoesNotRequireDetails,
});

module.exports = {
  TestOpportunityBookable,
};
