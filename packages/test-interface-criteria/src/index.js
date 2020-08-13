/*!
 * test-interface-criteria
 * MIT Licensed
 */
const criteria = require("./criteria").criteria.map(x => new x());

function getOffers(opportunity) {
  return opportunity.offers || (opportunity.superEvent && opportunity.superEvent.offers) || []; // Note FacilityUse does not have bookable offers, as it does not allow inheritance
}

function filterRelevantOffers(criteria, opportunity) {
  const offers = getOffers(opportunity);
  return Object.entries(criteria.offerConstraints)
    .reduce((offers, [, test]) => offers.filter(offer => test(offer, opportunity)), offers);
}

function testMatch(criteria, opportunity) {
  // Array of unmetOpportunityConstraints labels
  const unmetOpportunityConstraints = Object.entries(criteria.opportunityConstraints)
    .filter(([, test]) => !test(opportunity))
    .map(([name]) => name);
  
  // Array of Offers that match the criteria
  const relevantOffers = filterRelevantOffers(criteria, opportunity);

  // Only check for unmetOfferConstraints if there are no matching offers
  // Array of unmetOfferConstraints labels
  const offers = getOffers(opportunity);
  const unmetOfferConstraints = relevantOffers.length > 0 ? [] : Object.entries(criteria.offerConstraints)
    .filter(([, test]) => !offers.some(offer => test(offer, opportunity)))
    .map(([name]) => name);

  // Boolean: does this opportunity match the criteria?
  const matchesCriteria = unmetOpportunityConstraints.length === 0 && relevantOffers.length > 0;

  // Array of string: all the reasons the opportunity does not match the criteria
  const unmetCriteriaDetails = [].concat(unmetOpportunityConstraints, unmetOfferConstraints);

  return { matchesCriteria, unmetCriteriaDetails };
}

function createCriteria() {
  const criteriaMap = new Map(criteria.map(i => [i.name, i]));

  const getRelevantOffers = (criteriaName, opportunity) => {
    if (!criteriaMap.has(criteriaName)) throw new Error('Invalid criteria name');
    return filterRelevantOffers(criteriaMap.get(criteriaName), opportunity)
  }

  const root = {
    criteria,
    criteriaMap,
    testMatch,
    getRelevantOffers
  };
  return root;
}

module.exports = createCriteria();