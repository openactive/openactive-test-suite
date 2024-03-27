const { getRelevantOffers } = require('@openactive/test-interface-criteria');

// NOTE: duplicated from openactive-integration-tests/test/helpers/flow-stages/fetch-opportunities.js
/**
 * @param {string} harvestStartTime
 * @param {import('./models/core').Opportunity} opportunity
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
 * @param {Pick<import('./broker-config').BrokerConfig, 'HARVEST_START_TIME'>} config
 * @param {import('./models/core').Opportunity} opportunity
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
  renderSampleOpportunities,
};
