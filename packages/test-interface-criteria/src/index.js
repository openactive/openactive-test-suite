/*!
 * test-interface-criteria
 * MIT Licensed
 */
const { memoize } = require('lodash');
const { DateTime } = require('luxon');
const { allCriteria } = require('./criteria');
const { getOrganizerOrProvider, extendTestDataShape, getRemainingCapacity } = require('./criteria/criteriaUtils');
const { openBookingFlowRequirementArrayConstraint } = require('./testDataShape');

/**
 * @typedef {import('./types/Criteria').Criteria} Criteria
 * @typedef {import('./types/Opportunity').Opportunity} Opportunity
 * @typedef {import('./types/Offer').Offer} Offer
 * @typedef {import('./types/Options').Options} Options
 * @typedef {import('./types/TestDataShape').TestDataShape} TestDataShape
 * @typedef {import('./types/TestDataShape').TestDataShapeOpportunityConstraints} TestDataShapeOpportunityConstraints
 */

/**
 * @typedef {{
 *   harvestStartTime: string;
 * }} LibOptions Options object as supplied to the test-interface-criteria library API.
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
  // Merge Offers respecting inheritance, based on the `identifier`, to allow overrides
  const childOffers = opportunity.offers || [];
  const childOffersIdentifierSet = new Set(childOffers.map((x) => x?.identifier).filter((x) => x !== undefined));
  const parentOffers = (opportunity.superEvent && opportunity.superEvent.offers) || []; // Note FacilityUse does not have bookable offers, as it does not allow inheritance
  return childOffers.concat(parentOffers.filter((o) => !childOffersIdentifierSet.has(o.identifier)));
}

/**
 * Memoized as an optimization so as to not have to recalculate the same +2 hours datetime with every
 * single new item that is processed by Broker.
 */
const getHarvestStartTimeAndTwoHoursLater = memoize((/** @type {string} */harvestStartTimeIso) => {
  const harvestStartTime = DateTime.fromISO(harvestStartTimeIso);
  const harvestStartTimeTwoHoursLater = harvestStartTime.plus({ hours: 2 });
  return {
    harvestStartTime,
    harvestStartTimeTwoHoursLater,
  };
});

/**
 * @param {LibOptions} libOptions
 * @returns {Options}
 */
function augmentLibOptions(libOptions) {
  return getHarvestStartTimeAndTwoHoursLater(libOptions.harvestStartTime);
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
 * @param {LibOptions} libOptions
 */
function testMatch(criteria, opportunity, libOptions) {
  const options = augmentLibOptions(libOptions);
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
 * @param {LibOptions} libOptions
 */
function getRelevantOffers(criteriaName, opportunity, libOptions) {
  const options = augmentLibOptions(libOptions);
  const criteria = getCriteriaAndAssertExists(criteriaName);
  return filterRelevantOffers(criteria, opportunity, options);
}

/**
 * @param {string} criteriaName
 * @param {'OpenBookingSimpleFlow' | 'OpenBookingApprovalFlow'} bookingFlow
 * @param {string} oppotunityType
 * @param {LibOptions} libOptions
 */
function getTestDataShapeExpressions(criteriaName, bookingFlow, oppotunityType, libOptions) {
  const options = augmentLibOptions(libOptions);
  const criteria = getCriteriaAndAssertExists(criteriaName);
  const shape = criteria.testDataShape(options);
  /**
   * @param {{[predicate: string]: import('./types/TestDataShape').TestDataNodeConstraint}} constraints
   */
  const convertConstraintsToShapeExpression = (constraints) => (
    Object.entries(constraints || {})
      .map(([predicate, constraint]) => ({
        '@type': 'test:TripleConstraint',
        predicate: predicate
          .replace('oa:', 'https://openactive.io/')
          .replace('schema:', 'https://schema.org/'),
        valueExpr: constraint,
      }))
  );
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
  const opportunityConstraints = replaceOpportunityConstraintsPlaceholderFields(
    oppotunityType, combinedConstraints.opportunityConstraints,
  );
  return {
    'test:testOpportunityDataShapeExpression': convertConstraintsToShapeExpression(opportunityConstraints),
    'test:testOfferDataShapeExpression': convertConstraintsToShapeExpression(combinedConstraints.offerConstraints),
  };
}

/**
 * @param {string} opportunityType e.g. IndividualFacilityUseSlot
 * @param {TestDataShapeOpportunityConstraints} opportunityConstraints
 */
function replaceOpportunityConstraintsPlaceholderFields(opportunityType, opportunityConstraints) {
  const {
    'placeholder:remainingCapacity': placeholderRemainingCapacity,
    'placeholder:remainingCapacityIfuSlot': placeholderRemainingCapacityIfuSlot,
    ...remainingOpportunityConstraints
  } = opportunityConstraints;
  switch (opportunityType) {
    case 'IndividualFacilityUseSlot':
      return {
        ...remainingOpportunityConstraints,
        'oa:remainingUses': placeholderRemainingCapacityIfuSlot,
      };
    case 'FacilityUseSlot':
      return {
        ...remainingOpportunityConstraints,
        'oa:remainingUses': placeholderRemainingCapacity,
      };
    default:
      return {
        ...remainingOpportunityConstraints,
        'schema:remainingAttendeeCapacity': placeholderRemainingCapacity,
      };
  }
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
    getRemainingCapacity,
  },
};
