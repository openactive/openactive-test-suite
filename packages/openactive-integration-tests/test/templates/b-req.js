/* TODO many of the templates in this file are used by just one test It may be
worth, therefore, having the templates defined in the test where they are used.
This would reduce the chance of issues as the template definition is often
heavily coupled with the test (e.g. it only works if a certain criteria) is
used.
If all the templates are stored in this file, it would be tempting to use an
existing one for a new test where it may give false positives as it uses the
wrong opportunity criteria.
Alternatively, could we have it so that the template only works for some
criteria..? */
const { dissocPath, omit } = require('ramda');
const shortid = require('shortid');
const { createPaymentPart, isPaidOpportunity, isPaymentAvailable, addOrderItemIntakeFormResponse } = require('./common');

/**
 * @typedef {import('../helpers/flow-stages/flow-stage').Prepayment} Prepayment
 */

/**
 * @typedef {{
 *   '@type': 'ImageObject' | 'Barcode',
 *   url?: string,
 *   text?: string,
 * }} AccessPassItem
 *
 * @typedef {{
 *   orderType: 'Order' | 'OrderProposal',
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
 *   totalPaymentDue: number,
 *   openBookingPrepayment?: Prepayment | null | undefined,
 *   orderProposalVersion?: string | null,
 *   accessPass?: AccessPassItem[],
 *   brokerRole?: string | null,
 *   positionOrderIntakeFormMap: {[k:string]: import('../helpers/flow-stages/flow-stage').OrderItemIntakeForm},
 *   customer: import('../helpers/flow-stages/flow-stage-utils').Customer,
 *   paymentIdentifier?: string
 * }} BReqTemplateData
 *
 * @typedef {Omit<BReqTemplateData, 'orderProposalVersion'>} PReqTemplateData P accepts the same sort of requests as B.
 *   Except for `orderProposalVersion` which is only for a "B after P" request.
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
    throw new Error(`${templateName} B request incorrectly used for an Order for which openBookingPrepayment is unavailable. Consider using another B request template or a different OpportunityCriteria`);
  }
}

/**
 * Some templates are meaningless if `payment` is available.
 * This assertion can therefore provide a helpful error for if a test criteria and
 * B request template don't match up.
 *
 * @param {BReqTemplateRef} templateName
 * @param {BReqTemplateData} data
 */
function assertPaymentIsUnvailable(templateName, data) {
  if (isPaymentAvailable(data)) {
    throw new Error(`${templateName} B request incorrectly used for an Order for which openBookingPrepayment is optional/available. Consider using another B request template or a different OpportunityCriteria`);
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
    '@type': 'Order', // This can never be an OrderProposal
    orderProposalVersion: data.orderProposalVersion,
  };
  if (isPaymentAvailable(data)) {
    result.payment = createPaymentPart(data.paymentIdentifier);
  }
  return result;
}

/**
 * Create a B request, excluding the payment related details
 *
 * @param {BReqTemplateData} data
 * @returns {BReq}
 */
function createNonPaymentRelatedCoreBReq(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': data.orderType,
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
    orderedItem: data.orderItems.map((orderItem) => {
      const result = {
        '@type': 'OrderItem',
        position: orderItem.position,
        acceptedOffer: `${orderItem.acceptedOffer['@id']}`,
        orderedItem: `${orderItem.orderedItem['@id']}`,
        attendee: undefined,
        orderItemIntakeForm: undefined,
        orderItemIntakeFormResponse: undefined,
      };
      if (data.accessPass) {
        result.accessPass = data.accessPass;
      }
      return result;
    }),
  };
}

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
  *   customer: import('../helpers/flow-stages/flow-stage-utils').Customer,
  *   orderedItem: {
  *     '@type': string,
  *     position: number,
  *     acceptedOffer: string,
  *     orderedItem: string,
 *      attendee?: {
 *        '@type': 'Person'
 *        telephone: string,
 *        givenName: string,
 *        familyName: string,
 *        email: string,
 *      },
  *   }[],
  *   totalPaymentDue?: {
  *     '@type': 'PriceSpecification';
  *     price: number;
  *     priceCurrency: string;
  *   };
  *   payment?: import('./common').Payment;
  * }} BReq
  */

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
 * only be used for paid opportunities with openBookingPrepayment=Required|Optional, but could
 * also be used to purposely fail tests for which openBookingPrepayment is Unavailable.
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
    payment: createPaymentPart(data.paymentIdentifier),
  };
}

/**
 * Adaptable template for a paid opportunity. `totalPaymentDue` is always set, but
 * `payment` will be set depending on `openBookingPrepayment`
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
      payment: createPaymentPart(data.paymentIdentifier),
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
 *
 * @param {BReqTemplateData} data
 */
function createIncorrectOrderDueToUnnecessaryPaymentProperty(data) {
  assertPaymentIsUnvailable('incorrectOrderDueToUnnecessaryPaymentProperty', data);
  return createPaidWithPaymentBReq(data);
}

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
 * Paid B request with unnecessary payment property - though `payment.identifier` is missing.
 *
 * This template differs from createIncorrectOrderDueToMissingIdentifierInPaymentProperty
 * because it is for tests in which `payment` is supposed to be unavailable.
 * It will therefore assert that `prepayment` is unavailable
 *
 * @param {BReqTemplateData} data
 */
