/*!
 * test-interface-criteria
 * MIT Licensed
 */
const { allCriteria } = require('./criteria');
const { getOrganizerOrProvider } = require('./criteria/criteriaUtils');

/**
 * @typedef {import('./types/Criteria').Criteria} Criteria
 * @typedef {import('./types/Opportunity').Opportunity} Opportunity
 * @typedef {import('./types/Offer').Offer} Offer
 * @typedef {import('./types/Options').Options} Options
 */

const criteriaMap = new Map(allCriteria.map((criteria) => [criteria.name, criteria]));

/**
 * @param {Opportunity} opportunity
 * @returns {Offer[]}
 */
function getOffers(opportunity) {
  return opportunity.offers || (opportunity.superEvent && opportunity.superEvent.offers) || []; // Note FacilityUse does not have bookable offers, as it does not allow inheritance
}

/**
 * @param {Criteria} criteria
 * @param {Opportunity} opportunity
 * @param {Options} options
 */
function filterRelevantOffers(criteria, opportunity, options) {
  const offers = getOffers(opportunity);
  return criteria.offerConstraints
    .reduce((relevantOffers, [, test]) => relevantOffers.filter((offer) => test(offer, opportunity, options)), offers);
}

/**
 * Check if an opportunity matches some criteria
 *
 * @typedef {object} TestMatchResult
 * @property {boolean} matchesCriteria Does the opportunity match the criteria?
 * @property {string[]} unmetCriteriaDetails Names of constraints which were
 *   not met by the opportunity.
 *
 * @param {Criteria} criteria
 * @param {Opportunity} opportunity
 * @param {Options} options
 */
function testMatch(criteria, opportunity, options) {
  // Array of unmetOpportunityConstraints labels
  const unmetOpportunityConstraints = criteria.opportunityConstraints
    .filter(([, test]) => !test(opportunity, options))
    .map(([name]) => name);

  // Array of Offers that match the criteria
  const relevantOffers = filterRelevantOffers(criteria, opportunity, options);

  // Only check for unmetOfferConstraints if there are no matching offers
  // Array of unmetOfferConstraints labels
  const offers = getOffers(opportunity);
  const unmetOfferConstraints = relevantOffers.length > 0 ? [] : criteria.offerConstraints
    .filter(([, test]) => !offers.some((offer) => test(offer, opportunity, options)))
    .map(([name]) => name);

  // Boolean: does this opportunity match the criteria?
  const matchesCriteria = unmetOpportunityConstraints.length === 0 && relevantOffers.length > 0;

  // Array of string: all the reasons the opportunity does not match the criteria
  const unmetCriteriaDetails = unmetOpportunityConstraints.concat(unmetOfferConstraints);

  return {
    matchesCriteria,
    unmetCriteriaDetails,
  };
}

/**
 * @param {string} criteriaName
 * @param {Opportunity} opportunity
 * @param {Options} options
 */
function getRelevantOffers(criteriaName, opportunity, options) {
  if (!criteriaMap.has(criteriaName)) throw new Error('Invalid criteria name');
  return filterRelevantOffers(criteriaMap.get(criteriaName), opportunity, options);
}

module.exports = {
  // Main
  criteria: allCriteria,
  criteriaMap,
  testMatch,
  getRelevantOffers,
  // Utils
  utils: {
    getOrganizerOrProvider,
  },
};
