const { complement } = require('ramda');
const { createCriteria } = require('./criteriaUtils');
const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');
const { supportsMinimalProposalFlow } = require('./sharedConstraints');

const doesNotSupportMinimalProposalFlow = complement(supportsMinimalProposalFlow);

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookable.
 *
 * Note that this differs from the above by forbidding Minimal Proposal Flow
 * offers. This means that tests written for this criteria can focus on
 * Simple Booking Flow scenarios.
 */
const TestOpportunityBookable = createCriteria({
  name: 'TestOpportunityBookable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Does not support Minimal Proposal flow',
      doesNotSupportMinimalProposalFlow,
    ],
  ],
  testDataRequirements: (options) => ({
    openBookingFlowRequirementExcludes: 'https://openactive.io/OpenBookingApproval',
  }),
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookable,
};