function createIncorrectOrderDueToUnnecessaryPaymentThoughPaymentIdentifierIsMissing(data) {
  assertPaymentIsUnvailable('incorrectOrderDueToUnnecessaryPaymentThoughPaymentIdentifierIsMissing', data);
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
 * B request with payment property - though reconciliation fields in `payment`
 * are missing.
 *
 * Note that the purpose of this template is to test using missing `payment` data
 * when `payment` is required.
 *
 * @param {BReqTemplateData} data
 */
function createMissingPaymentReconciliationDetailsBReq(data) {
  const req = createStandardPaidBReq(data);
  return {
    ...req,
    // @ts-ignore
    payment: omit(['accountId', 'name', 'paymentProviderId'], req.payment),
  };
}

/**
 * B request with payment property - though reconciliation fields in `payment`
 * are incorrect.
 *
 * Note that the purpose of this template is to test using invalid `payment` data
 * when `payment` is required.
 *
 * @param {BReqTemplateData} data
 */
function createIncorrectReconciliationDetails(data) {
  const req = createStandardPaidBReq(data);
  if (req.payment?.accountId) {
    req.payment.accountId = `invalid-${shortid.generate()}`;
  }
  if (req.payment?.name) {
    req.payment.name = `invalid-${shortid.generate()}`;
  }
  if (req.payment?.paymentProviderId) {
    req.payment.paymentProviderId = `invalid-${shortid.generate()}`;
  }
  return req;
}

/**
 * Flexible B request - but with missing OrderItem.OrderedItem for primary OrderItems
 *
 * @param {BReqTemplateData} data
 */
function createStandardBWithoutOrderedItem(data) {
  if (!data.orderProposalVersion) {
    const req = isPaidOpportunity(data) ? createStandardPaidBReq(data) : createStandardFreeBReq(data);
    if (req.orderedItem) {
      req.orderedItem.forEach((orderedItem) => {
        if (!data.orderItems.find(x => x.position === orderedItem.position)['test:control']) {
          const ret = orderedItem;
          delete ret.orderedItem;
        }
      });
    }
    return req;
  }

  return null;
}

/**
 * Flexible B request - but with missing OrderItem.AcceptedOffer for primary OrderItems
 *
 * @param {BReqTemplateData} data
 */
function createStandardBWithoutAcceptedOffer(data) {
  if (!data.orderProposalVersion) {
    const req = isPaidOpportunity(data) ? createStandardPaidBReq(data) : createStandardFreeBReq(data);
    if (req.orderedItem) {
      req.orderedItem.forEach((orderedItem) => {
        if (!data.orderItems.find(x => x.position === orderedItem.position)['test:control']) {
          const ret = orderedItem;
          delete ret.acceptedOffer;
        }
      });
    }
    return req;
  }

  return null;
}

/**
 * B request with attendee details
 *
 * @param {BReqTemplateData} data
 */
function createAttendeeDetails(data) {
  const req = createStandardPaidBReq(data);
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
 * B request with additional details supplied
 *
 * @param {BReqTemplateData} data
 */
function createAdditionalDetailsSuppliedBReq(data) {
  const req = createStandardPaidBReq(data);
  const isOrderIntakeResponseValid = true;
  return addOrderItemIntakeFormResponse(req, data.positionOrderIntakeFormMap, isOrderIntakeResponseValid);
}

/**
 * B request with additional details required but invalidly supplied.
 * The invalid details supplied are dynamically created depending on the type of additional
 * details required (ShortAnswer, Paragraph, Dropdown, or Boolean)
 *
 * @param {BReqTemplateData} data
 */
function createAdditionalDetailsRequiredInvalidSuppliedBReq(data) {
  const req = createStandardPaidBReq(data);
  const isOrderIntakeResponseValid = false;
  return addOrderItemIntakeFormResponse(req, data.positionOrderIntakeFormMap, isOrderIntakeResponseValid);
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
  afterP: createAfterPBReq,
  noCustomerEmail: createNoCustomerEmailBReq,
  noBrokerName: createNoBrokerNameBReq,
  noBroker: createNoBrokerBReq,
  noCustomerAndNoBroker: createBReqWithoutCustomerAndBroker,
  incorrectTotalPaymentDuePrice: createIncorrectTotalPaymentDuePriceBReq,
  noPayment: createNoPaymentBReq,
  incorrectOrderDueToUnnecessaryPaymentProperty: createIncorrectOrderDueToUnnecessaryPaymentProperty,
  incorrectOrderDueToMissingIdentifierInPaymentProperty: createIncorrectOrderDueToMissingIdentifierInPaymentProperty,
  incorrectOrderDueToUnnecessaryPaymentThoughPaymentIdentifierIsMissing: createIncorrectOrderDueToUnnecessaryPaymentThoughPaymentIdentifierIsMissing,
  noCustomer: createBReqWithoutCustomer,
  businessCustomer: createBReqWithBusinessCustomer,
  missingPaymentReconciliationDetails: createMissingPaymentReconciliationDetailsBReq,
  incorrectReconciliationDetails: createIncorrectReconciliationDetails,
  noOrderedItem: createStandardBWithoutOrderedItem,
  noAcceptedOffer: createStandardBWithoutAcceptedOffer,
  attendeeDetails: createAttendeeDetails,
  additionalDetailsSupplied: createAdditionalDetailsSuppliedBReq,
  additionalDetailsRequiredInvalidSupplied: createAdditionalDetailsRequiredInvalidSuppliedBReq,
};

/**
 * @typedef {keyof typeof bReqTemplates} BReqTemplateRef Reference to a particular B Request template
 * @typedef {keyof Omit<typeof bReqTemplates, 'afterP'>} PReqTemplateRef P accepts the same sort of requests as B.
 *   Except for the "B after P" request.
 */

module.exports = {
  bReqTemplates,
};
