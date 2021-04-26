/*!
 * test-interface-criteria
 * MIT Licensed
 */
const { allCriteria } = require('./criteria');
const { getOrganizerOrProvider, extendTestDataShape } = require('./criteria/criteriaUtils');
const { openBookingFlowRequirementArrayConstraint } = require('./testDataShape');

/**
 * @typedef {import('./types/Criteria').Criteria} Criteria
 * @typedef {import('./types/Opportunity').Opportunity} Opportunity
 * @typedef {import('./types/Offer').Offer} Offer
 * @typedef {import('./types/Options').Options} Options
 * @typedef {import('./types/TestDataShape').TestDataShape} TestDataShape
 */

const criteriaMap = new Map(allCriteria.map((criteria) => [criteria.name, criteria]));

/**
 * @param {string} criteriaName
 */
function getCriteriaAndAssertExists(criteriaName) {
  const criteria = criteriaMap.get(criteriaName);
  if (criteria == null) {
    throw new Error(`Unrecognised criteriaName: ${criteriaName}`);
  }
  return criteria;
}

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
  const criteria = getCriteriaAndAssertExists(criteriaName);
  return filterRelevantOffers(criteria, opportunity, options);
}

/**
 * @param {string} criteriaName
 * @param {'OpenBookingSimpleFlow' | 'OpenBookingApprovalFlow'} bookingFlow
 * @param {string} remainingCapacityPredicate The ShEx predicate to use for "remaining capacity". This should be
 *   remainingUses for Slots and remainingAttendeeCapacity for Events.
 * @param {Options} options
 */
function getTestDataShapeExpressions(criteriaName, bookingFlow, remainingCapacityPredicate, options) {
  const criteria = getCriteriaAndAssertExists(criteriaName);
  const shape = criteria.testDataShape(options);
  const contextualisePredicate = (predicate) => (predicate === 'placeholder:remainingCapacity' ? remainingCapacityPredicate : predicate);
  /**
   * @param {{[predicate: string]: import('./types/TestDataShape').TestDataNodeConstraint}} constraints
   */
  const convertToShapeExpression = (constraints) => (
    Object.entries(constraints || {})
      .map(([predicate, constraint]) => ({
        '@type': 'test:TripleConstraint',
        predicate: contextualisePredicate(predicate).replace('oa:', 'https://openactive.io/').replace('schema:', 'https://schema.org/'),
        valueExpr: constraint,
      })));
  /** @type {TestDataShape} */
  const constraintsDueToBookingFlow = {
    offerConstraints: {
      'oa:openBookingFlowRequirement': openBookingFlowRequirementArrayConstraint(
        bookingFlow === 'OpenBookingApprovalFlow'
          ? { includesAll: ['https://openactive.io/OpenBookingApproval'] }
          : { excludesAll: ['https://openactive.io/OpenBookingApproval'] },
      ),
    },
  };
  const combinedConstraints = extendTestDataShape(shape, constraintsDueToBookingFlow, criteriaName);
  return {
    'test:testOpportunityDataShapeExpression': convertToShapeExpression(combinedConstraints.opportunityConstraints),
    'test:testOfferDataShapeExpression': convertToShapeExpression(combinedConstraints.offerConstraints),
  };
}

module.exports = {
  // Main
  criteria: allCriteria,
  criteriaMap,
  testMatch,
  getRelevantOffers,
  getTestDataShapeExpressions,
  // Utils
  utils: {
    getOrganizerOrProvider,
  },
};
