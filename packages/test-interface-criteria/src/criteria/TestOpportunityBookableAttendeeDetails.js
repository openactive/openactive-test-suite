const {
  createCriteria,
  mustRequireAttendeeDetails,
  remainingCapacityMustBeAtLeastTwo,
  startDateMustBe2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
  mustHaveBookableOffer,
} = require('./criteriaUtils');

const TestOpportunityBookableAttendeeDetails = createCriteria({
  name: 'TestOpportunityBookableAttendeeDetails',
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
      'Must require attendee details',
      mustRequireAttendeeDetails,
    ],
  ],
  testDataRequirements: () => ({}) //TODO should this have requirements? Was added by me (Civ) when merging master and I don't know what it should be
});

module.exports = {
  TestOpportunityBookableAttendeeDetails,
};
