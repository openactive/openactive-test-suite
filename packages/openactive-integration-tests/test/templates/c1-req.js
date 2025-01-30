const { dissocPath, dissoc, pipe, omit } = require('ramda');
const shortid = require('shortid');
const { createPaymentPart } = require('./common');

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
    seller: data.sellerId,
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
 * C1 request with missing OrderItem.OrderedItem for primary OrderItems
 *
 * @param {C1ReqTemplateData} data
 */
function createStandardC1WithoutOrderedItem(data) {
  const req = createStandardC1Req(data);
  req.orderedItem.forEach((orderedItem) => {
    if (!data.orderItems.find(x => x.position === orderedItem.position)['test:control']) {
      const ret = orderedItem;
      delete ret.orderedItem;
    }
  });

  return req;
}

/**
 * C1 request with missing OrderItem.AcceptedOffer for primary OrderItems
 *
 * @param {C1ReqTemplateData} data
 */
function createStandardC1WithoutAcceptedOffer(data) {
  const req = createStandardC1Req(data);
  req.orderedItem.forEach((orderedItem) => {
    if (!data.orderItems.find(x => x.position === orderedItem.position)['test:control']) {
      const ret = orderedItem;
      delete ret.acceptedOffer;
    }
  });
  return req;
}

/**
 * C2 request with payment property - though reconciliation fields in `payment`
 * are missing.
 *
 * Note that the purpose of this template is to test using missing `payment` data
 * when `payment` is required.
 *
 * @param {C1ReqTemplateData} data
 */
function createMissingPaymentReconciliationDetails(data) {
  const req = createStandardC1Req(data);
  return {
    ...req,
    // @ts-ignore
    payment: omit(['accountId', 'name', 'paymentProviderId'], req.payment),
  };
}

/**
 * C1 request with payment property - though reconciliation fields in `payment`
 * are incorrect.
 *
 * @param {C1ReqTemplateData} data
 */
function createIncorrectReconciliationDetails(data) {
  const req = createStandardC1Req(data);
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
  noBroker: createNoBrokerC1Req,
  noCustomerAndNoBroker: createNoCustomerAndNoBrokerC1Req,
  noOrderedItem: createStandardC1WithoutOrderedItem,
  noAcceptedOffer: createStandardC1WithoutAcceptedOffer,
  incorrectReconciliationDetails: createIncorrectReconciliationDetails,
  missingPaymentReconciliationDetails: createMissingPaymentReconciliationDetails,
};

/**
 * @typedef {keyof typeof c1ReqTemplates} C1ReqTemplateRef Reference to a particular C1 Request template
 */

module.exports = {
  c1ReqTemplates,
};
