const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { NON_FREE_PRICE_QUANTITATIVE_VALUE, prepaymentOptionNodeConstraint } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffers(offer) {
  return offer.price > 0 && offer.openBookingPrepayment !== 'https://openactive.io/Unavailable';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableUsingPayment
 */
const TestOpportunityBookableUsingPayment = createCriteria({
  name: 'TestOpportunityBookableUsingPayment',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable Offers, where openBookingPrepayment is not Unavailable',
      onlyPaidBookableOffers,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      'schema:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
      'oa:openBookingPrepayment': prepaymentOptionNodeConstraint({
        blocklist: ['https://openactive.io/Unavailable'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableUsingPayment,
};
