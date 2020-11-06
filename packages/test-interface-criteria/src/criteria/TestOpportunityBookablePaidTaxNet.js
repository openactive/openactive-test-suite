const { createCriteria } = require('./criteriaUtils');
const { TestOpportunityBookableUsingPayment } = require('./TestOpportunityBookableUsingPayment');

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
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaidTaxNet.
 */
const TestOpportunityBookablePaidTaxNet = createCriteria({
  name: 'TestOpportunityBookablePaidTaxNet',
  opportunityConstraints: [
    [
      'Seller Tax Mode Net',
      sellerTaxModeNet,
    ],
  ],
  offerConstraints: [],
  includeConstraintsFromCriteria: TestOpportunityBookableUsingPayment,
});

module.exports = {
  TestOpportunityBookablePaidTaxNet,
};
