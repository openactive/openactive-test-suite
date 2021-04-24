const { dissocPath, dissoc, pipe, omit } = require('ramda');
const { createPaymentPart, addOrderItemIntakeFormResponse } = require('./common');

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
 *   positionOrderIntakeFormMap: {[k:string]: import('../helpers/flow-stages/flow-stage').OrderItemIntakeForm}
 * }} C2ReqTemplateData
 */

/**
 * @typedef {{
 *   '@context': string,
 *   '@type': string,
 *   brokerRole: string,
 *   broker: {
 *     '@type': string,
 *     name: string,
 *     url: string,
 *     description: string,
 *     logo: {
 *       '@type': string,
 *       url: string,
 *     },
 *     address: {
 *       '@type': string,
 *       streetAddress: string,
 *       addressLocality: string,
 *       addressRegion: string,
 *       postalCode: string,
 *       addressCountry: string,
 *     },
 *   },
 *   seller: {
 *     '@type': string,
 *     '@id': string,
 *   },
 *   customer: any, // ToDo: add this?
 *   orderedItem: {
 *     '@type': string,
 *     position: number,
 *     acceptedOffer: string,
 *     orderedItem: string,
 *     attendee?: {
 *       '@type': 'Person'
 *       telephone: string,
 *       givenName: string,
 *       familyName: string,
 *       email: string,
 *     },
 *   }[],
 *   payment: {
 *     '@type': string,
 *   },
 * }} C2Req
 */

/**
 * @param {C2ReqTemplateData} data
 * @returns {C2Req}
 */
function createStandardC2Req(data) {
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
      acceptedOffer: `${orderItem.acceptedOffer['@id']}`,
      orderedItem: `${orderItem.orderedItem['@id']}`,
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
 * C2 request with missing OrderItem.OrderedItem
 *
 * @param {C2ReqTemplateData} data
 */
function createStandardC2WithoutOrderedItem(data) {
  const req = createStandardC2Req(data);
  req.orderedItem.forEach((orderedItem) => {
    const ret = orderedItem;
    delete ret.orderedItem;
  });

  return req;
}

/**
 * C2 request with attendee details
 *
 * @param {C2ReqTemplateData} data
 */
function createAttendeeDetailsC2Req(data) {
  const req = createStandardC2Req(data);
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
 * C2 request missing OrderItem.AcceptedOffer
 *
 * @param {C2ReqTemplateData} data
 */
function createStandardC2WithoutAcceptedOffer(data) {
  const req = createStandardC2Req(data);
  req.orderedItem.forEach((orderedItem) => {
    const ret = orderedItem;
    delete ret.acceptedOffer;
  });
  return req;
}

/**
 * C2 request with additional details supplied
 *
 * @param {C2ReqTemplateData} data
 */
function createAdditionalDetailsSuppliedC2Req(data) {
  const req = createStandardC2Req(data);
  const isOrderIntakeResponseValid = true;
  return addOrderItemIntakeFormResponse(req, data.positionOrderIntakeFormMap, isOrderIntakeResponseValid);
}

/**
 * C2 request with additional details required but invalidly supplied.
 * The invalid details supplied are dynamically created depending on the type of additional
 * details required (ShortAnswer, Paragraph, Dropdown, or Boolean)
 *
 * @param {C2ReqTemplateData} data
 */
function createAdditionalDetailsRequiredInvalidSuppliedC2Req(data) {
  const req = createStandardC2Req(data);
  const isOrderIntakeResponseValid = false;
  return addOrderItemIntakeFormResponse(req, data.positionOrderIntakeFormMap, isOrderIntakeResponseValid);
}

/**
 * @param {C2ReqTemplateData} data
 */
function createBusinessCustomerC2Req(data) {
  const req = createStandardC2Req(data);
  req.customer = {
    '@type': 'Organization',
    name: 'SomeCorporateClient',
    identifier: 'CustomerIdentifierC2',
    url: 'https://corporate.client.com',
    description: 'A corporate client using fitness services',
    logo: {
      '@type': 'ImageObject',
      url: 'http://corporate.client.com/images/logo.png',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'A Street',
      addressLocality: 'A Town',
      addressRegion: 'Middlesbrough',
      postalCode: 'TS4 3AE',
      addressCountry: 'GB',
    },
  };
  return req;
}

/**
 * C2 request with missing broker
 *
 * @param {C2ReqTemplateData} data
 */
function createNoBrokerC2Req(data) {
  const req = createStandardC2Req(data);
  return dissoc('broker', req);
}

/** C2 request with missing customer and broker */
const createNoCustomerAndNoBrokerC2Req = pipe(createStandardC2Req, omit(['customer', 'broker']));

/** C2 request with missing customer */
const createNoCustomerC2Req = pipe(createStandardC2Req, dissoc('customer'));

const c2ReqTemplates = {
  standard: createStandardC2Req,
  noCustomerEmail: createNoCustomerEmailC2Req,
  noBrokerName: createNoBrokerNameC2Req,
  noOrderedItem: createStandardC2WithoutOrderedItem,
  noAcceptedOffer: createStandardC2WithoutAcceptedOffer,
  attendeeDetails: createAttendeeDetailsC2Req,
  additionalDetailsSupplied: createAdditionalDetailsSuppliedC2Req,
  additionalDetailsRequiredInvalidSupplied: createAdditionalDetailsRequiredInvalidSuppliedC2Req,
  businessCustomer: createBusinessCustomerC2Req,
  noBroker: createNoBrokerC2Req,
  noCustomerAndNoBroker: createNoCustomerAndNoBrokerC2Req,
  noCustomer: createNoCustomerC2Req,
};

/**
 * @typedef {keyof typeof c2ReqTemplates} C2ReqTemplateRef Reference to a particular C2 Request template
 */

module.exports = {
  c2ReqTemplates,
};
