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
 * }} C2ReqTemplateData
 */

/**
 * @param {C2ReqTemplateData} data
 */
function createStandardC2Req(data) {
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
    customer: {
      '@type': 'Person',
      email: 'geoffcapes@example.com',
      telephone: '020 811 8055',
      givenName: 'Geoff',
      familyName: 'Capes',
      identifier: 'CustomerIdentifier',
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
 * @param {C2ReqTemplateData} data
 */
function createNoCustomerEmailC2Req(data) {
  const req = createStandardC2Req(data);
  return dissocPath(['customer', 'email'], req);
}

/**
 * C2 request with missing customer.email
 *
 * @param {C2ReqTemplateData} data
 */
function createNoBrokerNameC2Req(data) {
  const req = createStandardC2Req(data);
  return dissocPath(['broker', 'name'], req);
}


const c2ReqTemplates = {
  standard: createStandardC2Req,
  noCustomerEmail: createNoCustomerEmailC2Req,
  noBrokerName: createNoBrokerNameC2Req,
};

/**
 * @typedef {keyof typeof c2ReqTemplates} C2ReqTemplateRef Reference to a particular C2 Request template
 */

module.exports = {
  c2ReqTemplates,
};
