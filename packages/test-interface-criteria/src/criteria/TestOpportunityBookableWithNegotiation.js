const { openBookingFlowRequirementArrayConstraint } = require('../testDataShape');
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
  testDataShape: () => ({
    offerConstraints: {
      // mustAllowProposalAmendment
      'oa:openBookingFlowRequirement': openBookingFlowRequirementArrayConstraint({
        includesAll: ['https://openactive.io/OpenBookingNegotiation'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableWithNegotiation,
};
