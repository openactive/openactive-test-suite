const {
  shapeConstraintRecipes,
  openBookingFlowRequirementArrayConstraint,
} = require('../testDataShape');
const {
  createCriteria,
  mustRequireAdditionalDetails,
  remainingCapacityMustBeAtLeastTwo,
  mustNotBeOpenBookingInAdvanceUnavailable,
  mustHaveBeInsideValidFromBeforeStartDateWindow,
  mustNotRequireAttendeeDetails,
  sellerMustAllowOpenBooking,
} = require('./criteriaUtils');
const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');

const TestOpportunityBookableAdditionalDetails = createCriteria({
  name: 'TestOpportunityBookableAdditionalDetails',
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
      'Must be within validFromBeforeStartDate window',
      mustHaveBeInsideValidFromBeforeStartDateWindow,
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
