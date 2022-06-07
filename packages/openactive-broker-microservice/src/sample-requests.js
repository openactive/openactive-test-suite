const { getRelevantOffers } = require('@openactive/test-interface-criteria');
const { HARVEST_START_TIME } = require('./broker-config');

const broker = {
  '@type': 'Organization',
  name: 'Example Broker',
  url: 'https://broker.example.com',
  description: 'A fitness app for imaginary people',
  logo: {
    '@type': 'ImageObject',
    url: 'http://broker.example.com/images/logo.png',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Alan Peacock Way',
    addressLocality: 'Village East',
    addressRegion: 'Middlesbrough',
    postalCode: 'TS4 3AE',
    addressCountry: 'GB',
  },
};

const customer = {
  '@type': 'Person',
  email: 'geoffcapes@example.com',
  telephone: '020 811 8055',
  givenName: 'Geoff',
  familyName: 'Capes',
};

function checkpointOne(opportunity, seller, offer) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'OrderQuote',
    brokerRole: 'https://openactive.io/AgentBroker',
    broker,
    seller,
    orderedItem: [
      {
        '@type': 'OrderItem',
        position: 0,
        acceptedOffer: offer['@id'],
        orderedItem: opportunity['@id'],
      },
    ],
  };
}

function checkpointTwo(opportunity, seller, offer) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'OrderQuote',
    brokerRole: 'https://openactive.io/AgentBroker',
    broker,
    seller,
    customer,
    orderedItem: [
      {
        '@type': 'OrderItem',
        position: 0,
        acceptedOffer: offer['@id'],
        orderedItem: opportunity['@id'],
      },
    ],
  };
}

function book(opportunity, seller, offer) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    brokerRole: 'https://openactive.io/AgentBroker',
    broker,
    seller,
    customer,
    orderedItem: [
      {
        '@type': 'OrderItem',
        position: 0,
        acceptedOffer: offer['@id'],
        orderedItem: opportunity['@id'],
      },
    ],
  };
}

function proposal(opportunity, seller, offer) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'OrderProposal',
    brokerRole: 'https://openactive.io/AgentBroker',
    broker,
    seller,
    customer,
    orderedItem: [
      {
        '@type': 'OrderItem',
        position: 0,
        acceptedOffer: offer['@id'],
        orderedItem: opportunity['@id'],
      },
    ],
  };
}

function proposalUpdate() {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'OrderProposal',
    orderProposalStatus: 'https://openactive.io/CustomerRejected',
    orderCustomerNote: "Sorry I've actually made other plans, hope you find someone!",
  };
}

function orderCancellation() {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    orderedItem: [
      {
        '@type': 'OrderItem',
        '@id': '',
        orderItemStatus: 'https://openactive.io/CustomerCancelled',
      },
    ],
  };
}

// NOTE: duplicated from openactive-integration-tests/test/helpers/flow-stages/fetch-opportunities.js
function getRandomRelevantOffer(opportunity, criteriaName) {
  const relevantOffers = getRelevantOffers(criteriaName, opportunity, {
    harvestStartTime: HARVEST_START_TIME,
  });
  if (relevantOffers.length === 0) { return null; }

  return relevantOffers[Math.floor(Math.random() * relevantOffers.length)];
}

function buildSampleRequests(opportunity, criteriaName, sellerId) {
  const offer = getRandomRelevantOffer(opportunity, criteriaName);

  return {
    opportunity,
    checkpointOne: checkpointOne(opportunity, sellerId, offer),
    checkpointTwo: checkpointTwo(opportunity, sellerId, offer),
    book: book(opportunity, sellerId, offer),
    proposal: proposal(opportunity, sellerId, offer),
    proposalUpdate: proposalUpdate(),
    orderCancellation: orderCancellation(),
  };
}

module.exports = {
  buildSampleRequests,
};
