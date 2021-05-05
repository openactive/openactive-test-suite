const {
  createCriteria,
  mustAllowProposalAmendment,
} = require('./criteriaUtils');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');

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
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableWithNegotiation,
};
