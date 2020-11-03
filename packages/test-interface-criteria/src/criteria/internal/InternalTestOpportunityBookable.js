const { InternalCriteriaFutureScheduledOpportunity } = require('../internal/InternalCriteriaFutureScheduledOpportunity');
const {
  createCriteria,
  mustNotRequireAttendeeDetails,
  remainingCapacityMustBeAtLeastTwo,
  mustHaveBookableOffer,
} = require('../criteriaUtils');

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
    [
      'Must not require attendee details',
      mustNotRequireAttendeeDetails,
    ],
  ],
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  InternalTestOpportunityBookable,
};
