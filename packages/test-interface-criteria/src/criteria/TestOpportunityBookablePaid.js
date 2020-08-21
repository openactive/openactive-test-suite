const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffers(offer) {
  return offer.price > 0;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaid
 */
const TestOpportunityBookablePaid = createCriteria(
  'TestOpportunityBookablePaid',
  [],
  [
    [
      'Only paid bookable Offers',
      onlyPaidBookableOffers,
    ],
  ],
  TestOpportunityBookable,
);

module.exports = {
  TestOpportunityBookablePaid,
};
