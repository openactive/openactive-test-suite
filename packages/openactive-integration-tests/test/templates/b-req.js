// TODO many of the templates in this file are used by just one test
// It may be worth, therefore, having the templates defined in the test where they
// are used. This would reduce the chance of issues as the template definition is
// often heavily coupled with the test (e.g. it only works if a certain criteria)
// is used.
// If all the templates are stored in this file, it would be tempting to use an
// existing one for a new test where it may give false positives as it uses the
// wrong opportunity criteria.
// Alternatively, could we have it so that the template only works for some criteria..?
const { dissocPath, omit } = require('ramda');
const shortid = require('shortid');
const { createPaymentPart, isPaidOpportunity, isPaymentAvailable } = require('./common');

/**
 * @typedef {import('../helpers/flow-stages/flow-stage').Prepayment} Prepayment
 */

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
 *   prepayment?: Prepayment | null | undefined,
 *   orderProposalVersion: string | null,
 *   brokerRole: string | null,
 * }} BReqTemplateData
 */

/**
 * Some templates are meaningless if `payment` is unavailable.
 * This assertion can therefore provide a helpful error for if a test criteria and
 * B request template don't match up.
 *
 * @param {BReqTemplateRef} templateName
 * @param {BReqTemplateData} data
 */
function assertPaymentIsAvailable(templateName, data) {
  if (!isPaymentAvailable(data)) {
    throw new Error(`${templateName} B request incorrectly used for an Order for which prepayment is optional. Consider using another B request template or a different OpportunityCriteria`);
  }
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
  if (isPaymentAvailable(data)) {
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
      '@id': `${data.sellerId}`,
    },
    customer: {
      '@type': 'Person',
      email: 'geoffcapesStageB@example.com',
      telephone: '020 811 8003',
      givenName: 'GeoffB',
      familyName: 'CapesB',
      identifier: 'CustomerIdentifierB',
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
 * Template for a paid opportunity for which prepayment is being made. This _should_
 * only be used for paid opportunities with prepayment=Required|Optional, but could
 * also be used to purposely fail tests for which prepayment is Unavailable.
 *
 * @param {BReqTemplateData} data
 */
function createPaidWithPaymentBReq(data) {
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
 * Adaptable template for a paid opportunity. `totalPaymentDue` is always set, but
 * `payment` will be set depending on `prepayment`
 *
 * @param {BReqTemplateData} data
 */
function createStandardPaidBReq(data) {
  const reqWithoutPayment = {
    ...createNonPaymentRelatedCoreBReq(data),
    totalPaymentDue: {
      '@type': 'PriceSpecification',
      price: data.totalPaymentDue,
      priceCurrency: 'GBP',
    },
  };
  if (isPaymentAvailable(data)) {
    return {
      ...reqWithoutPayment,
      payment: createPaymentPart(),
    };
  }
  return reqWithoutPayment;
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
  if (isPaidOpportunity(data)) {
    return createStandardPaidBReq(data);
  }
  return createStandardFreeBReq(data);
}

/**
 * Flexible B request - but with missing customer.email
 *
 * @param {BReqTemplateData} data
 */
function createNoCustomerEmailBReq(data) {
  const req = createStandardFreeOrPaidBReq(data);
  return dissocPath(['customer', 'email'], req);
}

/**
 * Flexible B request - but with missing broker.name
 *
 * @param {BReqTemplateData} data
 */
function createNoBrokerNameBReq(data) {
  const req = createStandardFreeOrPaidBReq(data);
  return dissocPath(['broker', 'name'], req);
}

/**
 * Flexible B request - but with missing broker
 *
 * @param {BReqTemplateData} data
 */
function createNoBrokerBReq(data) {
  const req = createStandardFreeOrPaidBReq(data);
  return dissocPath(['broker'], req);
}

/**
 * Flexible B request - but with missing broker & customer
 *
 * @param {BReqTemplateData} data
 */
function createBReqWithoutCustomerAndBroker(data) {
  const req = createStandardFreeOrPaidBReq(data);
  return omit(['broker', 'customer'], req);
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
 * B request where the `payment` property is omitted. This may be used when prepayment
 * is not required, for free items or in order to provoke an error when a prepayment
 * is expected.
 *
 * @param {BReqTemplateData} data
 */
function createNoPaymentBReq(data) {
  const req = createStandardPaidBReq(data);
  return dissocPath(['payment'], req);
}

/**
 * Paid B request with payment property. This is named "incorrect" as it is intended
 * to be used for a test in which the `payment` property is unnecessary (e.g.
 * prepayment=Unavailable).
 */
const createIncorrectOrderDueToUnnecessaryPaymentProperty = createPaidWithPaymentBReq;

/**
 * Paid B request with payment property - though `payment.identifier` is missing.
 *
 * Note that the purpose of this template is to test using invalid `payment` data
 * when `payment` is required. This template therefore asserts that `payment` should
 * be required.
 *
 * @param {BReqTemplateData} data
 */
function createIncorrectOrderDueToMissingIdentifierInPaymentProperty(data) {
  assertPaymentIsAvailable('incorrectOrderDueToMissingIdentifierInPaymentProperty', data);
  const req = createPaidWithPaymentBReq(data);
  return dissocPath(['payment', 'identifier'], req);
}

/**
 * Flexible B request - but with missing customer.
 *
 * @param {BReqTemplateData} data
 */
function createBReqWithoutCustomer(data) {
  const req = createStandardFreeOrPaidBReq(data);
  return dissocPath(['customer'], req);
}

function createBReqWithBusinessCustomer(data) {
  const req = createStandardPaidBReq(data);
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
 * Paid B request with payment property - though reconciliation fields in `payment`
 * are missing.
 *
 * Note that the purpose of this template is to test using invalid `payment` data
 * when `payment` is required. This template therefore asserts that `payment` should
 * be required.
 *
 * @param {BReqTemplateData} data
 */
function createMissingPaymentReconciliationDetailsBReq(data) {
  assertPaymentIsAvailable('missingPaymentReconciliationDetails', data);
  const req = createPaidWithPaymentBReq(data);
  return {
    ...req,
    payment: omit(['accountId', 'name', 'paymentProviderId'], req.payment),
  };
}

/**
 * Paid B request with payment property - though reconciliation fields in `payment`
 * are incorrect.
 *
 * Note that the purpose of this template is to test using invalid `payment` data
 * when `payment` is required. This template therefore asserts that `payment` should
 * be required.
 *
 * @param {BReqTemplateData} data
 */
function createIncorrectReconciliationDetails(data) {
  assertPaymentIsAvailable('missingPaymentReconciliationDetails', data);
  const req = createPaidWithPaymentBReq(data);
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
 * Template functions are put into this object so that the function can be
 * referred to by its key e.g. `standardFree`
 */
const bReqTemplates = {
  standardFree: createStandardFreeBReq,
  standardPaid: createStandardPaidBReq,
  standard: createStandardFreeOrPaidBReq,
  paidWithPayment: createPaidWithPaymentBReq,
  noCustomerEmail: createNoCustomerEmailBReq,
  noBrokerName: createNoBrokerNameBReq,
  noBroker: createNoBrokerBReq,
  noCustomerAndNoBroker: createBReqWithoutCustomerAndBroker,
  incorrectTotalPaymentDuePrice: createIncorrectTotalPaymentDuePriceBReq,
  noPayment: createNoPaymentBReq,
  incorrectOrderDueToUnnecessaryPaymentProperty: createIncorrectOrderDueToUnnecessaryPaymentProperty,
  incorrectOrderDueToMissingIdentifierInPaymentProperty: createIncorrectOrderDueToMissingIdentifierInPaymentProperty,
  noCustomer: createBReqWithoutCustomer,
  missingPaymentReconciliationDetails: createMissingPaymentReconciliationDetailsBReq,
  incorrectReconciliationDetails: createIncorrectReconciliationDetails,
  businessCustomer: createBReqWithBusinessCustomer,
};

/**
 * @typedef {keyof typeof bReqTemplates} BReqTemplateRef Reference to a particular B Request template
 */

module.exports = {
  bReqTemplates,
};
