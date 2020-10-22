const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithPrepaymentUnspecified(offer) {
  return offer.price === 0 && !offer.prepayment;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnspecified
 */
const TestOpportunityBookableFreePrepaymentUnspecified = createCriteria({
  name: 'TestOpportunityBookableFreePrepaymentUnspecified',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only free bookable offers with prepayment unspecified',
      onlyFreeBookableOffersWithPrepaymentUnspecified,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFreePrepaymentUnspecified,
};
