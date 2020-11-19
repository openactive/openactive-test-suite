const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithUnavailablePrepayment(offer) {
  return offer.price === 0 && (!offer.prepayment || offer.prepayment === 'https://openactive.io/Unavailable');
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFree
 */
const TestOpportunityBookableFree = createCriteria({
  name: 'TestOpportunityBookableFree',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only free bookable Offers (free offers must always either omit `prepayment` or set it to `https://openactive.io/Unavailable`) ',
      onlyFreeBookableOffersWithUnavailablePrepayment,
    ],
  ],
  testDataRequirements: (options) => ({
    priceAllowlist: [0],
    prepaymentAllowlist: ['https://openactive.io/Unavailable'],
    prepaymentAllowNull: true,
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFree,
};
