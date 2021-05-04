const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { prepaymentOptionNodeConstraint, NON_FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentRequired(offer) {
  return offer.price > 0 && (!offer.openBookingPrepayment || offer.openBookingPrepayment === 'https://openactive.io/Required');
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired
 */
const TestOpportunityBookableNonFreePrepaymentRequired = createCriteria({
  name: 'TestOpportunityBookableNonFreePrepaymentRequired',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with openBookingPrepayment required',
      onlyPaidBookableOffersWithPrepaymentRequired,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      'schema:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
      'oa:openBookingPrepayment': prepaymentOptionNodeConstraint({
        allowlist: ['https://openactive.io/Required'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFreePrepaymentRequired,
};
