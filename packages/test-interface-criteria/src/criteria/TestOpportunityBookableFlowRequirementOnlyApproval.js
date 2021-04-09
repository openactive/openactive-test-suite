const { openBookingFlowRequirementArrayConstraint } = require('../testDataShape');
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
  testDataShape: () => ({
    offerConstraints: {
      'oa:openBookingFlowRequirement': openBookingFlowRequirementArrayConstraint({
        includesAll: ['https://openactive.io/OpenBookingApproval'],
        excludesAll: ['https://openactive.io/OpenBookingAttendeeDetails', 'https://openactive.io/OpenBookingIntakeForm', 'https://openactive.io/OpenBookingMessageExchange', 'https://openactive.io/OpenBookingNegotiation'],
      }),
    },
  }),
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFlowRequirementOnlyApproval,
};
