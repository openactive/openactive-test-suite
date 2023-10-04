const {
  createCriteria,
  remainingCapacityMustBeAtLeastTwo,
  mustNotBeOpenBookingInAdvanceUnavailable,
  mustBeInsideBookingWindowIfOneExists,
  sellerMustAllowOpenBooking,
} = require('./criteriaUtils');
const {
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
      'organizer or provider must include isOpenBookingAllowed = true',
      sellerMustAllowOpenBooking,
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
  ],
  testDataShape: (options) => ({
    opportunityConstraints: {
      ...shapeConstraintRecipes.remainingCapacityMustBeAtLeast(2),
      ...shapeConstraintRecipes.sellerMustAllowOpenBooking(),
    },
    offerConstraints: {
      ...shapeConstraintRecipes.mustHaveBookableOffer(options),
    },
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledAndDoesNotRequireDetails,
});

module.exports = {
  TestOpportunityBookable,
};
