const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, createCriteriaOfferConstraint } = require('./criteriaUtils');
const { shapeConstraintRecipes } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithUnavailablePrepayment(offer) {
  return offer.price === 0 && (!offer.openBookingPrepayment || offer.openBookingPrepayment === 'https://openactive.io/Unavailable');
}

const onlyFreeBookableOffersWithUnavailablePrepaymentOfferConstraint = createCriteriaOfferConstraint(
  'Only free bookable Offers (free offers must always either omit `openBookingPrepayment` or set it to `https://openactive.io/Unavailable`) ',
  onlyFreeBookableOffersWithUnavailablePrepayment,
);

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFree
 */
const TestOpportunityBookableFree = createCriteria({
  name: 'TestOpportunityBookableFree',
  opportunityConstraints: [],
  offerConstraints: [
    onlyFreeBookableOffersWithUnavailablePrepaymentOfferConstraint,
  ],
  testDataShape: () => ({
    offerConstraints: {
      ...shapeConstraintRecipes.onlyFreeBookableOffersWithUnavailablePrepayment(),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFree,
  onlyFreeBookableOffersWithUnavailablePrepaymentOfferConstraint,
};
