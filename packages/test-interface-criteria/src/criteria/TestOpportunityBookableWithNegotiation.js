const {
  createCriteria,
  mustAllowProposalAmendment,
} = require('./criteriaUtils');
const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');

const TestOpportunityBookableWithNegotiation = createCriteria({
  name: 'TestOpportunityBookableWithNegotiation',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must allow proposal amendment',
      mustAllowProposalAmendment,
    ],
  ],
  testDataShape: () => ({}), // TODO: Add data shape
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableWithNegotiation,
};
