const { createCriteria } = require('./criteriaUtils');
const { TestOpportunityBookableNonFree } = require('./TestOpportunityBookableNonFree');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function sellerTaxModeNet(opportunity) {
  switch (opportunity['@type']) {
    case 'ScheduledSession':
      return opportunity.superEvent.organizer.taxMode === 'https://openactive.io/TaxNet';
    case 'Slot':
      return opportunity.facilityUse.provider.taxMode === 'https://openactive.io/TaxNet';
    default:
      throw new Error(`Type ${opportunity['@type']} not supported`);
  }
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
  includeConstraintsFromCriteria: TestOpportunityBookableNonFree,
});

module.exports = {
  TestOpportunityBookableNonFreeTaxNet,
};
