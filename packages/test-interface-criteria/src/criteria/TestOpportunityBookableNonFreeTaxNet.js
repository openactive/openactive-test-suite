const { testOpportunityDataRequirements, taxModeOptionRequirements } = require('../testDataRequirements');
const { createCriteria, getOrganizerOrProvider } = require('./criteriaUtils');
const { TestOpportunityBookableNonFree } = require('./TestOpportunityBookableNonFree');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function sellerTaxModeNet(opportunity) {
  const organization = getOrganizerOrProvider(opportunity);
  return organization && organization.taxMode === 'https://openactive.io/TaxNet';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreeTaxNet.
 */
const TestOpportunityBookableNonFreeTaxNet = createCriteria({
  name: 'TestOpportunityBookableNonFreeTaxNet',
  opportunityConstraints: [
    [
      'Seller Tax Mode Net',
      sellerTaxModeNet,
    ],
  ],
  offerConstraints: [],
  testDataRequirements: () => ({
    'test:testOpportunityDataRequirements': testOpportunityDataRequirements({
      'test:taxMode': taxModeOptionRequirements({
        allowlist: ['https://openactive.io/TaxNet'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: TestOpportunityBookableNonFree,
});

module.exports = {
  TestOpportunityBookableNonFreeTaxNet,
};
