const {
  shapeConstraintRecipes,
  openBookingFlowRequirementArrayConstraint,
} = require('../testDataShape');
const {
  createCriteria,
  mustRequireAdditionalDetails,
  remainingCapacityMustBeAtLeastTwo,
  mustHaveBookableOffer,
  mustNotRequireAttendeeDetails,
  sellerMustAllowOpenBooking,
} = require('./criteriaUtils');
const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');

// TODOs:
// - openBookingInAdvance doesn't even appear in test-data.json..
const TestOpportunityBookableAdditionalDetails = createCriteria({
  name: 'TestOpportunityBookableAdditionalDetails',
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
      'Must require additional details',
      mustRequireAdditionalDetails,
    ],
    [
      'Must not require attendee details',
      mustNotRequireAttendeeDetails,
    ],
  ],
  testDataShape: (options) => ({
    opportunityConstraints: {
      ...shapeConstraintRecipes.remainingCapacityMustBeAtLeastTwo(),
      ...shapeConstraintRecipes.sellerMustAllowOpenBooking(),
    },
    offerConstraints: {
      ...shapeConstraintRecipes.mustHaveBookableOffer(options),
      // mustRequireAttendeeDetails, mustNotRequireAdditionalDetails
      'oa:openBookingFlowRequirement': openBookingFlowRequirementArrayConstraint({
        includesAll: ['https://openactive.io/OpenBookingIntakeForm'],
        excludesAll: ['https://openactive.io/OpenBookingAttendeeDetails'],
      }),
    },
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityBookableAdditionalDetails,
};
