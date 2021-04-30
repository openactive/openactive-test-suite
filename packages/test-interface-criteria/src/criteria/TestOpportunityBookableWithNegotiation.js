const {
  createCriteria,
  mustAllowProposalAmendment,
  remainingCapacityMustBeAtLeastTwo,
  startDateMustBe2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
  mustHaveBookableOffer,
  mustNotRequireAttendeeDetails,
} = require('./criteriaUtils');
const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');

const TestOpportunityBookableWithNegotiation = createCriteria({
  name: 'TestOpportunityBookableWithNegotiation',
  opportunityConstraints: [
    // [
    //   'Remaining capacity must be at least two (or one for IndividualFacilityUse)',
    //   remainingCapacityMustBeAtLeastTwo,
    // ],
    // [
    //   'Start date must be 2hrs in advance for random tests to use',
    //   startDateMustBe2HrsInAdvance,
    // ],
    // [
    //   'eventStatus must not be Cancelled or Postponed',
    //   eventStatusMustNotBeCancelledOrPostponed,
    // ],
  ],
  offerConstraints: [
    // [
    //   'Must have "bookable" offer',
    //   mustHaveBookableOffer,
    // ],
    [
      'Must allow proposal amendment',
      mustAllowProposalAmendment,
    ],
    // [
    //   'Must not require attendee details',
    //   mustNotRequireAttendeeDetails,
    // ],
  ],
  testDataShape: () => ({}), // TODO: Add data shape
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableWithNegotiation,
};
