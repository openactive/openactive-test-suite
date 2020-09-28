const { createCriteria } = require('./criteriaUtils');
const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');
const { supportsMinimalProposalFlow } = require('./sharedConstraints');

const TestOpportunityMinimalProposalBookable = createCriteria({
  name: 'TestOpportunityMinimalProposalBookable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Supports Minimal Proposal flow',
      supportsMinimalProposalFlow,
    ],
  ],
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityMinimalProposalBookable,
};
