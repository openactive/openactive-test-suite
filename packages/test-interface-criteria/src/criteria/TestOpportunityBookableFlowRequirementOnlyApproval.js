const { createCriteria } = require('./criteriaUtils');
const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');
const { supportsMinimalProposalFlow } = require('./sharedConstraints');

const TestOpportunityBookableFlowRequirementOnlyApproval = createCriteria({
  name: 'TestOpportunityBookableFlowRequirementOnlyApproval',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Supports Minimal Proposal flow',
      supportsMinimalProposalFlow,
    ],
  ],
  testDataRequirements: () => ({
    openBookingFlowRequirementIncludes: 'https://openactive.io/OpenBookingApproval',
    openBookingFlowRequirementExcludesAll: ['https://openactive.io/OpenBookingAttendeeDetails', 'https://openactive.io/OpenBookingIntakeForm', 'https://openactive.io/OpenBookingMessageExchange', 'https://openactive.io/OpenBookingNegotiation'],
  }),
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFlowRequirementOnlyApproval,
};
