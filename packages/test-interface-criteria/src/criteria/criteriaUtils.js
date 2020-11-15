const moment = require('moment');
const { isObject } = require('lodash');

/**
 * @typedef {import('../types/Opportunity').Opportunity} Opportunity
 * @typedef {import('../types/Offer').Offer} Offer
 * @typedef {import('../types/TestDataHints').TestDataHints} TestDataHints
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 * @typedef {import('../types/Criteria').Criteria} Criteria
 */

/**
 * @param {object} args
 * @param {string} args.name
 * @param {Criteria['opportunityConstraints']} args.opportunityConstraints
 * @param {Criteria['offerConstraints']} args.offerConstraints
 * @param {TestDataHints} args.testDataHints
 * @param {Criteria | null} [args.includeConstraintsFromCriteria] If provided,
 *   opportunity and offer constraints will be included from this criteria.
 * @returns {Criteria}
 */
function createCriteria({ name, opportunityConstraints, offerConstraints, testDataHints, includeConstraintsFromCriteria = null }) {
  const baseOpportunityConstraints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.opportunityConstraints : [];
  const baseOfferConstraints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.offerConstraints : [];
  const baseTestDataHints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.offerConstraints : {
  };
  /**
   * @param {(hint: any) => any} hintAccessor
   * @param {(thisHint: any, baseHint: any) => boolean} chooseThisHintOverBaseHint
   * @returns {any}
   */
  const chooseNarrowerLimit = (hintAccessor, chooseThisHintOverBaseHint) => {
    const thisHint = hintAccessor(testDataHints) ?? null;
    const baseHint = hintAccessor(baseTestDataHints) ?? null;
    if (thisHint === null || baseHint === null) {
      return thisHint ?? baseHint;
    }
    return chooseThisHintOverBaseHint(thisHint, baseHint) ? thisHint : baseHint;
  };
  return {
    name,
    opportunityConstraints: [
      ...baseOpportunityConstraints,
      ...opportunityConstraints,
    ],
    offerConstraints: [
      ...baseOfferConstraints,
      ...offerConstraints,
    ],
    testDataHints: {
      ...baseTestDataHints,
      ...testDataHints,
      startDateMin: chooseNarrowerLimit((hint) => hint.startDateMin, (thisHint, baseHint) => moment(thisHint).isBefore(baseHint)),
      startDateMax: chooseNarrowerLimit((hint) => hint.startDateMax, (thisHint, baseHint) => moment(thisHint).isAfter(baseHint)),
      validFromMin: chooseNarrowerLimit((hint) => hint.validFromMin, (thisHint, baseHint) => moment(thisHint).isBefore(baseHint)),
      validFromMax: chooseNarrowerLimit((hint) => hint.validFromMax, (thisHint, baseHint) => moment(thisHint).isAfter(baseHint)),
      durationMin: chooseNarrowerLimit((hint) => hint.durationMin,
        (thisHint, baseHint) => moment.duration(thisHint).asMilliseconds() > moment.duration(baseHint).asMilliseconds()),
      durationMax: chooseNarrowerLimit((hint) => hint.durationMax,
        (thisHint, baseHint) => moment.duration(thisHint).asMilliseconds() < moment.duration(baseHint).asMilliseconds()),
      remainingCapacityMin: chooseNarrowerLimit((hint) => hint.remainingCapacityMin,
        (thisHint, baseHint) => thisHint > baseHint),
      remainingCapacityMax: chooseNarrowerLimit((hint) => hint.remainingCapacityMax,
        (thisHint, baseHint) => thisHint < baseHint),
    },
  };
}

/**
 * @param {Opportunity} opportunity
 * @returns {string}
 */
function getId(opportunity) {
  // return '@id' in opportunity ? opportunity['@id'] : opportunity.id;
  return opportunity['@id'] || opportunity.id;
}

/**
 * @param {Opportunity} opportunity
 * @returns {string}
 */
function getType(opportunity) {
  return opportunity['@type'] || opportunity.type;
}

/**
 * @param {Opportunity} opportunity
 * @returns {boolean}
 */
function hasCapacityLimitOfOne(opportunity) {
  // return true for a Slot of an IndividualFacilityUse, which is limited to a maximumUses of 1 by the specification.
  return opportunity && opportunity.facilityUse && getType(opportunity.facilityUse) === 'IndividualFacilityUse';
}

/**
 * @param {Opportunity} opportunity
 * @returns {number | null | undefined} Not all opportunities have
 *   remainingAttendeeCapacity (which is optional in ScheduledSessions) or
 *   remainingUses, therefore the return value may be null-ish.
 */
function getRemainingCapacity(opportunity) {
  return opportunity.remainingAttendeeCapacity !== undefined ? opportunity.remainingAttendeeCapacity : opportunity.remainingUses;
}

/**
 * @type {OpportunityConstraint}
 */
function remainingCapacityMustBeAtLeastTwo(opportunity) {
  // A capacity of at least 2 is needed for cases other than IndividualFacilityUse because the multiple OrderItem tests use 2 of the same item (via the opportunityReuseKey).
  // The opportunityReuseKey is not used for IndividualFacilityUse, which is limited to a maximumUses of 1 by the specification.
  return getRemainingCapacity(opportunity) > (hasCapacityLimitOfOne(opportunity) ? 0 : 1);
}

/**
 * For a session, get `organizer`. For a facility, get `provider`.
 * These can be used interchangeably as `organizer` is either a Person or an Organization
 * and `provider` is an Organization.
 *
 * @param {Opportunity} opportunity
 */
function getOrganizerOrProvider(opportunity) {
  if (isObject(opportunity.superEvent)) {
    // TS doesn't allow accessing unknown fields of an `object` type - not sure why
    return /** @type {any} */(opportunity.superEvent).organizer;
  }
  if (isObject(opportunity.facilityUse)) {
    // TS doesn't allow accessing unknown fields of an `object` type - not sure why
    return /** @type {any} */(opportunity.facilityUse).provider;
  }
  throw new Error(`Opportunity has neither superEvent nor facilityUse from which to get organizer/provider. Opportunity fields: ${Object.keys(opportunity).join(', ')}`);
}

module.exports = {
  createCriteria,
  getId,
  getType,
  getRemainingCapacity,
  hasCapacityLimitOfOne,
  remainingCapacityMustBeAtLeastTwo,
  getOrganizerOrProvider,
};
