const moment = require('moment');

/**
 * @typedef {import('../types/Opportunity').Opportunity} Opportunity
 * @typedef {import('../types/Offer').Offer} Offer
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 * @typedef {import('../types/Criteria').Criteria} Criteria
 */

/**
 * @param {object} args
 * @param {string} args.name
 * @param {Criteria['opportunityConstraints']} args.opportunityConstraints
 * @param {Criteria['offerConstraints']} args.offerConstraints
 * @param {Criteria | null} [args.includeConstraintsFromCriteria] If provided,
 *   opportunity and offer constraints will be included from this criteria.
 * @returns {Criteria}
 */
function createCriteria({ name, opportunityConstraints, offerConstraints, includeConstraintsFromCriteria = null }) {
  const baseOpportunityConstraints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.opportunityConstraints : [];
  const baseOfferConstraints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.offerConstraints : [];
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
  // return true for a Slot of an IndividualFacilityUse
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
 * @type {OfferConstraint}
 */
function mustBeWithinBookingWindow(offer, opportunity, options) {
  if (!offer || !offer.validFromBeforeStartDate) {
    return false;
  }

  const start = moment(opportunity.startDate);
  const duration = moment.duration(offer.validFromBeforeStartDate);

  const valid = start.subtract(duration).isBefore(options.harvestStartTime);
  return valid;
}

module.exports = {
  createCriteria,
  getId,
  getType,
  getRemainingCapacity,
  mustBeWithinBookingWindow,
  hasCapacityLimitOfOne,
};
