const { shapeConstraintRecipes, openBookingFlowRequirementArrayConstraint } = require('../testDataShape');
const {
  createCriteria,
  mustRequireAttendeeDetails,
  remainingCapacityMustBeAtLeastTwo,
  mustHaveBookableOffer,
  mustNotRequireAdditionalDetails,
  sellerMustAllowOpenBooking,
} = require('./criteriaUtils');
const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');

const TestOpportunityBookableAttendeeDetails = createCriteria({
  name: 'TestOpportunityBookableAttendeeDetails',
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
      'Must require attendee details',
      mustRequireAttendeeDetails,
    ],
    [
      'Must not require additional details',
      mustNotRequireAdditionalDetails,
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
        includesAll: ['https://openactive.io/OpenBookingAttendeeDetails'],
        excludesAll: ['https://openactive.io/OpenBookingIntakeForm'],
      }),
    },
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityBookableAttendeeDetails,
};
