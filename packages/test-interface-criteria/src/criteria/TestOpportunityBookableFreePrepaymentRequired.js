const { prepaymentOptionNodeConstraint, FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataShape');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithPrepaymentRequired(offer) {
  return offer.price === 0 && offer.openBookingPrepayment === 'https://openactive.io/Required';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentRequired
 */
const TestOpportunityBookableFreePrepaymentRequired = createCriteria({
  name: 'TestOpportunityBookableFreePrepaymentRequired',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only free bookable offers with openBookingPrepayment Required',
      onlyFreeBookableOffersWithPrepaymentRequired,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      // onlyFreeBookableOffersWithPrepaymentRequired
      'schema:price': FREE_PRICE_QUANTITATIVE_VALUE,
      'oa:openBookingPrepayment': prepaymentOptionNodeConstraint({
        allowlist: ['https://openactive.io/Required'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFreePrepaymentRequired,
};
