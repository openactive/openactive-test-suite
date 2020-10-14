const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');
const { createCriteria, mustBeWithinBookingWindow } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustHaveBookingWindowAndBeWithinIt(offer, opportunity) {
  return offer.validFromBeforeStartDate && mustBeWithinBookingWindow(offer, opportunity);
}

const TestOpportunityBookableWithinValidFromBeforeStartDate = createCriteria({
  name: 'TestOpportunityBookableWithinValidFromBeforeStartDate',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must be within booking window',
      mustHaveBookingWindowAndBeWithinIt,
    ],
  ],
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableWithinValidFromBeforeStartDate,
};
