const { dissocPath, dissoc, pipe, omit } = require('ramda');
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
 *   brokerRole: string | null,
 * }} C1ReqTemplateData
 */

/**
 * @param {C1ReqTemplateData} data
 */
function createStandardC1Req(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'OrderQuote',
    brokerRole: data.brokerRole || 'https://openactive.io/AgentBroker',
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
      attendee: undefined,
      orderItemIntakeForm: undefined,
      orderItemIntakeFormResponse: undefined,
    })),
    payment: createPaymentPart(false),
  };
}

/**
 * C1 request with missing customer.email
 *
 * @param {C1ReqTemplateData} data
 */
function createNoBrokerNameC1Req(data) {
  const req = createStandardC1Req(data);
  return dissocPath(['broker', 'name'], req);
}

/**
 * C1 request with attendee details
 *
 * @param {C1ReqTemplateData} data
 */
function createAttendeeDetailsC1Req(data) {
  const req = createStandardC1Req(data);
  for (const orderItem of req.orderedItem) {
    orderItem.attendee = {
      '@type': 'Person',
      telephone: '07712345678',
      givenName: 'Fred',
      familyName: 'Bloggs',
      email: 'fred.bloggs@mailinator.com',
    };
  }
  return req;
}

/**
 * C1 request with additional details required, but not supplied
 *
 * @param {C1ReqTemplateData} data
 */
function createAdditionalDetailsRequiredNotSuppliedC1Req(data) {
  const req = createStandardC1Req(data);
  return additionalDetailsRequiredNotSupplied(req);
}

/**
 * C1 request with additional details required and supplied
 *
 * @param {C1ReqTemplateData} data
 */
function createAdditionalDetailsRequiredAndSuppliedC1Req(data) {
  const req = createAdditionalDetailsRequiredNotSuppliedC1Req(data);
  return additionalDetailsRequiredAndSupplied(req);
}

/**
 * C1 request with additional details required, but invalid boolean value supplied
 *
 * @param {C1ReqTemplateData} data
 */
function createAdditionalDetailsRequiredInvalidBooleanSuppliedC1Req(data) {
  const req = createAdditionalDetailsRequiredNotSuppliedC1Req(data);
  return additionalDetailsRequiredInvalidBooleanSupplied(req);
}

/**
 * C1 request with additional details required, but invalid dropdown value supplied
 *
 * @param {C1ReqTemplateData} data
 */
function createAdditionalDetailsRequiredInvalidDropdownSuppliedC1Req(data) {
  const req = createAdditionalDetailsRequiredNotSuppliedC1Req(data);
  return additionalDetailsRequiredInvalidDropdownSupplied(req);
}

/**
 * C1 request with missing broker
 *
 * @param {C1ReqTemplateData} data
 */
function createNoBrokerC1Req(data) {
  const req = createStandardC1Req(data);
  return dissoc('broker', req);
}

/** C1 request with missing customer and broker */
const createNoCustomerAndNoBrokerC1Req = pipe(createStandardC1Req, omit(['customer', 'broker']));

const c1ReqTemplates = {
  standard: createStandardC1Req,
  noBrokerName: createNoBrokerNameC1Req,
  attendeeDetails: createAttendeeDetailsC1Req,
  additionalDetailsRequiredNotSupplied: createAdditionalDetailsRequiredNotSuppliedC1Req,
  additionalDetailsRequiredAndSupplied: createAdditionalDetailsRequiredAndSuppliedC1Req,
  additionalDetailsRequiredInvalidBooleanSupplied: createAdditionalDetailsRequiredInvalidBooleanSuppliedC1Req,
  additionalDetailsRequiredInvalidDropdownSupplied: createAdditionalDetailsRequiredInvalidDropdownSuppliedC1Req,
  noBroker: createNoBrokerC1Req,
  noCustomerAndNoBroker: createNoCustomerAndNoBrokerC1Req,
};

/**
 * @typedef {keyof typeof c1ReqTemplates} C1ReqTemplateRef Reference to a particular C1 Request template
 */

module.exports = {
  c1ReqTemplates,
};
