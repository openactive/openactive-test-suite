const { dissocPath } = require('ramda');

/**
 * @typedef {{
 *   sellerId: string,
 *   orderItems: {
 *     position: number,
 *     acceptedOffer: {
 *       '@id': string,
 *     },
 *     orderedItem: {
 *       '@type': string,
 *       '@id': string,
 *     },
 *   }[],
 * }} C1ReqTemplateData
 */

/**
 * @param {C1ReqTemplateData} data
 */
function createStandardC1Req(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'OrderQuote',
    brokerRole: 'https://openactive.io/AgentBroker',
    broker: {
      '@type': 'Organization',
      name: 'MyFitnessApp',
      url: 'https://myfitnessapp.example.com',
      description: 'A fitness app for all the community',
      logo: {
        '@type': 'ImageObject',
        url: 'http://data.myfitnessapp.org.uk/images/logo.png',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Alan Peacock Way',
        addressLocality: 'Village East',
        addressRegion: 'Middlesbrough',
        postalCode: 'TS4 3AE',
        addressCountry: 'GB',
      },
    },
    seller: {
      '@type': 'Organization',
      '@id': data.sellerId,
    },
    orderedItem: data.orderItems.map(orderItem => ({
      '@type': 'OrderItem',
      position: orderItem.position,
      acceptedOffer: {
        '@type': 'Offer',
        '@id': `${orderItem.acceptedOffer['@id']}`,
      },
      orderedItem: {
        '@type': `${orderItem.orderedItem['@type']}`,
        '@id': `${orderItem.orderedItem['@id']}`,
      },
    })),
  };
}

/**
 * C2 request with missing customer.email
 *
 * @param {C1ReqTemplateData} data
 */
function createNoBrokerNameC1Req(data) {
  const req = createStandardC1Req(data);
  return dissocPath(['broker', 'name'], req);
}

const c1ReqTemplates = {
  standard: createStandardC1Req,
  noBrokerName: createNoBrokerNameC1Req,
};

/**
 * @typedef {keyof typeof c1ReqTemplates} C1ReqTemplateRef Reference to a particular C1 Request template
 */

module.exports = {
  c1ReqTemplates,
};
