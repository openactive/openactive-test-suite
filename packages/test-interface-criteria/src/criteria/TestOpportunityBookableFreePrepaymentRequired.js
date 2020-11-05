const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithPrepaymentRequired(offer) {
  return offer.price === 0 && offer.prepayment === 'https://openactive.io/Required';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentRequired
 */
const TestOpportunityBookableFreePrepaymentRequired = createCriteria({
  name: 'TestOpportunityBookableFreePrepaymentRequired',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only free bookable offers with prepayment Required',
      onlyFreeBookableOffersWithPrepaymentRequired,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFreePrepaymentRequired,
};
