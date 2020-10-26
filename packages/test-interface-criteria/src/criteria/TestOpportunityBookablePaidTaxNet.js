const { createCriteria } = require('./criteriaUtils');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function sellerTaxModeNet(offer) {
  return offer.seller.taxMode === 'Net';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaidTaxNet.
 */
const TestOpportunityBookablePaidTaxNet = createCriteria({
  name: 'TestOpportunityBookablePaidTaxNet',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Seller Tax Mode Net',
      sellerTaxModeNet,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookablePaidTaxNet,
};
