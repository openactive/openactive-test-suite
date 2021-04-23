const moment = require('moment');

const { InternalCriteriaFutureScheduledOpportunity } = require('../internal/InternalCriteriaFutureScheduledOpportunity');
const {
  createCriteria,
  mustNotRequireAttendeeDetails,
  mustNotRequireAdditionalDetails,
  remainingCapacityMustBeAtLeastTwo,
  mustHaveBookableOffer,
  sellerMustAllowOpenBooking,
} = require('../criteriaUtils');
const { quantitativeValue, dateRange, advanceBookingOptionNodeConstraint, TRUE_BOOLEAN_CONSTRAINT } = require('../../testDataShape');

/**
 * @typedef {import('../../types/Criteria').OfferConstraint} OfferConstraint
 */

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
    [
      'Seller must allow Open Booking',
      sellerMustAllowOpenBooking,
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
    [
      'Must not require additional details',
      mustNotRequireAdditionalDetails,
    ],
  ],
  testDataShape: options => ({
    opportunityConstraints: ({
      'placeholder:remainingCapacity': quantitativeValue({
        mininclusive: 2,
      }),
      'oa:isOpenBookingAllowed': TRUE_BOOLEAN_CONSTRAINT,
    }),
    offerConstraints: ({
      'oa:validFromBeforeStartDate': dateRange({
        minDate: moment(options.harvestStartTime).toISOString(),
        allowNull: true,
      }),
      'oa:openBookingInAdvance': advanceBookingOptionNodeConstraint({
        blocklist: ['https://openactive.io/Unavailable'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  InternalTestOpportunityBookable,
};
