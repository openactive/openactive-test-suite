const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffers(offer) {
  return offer.price > 0 && offer.prepayment !== 'https://openactive.io/Unavailable';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaid
 */
const TestOpportunityBookablePaid = createCriteria({
  name: 'TestOpportunityBookablePaid',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable Offers, where prepayment is not Unavailable',
      onlyPaidBookableOffers,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookablePaid,
};
