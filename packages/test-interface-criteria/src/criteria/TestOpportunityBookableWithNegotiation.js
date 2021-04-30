const {
  createCriteria,
  mustAllowProposalAmendment,
  remainingCapacityMustBeAtLeastTwo,
  startDateMustBe2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
  mustHaveBookableOffer,
} = require('./criteriaUtils');

const TestOpportunityBookableWithNegotiation = createCriteria({
  name: 'TestOpportunityBookableWithNegotiation',
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
      'Must allow proposal amendment',
      mustAllowProposalAmendment,
    ],
  ],
  testDataShape: () => ({}), // TODO: Add data shape
});

module.exports = {
  TestOpportunityBookableWithNegotiation,
};
