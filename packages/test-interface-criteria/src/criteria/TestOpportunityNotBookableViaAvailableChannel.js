const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const { createCriteria } = require('./criteriaUtils');
const { availableChannelArrayConstraint } = require('../testDataShape');

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
const TestOpportunityNotBookableViaAvailableChannel = createCriteria({
  name: 'TestOpportunityNotBookableViaAvailableChannel',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must not have available channel',
      mustNotHaveAvailableChannel,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      'schema:availableChannel': availableChannelArrayConstraint({
        excludesAll: ['https://openactive.io/OpenBookingPrepayment'],
      }),
    },
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityNotBookableViaAvailableChannel,
};
