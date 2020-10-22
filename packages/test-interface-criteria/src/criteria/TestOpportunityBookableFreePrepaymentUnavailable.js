const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithPrepaymentUnavailable(offer) {
  return offer.price === 0 && offer.prepayment === 'https://openactive.io/Unavailable';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnavailable
 */
const TestOpportunityBookableFreePrepaymentUnavailable = createCriteria({
  name: 'TestOpportunityBookableFreePrepaymentUnavailable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only free bookable offers with prepayment unavailable',
      onlyFreeBookableOffersWithPrepaymentUnavailable,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFreePrepaymentUnavailable,
};
