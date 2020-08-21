const moment = require('moment');

const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function outsideValidFromBeforeStartDate(offer, opportunity) {
  return (Array.isArray(offer.availableChannel) && offer.availableChannel.includes('https://openactive.io/OpenBookingPrepayment'))
    && offer.advanceBooking !== 'https://openactive.io/Unavailable'
    && (offer.validFromBeforeStartDate && moment(opportunity.startDate).subtract(moment.duration(offer.validFromBeforeStartDate)).isAfter());
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate
 */
const TestOpportunityBookableOutsideValidFromBeforeStartDate = createCriteria(
  'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  [],
  [
    [
      'Outside ValidFromBeforeStartDate',
      outsideValidFromBeforeStartDate,
    ],
  ],
  TestOpportunityBookable,
);

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};
