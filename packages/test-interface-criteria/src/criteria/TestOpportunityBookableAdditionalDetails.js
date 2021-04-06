const {
  createCriteria,
  mustRequireAdditionalDetails,
  remainingCapacityMustBeAtLeastTwo,
  startDateMustBe2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
  mustHaveBookableOffer,
  mustNotRequireAttendeeDetails,
} = require('./criteriaUtils');

const TestOpportunityBookableAdditionalDetails = createCriteria({
  name: 'TestOpportunityBookableAdditionalDetails',
  opportunityConstraints: [
    [
      'Remaining capacity must be at least two (or one for IndividualFacilityUse)',
      remainingCapacityMustBeAtLeastTwo,
    ],
    [
      'Start date must be 2hrs in advance for random tests to use',
      startDateMustBe2HrsInAdvance,
    ],
    [
      'eventStatus must not be Cancelled or Postponed',
      eventStatusMustNotBeCancelledOrPostponed,
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
});

module.exports = {
  TestOpportunityBookableAdditionalDetails,
};
