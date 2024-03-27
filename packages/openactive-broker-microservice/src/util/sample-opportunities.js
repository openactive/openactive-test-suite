const { getRelevantOffers } = require('@openactive/test-interface-criteria');
const { getOpportunityMergedWithParentById } = require('./get-opportunity-by-id-from-cache');
const { getRandomBookableOpportunity } = require('./get-random-bookable-opportunity');
const { detectOpportunityType, detectSellerId } = require('./opportunity-utils');

/**
 * @param {Pick<import('../broker-config').BrokerConfig, 'HARVEST_START_TIME'>} config
 * @param {import('../state').State} state
 * @param {import('../models/core').Opportunity} opportunity
 */
function getSampleOpportunities(config, state, opportunity) {
  // Get random opportunity ID
  const opportunityType = detectOpportunityType(opportunity);
  const sellerId = detectSellerId(opportunity);
  const testDatasetIdentifier = 'sample-opportunities';

  const criteriaName = opportunity['test:testOpportunityCriteria'].replace('https://openactive.io/test-interface#', '');
  const bookingFlow = opportunity['test:testOpenBookingFlow'].replace('https://openactive.io/test-interface#', '');

  const bookableOpportunity = getRandomBookableOpportunity(state, {
    sellerId, bookingFlow, opportunityType, criteriaName, testDatasetIdentifier,
  });

  if (bookableOpportunity.opportunity) {
    const opportunityWithParent = getOpportunityMergedWithParentById(
      state,
      bookableOpportunity.opportunity['@id'],
    );
    const json = renderSampleOpportunities(
      config, opportunityWithParent, criteriaName, sellerId,
    );
    return json;
  }
  return {
    error: bookableOpportunity,
  };
}

// NOTE: duplicated from openactive-integration-tests/test/helpers/flow-stages/fetch-opportunities.js
/**
 * @param {string} harvestStartTime
 * @param {import('../models/core').Opportunity} opportunity
 * @param {string} criteriaName
 */
function getRandomRelevantOffer(harvestStartTime, opportunity, criteriaName) {
  const relevantOffers = getRelevantOffers(criteriaName, opportunity, {
    harvestStartTime,
  });
  if (relevantOffers.length === 0) { return null; }

  return relevantOffers[Math.floor(Math.random() * relevantOffers.length)];
}

/**
 * @param {Pick<import('../broker-config').BrokerConfig, 'HARVEST_START_TIME'>} config
 * @param {import('../models/core').Opportunity} opportunity
 * @param {string} criteriaName
 * @param {string} sellerId
 */
function renderSampleOpportunities(config, opportunity, criteriaName, sellerId) {
  const offer = getRandomRelevantOffer(config.HARVEST_START_TIME, opportunity, criteriaName);

  return {
    sampleOpportunities: [
      opportunity,
    ],
    sellerId,
    exampleOrderItems: [
      {
        '@type': 'OrderItem',
        position: 0,
        acceptedOffer: offer['@id'],
        orderedItem: opportunity['@id'],
      },
    ],
  };
}

module.exports = {
  getSampleOpportunities,
};
