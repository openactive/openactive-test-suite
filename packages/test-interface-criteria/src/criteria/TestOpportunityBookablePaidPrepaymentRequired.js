const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentRequired(offer) {
  return offer.price > 0 && offer.prepayment === 'https://openactive.io/Required';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentRequired
 */
const TestOpportunityBookablePaidPrepaymentRequired = createCriteria({
  name: 'TestOpportunityBookablePaidPrepaymentRequired',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with prepayment required',
      onlyPaidBookableOffersWithPrepaymentRequired,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookablePaidPrepaymentRequired,
};
