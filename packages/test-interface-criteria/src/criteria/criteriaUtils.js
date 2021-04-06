const moment = require('moment');
const { isObject } = require('lodash');

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
* @type {OfferConstraint}
*/
function mustBeWithinBookingWindow(offer, opportunity, options) {
  if (!offer || !offer.validFromBeforeStartDate) {
    return null; // Required for validation step
  }

  const start = moment(opportunity.startDate);
  const duration = moment.duration(offer.validFromBeforeStartDate);

  const valid = start.subtract(duration).isBefore(options.harvestStartTime);
  return valid;
}

/**
* @type {OfferConstraint}
*/
function mustRequireAttendeeDetails(offer) {
  return Array.isArray(offer.openBookingFlowRequirement) && offer.openBookingFlowRequirement.includes('https://openactive.io/OpenBookingAttendeeDetails');
}

/**
* @type {OfferConstraint}
*/
function mustNotRequireAttendeeDetails(offer) {
  return !mustRequireAttendeeDetails(offer);
}

/**
 * @type {OfferConstraint}
 */
function mustRequireAdditionalDetails(offer) {
  return Array.isArray(offer.openBookingFlowRequirement) && offer.openBookingFlowRequirement.includes('https://openactive.io/OpenBookingIntakeForm');
}

/**
 * @type {OfferConstraint}
 */
function mustNotRequireAdditionalDetails(offer) {
  return !mustRequireAdditionalDetails(offer);
}

function mustBeWithinCancellationWindow(offer, opportunity, options) {
  if (!offer || !offer.latestCancellationBeforeStartDate) {
    return null; // Required for validation step
  }

  const start = moment(opportunity.startDate);
  const duration = moment.duration(offer.latestCancellationBeforeStartDate);

  const valid = !start.subtract(duration).isBefore(options.harvestStartTime);
  return valid;
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
* @type {OpportunityConstraint}
*/
function startDateMustBe2HrsInAdvance(opportunity, options) {
  return moment(options.harvestStartTime).add(moment.duration('P2H')).isBefore(opportunity.startDate);
}

/**
* @type {OpportunityConstraint}
*/
function eventStatusMustNotBeCancelledOrPostponed(opportunity) {
  return !(opportunity.eventStatus === 'https://schema.org/EventCancelled' || opportunity.eventStatus === 'https://schema.org/EventPostponed');
}

/**
* @type {OfferConstraint}
*/
function mustHaveBookableOffer(offer, opportunity, options) {
  return (Array.isArray(offer.availableChannel) && offer.availableChannel.includes('https://openactive.io/OpenBookingPrepayment'))
   && offer.advanceBooking !== 'https://openactive.io/Unavailable'
   && (!offer.validFromBeforeStartDate || moment(opportunity.startDate).subtract(moment.duration(offer.validFromBeforeStartDate)).isBefore(options.harvestStartTime));
}

/**
* @type {OfferConstraint}
*/
function mustNotAllowFullRefund(offer) {
  return offer.allowCustomerCancellationFullRefund === false;
}

/**
* @type {OfferConstraint}
*/
function mustAllowFullRefund(offer) {
  return offer.allowCustomerCancellationFullRefund === true;
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
  mustBeWithinBookingWindow,
  mustBeWithinCancellationWindow,
  hasCapacityLimitOfOne,
  remainingCapacityMustBeAtLeastTwo,
  mustRequireAttendeeDetails,
  mustNotRequireAttendeeDetails,
  startDateMustBe2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
  mustHaveBookableOffer,
  getOrganizerOrProvider,
  mustNotAllowFullRefund,
  mustAllowFullRefund,
  mustRequireAdditionalDetails,
  mustNotRequireAdditionalDetails,
};
