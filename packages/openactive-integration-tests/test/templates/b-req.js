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
 *   orderProposalVersion: string | null,
 * }} BReqTemplateData
 */

const { dissocPath } = require('ramda');

function createPaymentPart() {
  return {
    '@type': 'Payment',
    name: 'AcmeBroker Points',
    identifier: '1234567890npduy2f',
    accountId: 'STRIP',
  };
}

/**
 * @param {BReqTemplateData} data
 * @returns {boolean}
 */
function isPaymentNeeded(data) {
  return data.totalPaymentDue > 0;
}

/**
 * B request in the Approve Flow (after P).
 *
 * @param {BReqTemplateData} data
 */
function createAfterPBReq(data) {
  const result = {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    orderProposalVersion: data.orderProposalVersion,
  };
  if (isPaymentNeeded(data)) {
    result.payment = createPaymentPart();
  }
  return result;
}

/**
 * Create a B request, excluding the payment related details
 *
 * @param {BReqTemplateData} data
 */
function createNonPaymentRelatedCoreBReq(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
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
 * @param {BReqTemplateData} data
 */
function createStandardFreeBReq(data) {
  return {
    ...createNonPaymentRelatedCoreBReq(data),
    totalPaymentDue: {
      '@type': 'PriceSpecification',
      price: 0,
      priceCurrency: 'GBP',
    },
  };
}

/**
 * @param {BReqTemplateData} data
 */
function createStandardPaidBReq(data) {
  return {
    ...createNonPaymentRelatedCoreBReq(data),
    totalPaymentDue: {
      '@type': 'PriceSpecification',
      price: data.totalPaymentDue,
      priceCurrency: 'GBP',
    },
    payment: createPaymentPart(),
  };
}

/**
 * Flexibly creates a free or paid B request determined by if totalPaymentDue
 * is zero or not.
 *
 * @param {BReqTemplateData} data
 */
function createStandardFreeOrPaidBReq(data) {
  if (data.orderProposalVersion) {
    return createAfterPBReq(data);
  }
  if (isPaymentNeeded(data)) {
    return createStandardPaidBReq(data);
  }
  return createStandardFreeBReq(data);
}

/**
 * B request with missing customer.email
 *
 * @param {BReqTemplateData} data
 */
function createNoCustomerEmailBReq(data) {
  const req = createStandardFreeOrPaidBReq(data);
  return dissocPath(['customer', 'email'], req);
}

/**
 * B request with missing customer.email
 *
 * @param {BReqTemplateData} data
 */
function createNoBrokerNameBReq(data) {
  const req = createStandardFreeOrPaidBReq(data);
  return dissocPath(['broker', 'name'], req);
}

/**
 * Paid B request with incorrect totalPaymentDue value.
 * The price in totalPaymentDue is less than that returned in the C2 request.
 *
 * @param {BReqTemplateData} data
 */
function createIncorrectTotalPaymentDuePriceBReq(data) {
  const req = createStandardPaidBReq(data);
  return {
    ...req,
    totalPaymentDue: {
      ...req.totalPaymentDue,
      price: req.totalPaymentDue.price + 1,
    },
  };
}

/**
 * Incorrect paid B request without payment property.
 * Payment property is required.
 *
 * @param {BReqTemplateData} data
 */
function createIncorrectOrderDueToMissingPaymentProperty(data) {
  const req = createStandardPaidBReq(data);
  return dissocPath(['payment'], req);
}

/**
 * Paid B request with incorrect payment property as identifier is missing.
 *
 * @param {BReqTemplateData} data
 */
function createIncorrectOrderDueToMissingIdentifierInPaymentProperty(data) {
  const req = createStandardPaidBReq(data);
  return dissocPath(['payment', 'identifier'], req);
}

/**
 * Template functions are put into this object so that the function can be
 * referred to by its key e.g. `standardFree`
 */
const bReqTemplates = {
  standardFree: createStandardFreeBReq,
  standardPaid: createStandardPaidBReq,
  standard: createStandardFreeOrPaidBReq,
  noCustomerEmail: createNoCustomerEmailBReq,
  noBrokerName: createNoBrokerNameBReq,
  incorrectTotalPaymentDuePrice: createIncorrectTotalPaymentDuePriceBReq,
  incorrectOrderDueToMissingPaymentProperty: createIncorrectOrderDueToMissingPaymentProperty,
  incorrectOrderDueToMissingIdentifierInPaymentProperty: createIncorrectOrderDueToMissingIdentifierInPaymentProperty,
};

/**
 * @typedef {keyof typeof bReqTemplates} BReqTemplateRef Reference to a particular B Request template
 */

module.exports = {
  bReqTemplates,
};
