const { taxModeOptionNodeConstraint } = require('../testDataShape');
const { createCriteria, getOrganizerOrProvider } = require('./criteriaUtils');
const { TestOpportunityBookableNonFree } = require('./TestOpportunityBookableNonFree');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function sellerTaxModeGross(opportunity) {
  const organization = getOrganizerOrProvider(opportunity);
  return organization && organization.taxMode === 'https://openactive.io/TaxGross';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreeTaxGross.
 */
const TestOpportunityBookableNonFreeTaxGross = createCriteria({
  name: 'TestOpportunityBookableNonFreeTaxGross',
  opportunityConstraints: [
    [
      'Seller Tax Mode Gross',
      sellerTaxModeGross,
    ],
  ],
  offerConstraints: [],
  testDataShape: () => ({
    opportunityConstraints: {
      // sellerTaxModeGross
      'oa:taxMode': taxModeOptionNodeConstraint({
        allowlist: ['https://openactive.io/TaxGross'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookableNonFree,
});

module.exports = {
  TestOpportunityBookableNonFreeTaxGross,
};
