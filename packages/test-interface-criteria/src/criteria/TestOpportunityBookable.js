const { complement } = require('ramda');
const { testOfferDataRequirements, openBookingFlowRequirementArrayRequirements } = require('../testDataRequirements');
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
  testDataRequirements: () => ({
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:openBookingFlowRequirement': openBookingFlowRequirementArrayRequirements({
        excludesAll: ['https://openactive.io/OpenBookingApproval'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookable,
};
