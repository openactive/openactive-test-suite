const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { prepaymentOptionNodeConstraint, FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithUnavailablePrepayment(offer) {
  return offer.price === 0 && (!offer.openBookingPrepayment || offer.openBookingPrepayment === 'https://openactive.io/Unavailable');
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFree
 */
const TestOpportunityBookableFree = createCriteria({
  name: 'TestOpportunityBookableFree',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only free bookable Offers (free offers must always either omit `openBookingPrepayment` or set it to `https://openactive.io/Unavailable`) ',
      onlyFreeBookableOffersWithUnavailablePrepayment,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      // onlyFreeBookableOffersWithUnavailablePrepayment
      'schema:price': FREE_PRICE_QUANTITATIVE_VALUE,
      'oa:openBookingPrepayment': prepaymentOptionNodeConstraint({
        allowlist: ['https://openactive.io/Unavailable'],
        allowNull: true,
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFree,
};
