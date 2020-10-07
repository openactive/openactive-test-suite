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
 *   totalPaymentDue: number,
 * }} PReqTemplateData
 */

/**
 * @param {PReqTemplateData} data
 */
function createStandardPReq(data) {
  const result = {
    '@context': 'https://openactive.io/',
    '@type': 'OrderProposal',
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
      '@id': `${data.sellerId}`,
    },
    customer: {
      '@type': 'Person',
      email: 'geoffcapes@example.com',
      telephone: '020 811 8055',
      givenName: 'Geoff',
      familyName: 'Capes',
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
    totalPaymentDue: {
      '@type': 'PriceSpecification',
      price: data.totalPaymentDue,
      priceCurrency: 'GBP',
    },
  };
  if (data.totalPaymentDue > 0) {
    result.payment = {
      '@type': 'Payment',
      name: 'AcmeBroker Points',
      identifier: '1234567890npduy2f',
      accountId: 'STRIP',
    };
  }
  return result;
}

const pReqTemplates = {
  standard: createStandardPReq,
};

/**
 * @typedef {keyof typeof pReqTemplates} PReqTemplateRef Reference to a particular P Request template
 */

module.exports = {
  pReqTemplates,
};
