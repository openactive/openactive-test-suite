const { CriteriaFutureScheduledOpportunity } = require('./CriteriaFutureScheduledOpportunity');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustNotHaveAvailableChannel(offer) {
  return !Array.isArray(offer.availableChannel) || !offer.availableChannel.includes('https://openactive.io/OpenBookingPrepayment');
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityNotBookableViaAvailableChannel
 */
const TestOpportunityNotBookableViaAvailableChannel = createCriteria(
  'TestOpportunityNotBookable',
  [],
  [
    [
      'Must not have available channel',
      mustNotHaveAvailableChannel,
    ],
  ],
  CriteriaFutureScheduledOpportunity,
);

module.exports = {
  TestOpportunityNotBookableViaAvailableChannel,
};
