const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { prepaymentOptionNodeConstraint, NON_FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentUnavailable(offer) {
  return offer.price > 0 && offer.openBookingPrepayment === 'https://openactive.io/Unavailable';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable
 */
const TestOpportunityBookableNonFreePrepaymentUnavailable = createCriteria({
  name: 'TestOpportunityBookableNonFreePrepaymentUnavailable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with openBookingPrepayment unavailable',
      onlyPaidBookableOffersWithPrepaymentUnavailable,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      'schema:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
      'oa:openBookingPrepayment': prepaymentOptionNodeConstraint({
        allowlist: ['https://openactive.io/Unavailable'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFreePrepaymentUnavailable,
};
