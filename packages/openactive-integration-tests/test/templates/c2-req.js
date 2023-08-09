const { dissocPath, dissoc, pipe, omit } = require('ramda');
const shortid = require('shortid');
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
 *     'test:control': boolean,
 *   }[],
 *   brokerRole: string | null,
 *   positionOrderIntakeFormMap: {[k:string]: import('../helpers/flow-stages/flow-stage').OrderItemIntakeForm},
 *   customer: import('../helpers/flow-stages/flow-stage-utils').Customer,
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
 *   seller: string,
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
 *     identifier?: string,
 *     name?: string,
 *     accountId?: string,
 *     paymentProviderId?: string,
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
    seller: data.sellerId,
    customer: data.customer,
    orderedItem: data.orderItems.map(orderItem => ({
      '@type': 'OrderItem',
      position: orderItem.position,
      acceptedOffer: `${orderItem.acceptedOffer['@id']}`,
      orderedItem: `${orderItem.orderedItem['@id']}`,
      attendee: undefined,
      orderItemIntakeForm: undefined,
      orderItemIntakeFormResponse: undefined,
    })),
    payment: createPaymentPart(),
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
 * C2 request with missing OrderItem.OrderedItem for primary OrderItems
 *
 * @param {C2ReqTemplateData} data
 */
function createStandardC2WithoutOrderedItem(data) {
  const req = createStandardC2Req(data);
  req.orderedItem.forEach((orderedItem) => {
    if (!data.orderItems.find(x => x.position === orderedItem.position)['test:control']) {
      const ret = orderedItem;
      delete ret.orderedItem;
    }
  });

  return req;
}

/**
 * C2 request missing OrderItem.AcceptedOffer for primary OrderItems
 *
 * @param {C2ReqTemplateData} data
 */
function createStandardC2WithoutAcceptedOffer(data) {
  const req = createStandardC2Req(data);
  req.orderedItem.forEach((orderedItem) => {
    if (!data.orderItems.find(x => x.position === orderedItem.position)['test:control']) {
      const ret = orderedItem;
      delete ret.acceptedOffer;
    }
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
    email: 'mybooking@corporate-client.com',
    identifier: data.customer.identifier,
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
 * C2 request with payment property - though reconciliation fields in `payment`
 * are missing.
 *
 * Note that the purpose of this template is to test using missing `payment` data
 * when `payment` is required.
 *
 * @param {C2ReqTemplateData} data
 */
function createMissingPaymentReconciliationDetails(data) {
  const req = createStandardC2Req(data);
  return {
    ...req,
    // @ts-ignore
    payment: omit(['accountId', 'name', 'paymentProviderId'], req.payment),
  };
}

/**
 * C2 request with payment property - though reconciliation fields in `payment`
 * are incorrect.
 *
 * @param {C2ReqTemplateData} data
 */
function createIncorrectReconciliationDetails(data) {
  const req = createStandardC2Req(data);
  // Always include payment details, regardless of if payment reconciliation
  // details are available in the config, as per the spec for Payment reconciliation detail validation
  if (!req.payment) req.payment = createPaymentPart(undefined, true);
  if (req.payment.accountId) {
    req.payment.accountId = `invalid-${shortid.generate()}`;
  }
  if (req.payment.name) {
    req.payment.name = `invalid-${shortid.generate()}`;
  }
  if (req.payment.paymentProviderId) {
    req.payment.paymentProviderId = `invalid-${shortid.generate()}`;
  }
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
  incorrectReconciliationDetails: createIncorrectReconciliationDetails,
  missingPaymentReconciliationDetails: createMissingPaymentReconciliationDetails,
};

/**
 * @typedef {keyof typeof c2ReqTemplates} C2ReqTemplateRef Reference to a particular C2 Request template
 */

module.exports = {
  c2ReqTemplates,
};
