const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { prepaymentOptionNodeConstraint, NON_FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentOptional(offer) {
  return offer.price > 0 && offer.openBookingPrepayment === 'https://openactive.io/Optional';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentOptional
 */
const TestOpportunityBookableNonFreePrepaymentOptional = createCriteria({
  name: 'TestOpportunityBookableNonFreePrepaymentOptional',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with openBookingPrepayment optional',
      onlyPaidBookableOffersWithPrepaymentOptional,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      // onlyPaidBookableOffersWithPrepaymentOptional
      'schema:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
      'oa:openBookingPrepayment': prepaymentOptionNodeConstraint({
        allowlist: ['https://openactive.io/Optional'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFreePrepaymentOptional,
};
