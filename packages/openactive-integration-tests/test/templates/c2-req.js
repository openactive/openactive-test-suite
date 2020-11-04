const { dissocPath } = require('ramda');
const { createPaymentPart, additionalDetailsRequiredNotSupplied, additionalDetailsRequiredAndSupplied, additionalDetailsRequiredInvalidBooleanSupplied, additionalDetailsRequiredInvalidDropdownSupplied } = require('./common');

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
      email: 'geoffcapesStageC2@example.com',
      telephone: '020 811 8002',
      givenName: 'GeoffC2',
      familyName: 'CapesC2',
      identifier: 'CustomerIdentifierC2',
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
      attendee: undefined,
      orderItemIntakeForm: undefined,
      orderItemIntakeFormResponse: undefined,
    })),
    payment: createPaymentPart(false),
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

/**
 * C2 request with attendee details
 *
 * @param {C2ReqTemplateData} data
 */
function createAttendeeDetailsC2Req(data) {
  const req = createStandardC2Req(data);
  req.orderedItem.forEach((o) => {
    // eslint-disable-next-line no-param-reassign
    o.attendee = {
      '@type': 'Person',
      telephone: '07712345678',
      givenName: 'Fred',
      familyName: 'Bloggs',
      email: 'fred.bloggs@mailinator.com',
    };
  });
  return req;
}

/**
 * C2 request with additional details required, but not supplied
 *
 * @param {C2ReqTemplateData} data
 */
function createAdditionalDetailsRequiredNotSuppliedC2Req(data) {
  const req = createStandardC2Req(data);
  return additionalDetailsRequiredNotSupplied(req);
}

/**
 * C1 request with additional details required and supplied
 *
 * @param {C2ReqTemplateData} data
 */
function createAdditionalDetailsRequiredAndSuppliedC2Req(data) {
  const req = createAdditionalDetailsRequiredNotSuppliedC2Req(data);
  return additionalDetailsRequiredAndSupplied(req);
}

/**
 * C2 request with additional details required, but invalid boolean value supplied
 *
 * @param {C2ReqTemplateData} data
 */
function createAdditionalDetailsRequiredInvalidBooleanSuppliedC2Req(data) {
  const req = createAdditionalDetailsRequiredNotSuppliedC2Req(data);
  return additionalDetailsRequiredInvalidBooleanSupplied(req);
}

/**
 * C2 request with additional details required, but invalid dropdown value supplied
 *
 * @param {C2ReqTemplateData} data
 */
function createAdditionalDetailsRequiredInvalidDropdownSuppliedC2Req(data) {
  const req = createAdditionalDetailsRequiredNotSuppliedC2Req(data);
  return additionalDetailsRequiredInvalidDropdownSupplied(req);
}

const c2ReqTemplates = {
  standard: createStandardC2Req,
  noCustomerEmail: createNoCustomerEmailC2Req,
  noBrokerName: createNoBrokerNameC2Req,
  attendeeDetails: createAttendeeDetailsC2Req,
  additionalDetailsRequiredNotSupplied: createAdditionalDetailsRequiredNotSuppliedC2Req,
  additionalDetailsRequiredAndSupplied: createAdditionalDetailsRequiredAndSuppliedC2Req,
  additionalDetailsRequiredInvalidBooleanSupplied: createAdditionalDetailsRequiredInvalidBooleanSuppliedC2Req,
  additionalDetailsRequiredInvalidDropdownSupplied: createAdditionalDetailsRequiredInvalidDropdownSuppliedC2Req,
};

/**
 * @typedef {keyof typeof c2ReqTemplates} C2ReqTemplateRef Reference to a particular C2 Request template
 */

module.exports = {
  c2ReqTemplates,
};
