const { createCriteria } = require('./criteriaUtils');
const { TestOpportunityBookableNonFree } = require('./TestOpportunityBookableNonFree');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function sellerTaxModeGross(opportunity) {
  switch (opportunity['@type']) {
    case 'ScheduledSession':
      return opportunity.superEvent.organizer.taxMode === 'https://openactive.io/TaxGross';
    case 'Slot':
      return opportunity.facilityUse.provider.taxMode === 'https://openactive.io/TaxGross';
    default:
      throw new Error(`Type ${opportunity['@type']} not supported`);
  }
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
  includeConstraintsFromCriteria: TestOpportunityBookableNonFree,
});

module.exports = {
  TestOpportunityBookableNonFreeTaxGross,
};
