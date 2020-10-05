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
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFlowRequirementOnlyApproval,
};
