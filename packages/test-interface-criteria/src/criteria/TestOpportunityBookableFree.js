const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffers(offer) {
  return offer.price === 0;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFree
 */
const TestOpportunityBookableFree = createCriteria(
  'TestOpportunityBookableFree',
  [],
  [
    [
      'Only free bookable Offers',
      onlyFreeBookableOffers,
    ],
  ],
  TestOpportunityBookable,
);

module.exports = {
  TestOpportunityBookableFree,
};

// module.exports = class TestOpportunityBookableFree extends TestOpportunityBookable {
//   get opportunityConstraints() {
//     return {
//       ...super.opportunityConstraints,
//     };
//   }

//   get offerConstraints() {
//     return {
//       ...super.offerConstraints,
//       'Only free bookable Offers': x => x.price === 0,
//     }
//   }

//   get name() {
//     return 'TestOpportunityBookableFree';
//   }
// }
