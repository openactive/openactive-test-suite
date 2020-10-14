const moment = require('moment');

const { InternalCriteriaFutureScheduledOpportunity } = require('../internal/InternalCriteriaFutureScheduledOpportunity');
const { remainingCapacityMustBeAtLeastTwo, createCriteria } = require('../criteriaUtils');

/**
 * @typedef {import('../../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustHaveBookableOffer(offer, opportunity) {
  return (Array.isArray(offer.availableChannel) && offer.availableChannel.includes('https://openactive.io/OpenBookingPrepayment'))
    && offer.advanceBooking !== 'https://openactive.io/Unavailable'
    && (!offer.validFromBeforeStartDate || moment(opportunity.startDate).subtract(moment.duration(offer.validFromBeforeStartDate)).isBefore());
}

/**
 * Internal criteria which almost implements https://openactive.io/test-interface#TestOpportunityBookable
 * but handily leaves out anything related to openBookingFlowRequirement, so
 * that bookable criteria for Simple Booking Flow, Minimal Proposal Flow,
 * and Proposal Amendment flow can be generated using this
 */
const InternalTestOpportunityBookable = createCriteria({
  name: '_InternalTestOpportunityBookable',
  opportunityConstraints: [
    [
      'Remaining capacity must be at least two (or one for IndividualFacilityUse)',
      remainingCapacityMustBeAtLeastTwo,
    ],
  ],
  offerConstraints: [
    [
      'Must have "bookable" offer',
      mustHaveBookableOffer,
    ],
  ],
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  InternalTestOpportunityBookable,
};
