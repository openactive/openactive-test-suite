const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, getOrganizerOrProvider } = require('./criteriaUtils');
const { testOfferDataRequirements, termsOfServiceArrayRequirements } = require('../testDataRequirements');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @param {OpportunityConstraint} opportunity
 */
function hasTermsOfService(opportunity) {
  const organization = getOrganizerOrProvider(opportunity);
  return organization && Array.isArray(organization.termsOfService) && organization.termsOfService.length >= 1;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableSellerTermsOfService
 */
const TestOpportunityBookableSellerTermsOfService = createCriteria({
  name: 'TestOpportunityBookableSellerTermsOfService',
  opportunityConstraints: [
    [
      'Has Terms of Service',
      hasTermsOfService,
    ],
  ],
  offerConstraints: [],
  testDataRequirements: () => ({
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:termsOfService': termsOfServiceArrayRequirements(1),
    }),
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableSellerTermsOfService,
};
