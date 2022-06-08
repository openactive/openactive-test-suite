const { getRelevantOffers } = require('@openactive/test-interface-criteria');
const { HARVEST_START_TIME } = require('./broker-config');

// NOTE: duplicated from openactive-integration-tests/test/helpers/flow-stages/fetch-opportunities.js
function getRandomRelevantOffer(opportunity, criteriaName) {
  const relevantOffers = getRelevantOffers(criteriaName, opportunity, {
    harvestStartTime: HARVEST_START_TIME,
  });
  if (relevantOffers.length === 0) { return null; }

  return relevantOffers[Math.floor(Math.random() * relevantOffers.length)];
}

function renderSampleOpportunities(opportunity, criteriaName, sellerId) {
  const offer = getRandomRelevantOffer(opportunity, criteriaName);

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
    requiredPayment: offer.price === 0 ? null : {
      '@type': 'Payment',
      identifier: 'EUzQjk0NzhDNjE4MzNGQjI',
      name: 'AcmeBroker Points',
      accountId: 'SN1593',
      paymentProviderId: 'STRIPE',
    },
  };
}

module.exports = {
  renderSampleOpportunities,
};
