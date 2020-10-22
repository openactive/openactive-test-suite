const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentOptional(offer) {
  return offer.price > 0 && offer.prepayment === 'https://openactive.io/Optional';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentOptional
 */
const TestOpportunityBookablePaidPrepaymentOptional = createCriteria({
  name: 'TestOpportunityBookablePaidPrepaymentOptional',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with prepayment optional',
      onlyPaidBookableOffersWithPrepaymentOptional,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookablePaidPrepaymentOptional,
};
