const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const { createCriteria, getOrganizerOrProvider } = require('./criteriaUtils');
const { FALSE_BOOLEAN_CONSTRAINT } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustNotAllowOpenBooking(opportunity) {
  const organization = getOrganizerOrProvider(opportunity);
  return organization && organization.allowsOpenBooking === true;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunitySellerOpenBookingNotAllowed
 */
const TestOpportunitySellerOpenBookingNotAllowed = createCriteria({
  name: 'TestOpportunitySellerOpenBookingNotAllowed',
  opportunityConstraints: [
    [
      'Seller must not allow open booking',
      mustNotAllowOpenBooking,
    ],
  ],
  offerConstraints: [],
  testDataShape: () => ({
    opportunityConstraints: {
      'oa:allowsOpenBooking': FALSE_BOOLEAN_CONSTRAINT,
    },
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunitySellerOpenBookingNotAllowed,
};
