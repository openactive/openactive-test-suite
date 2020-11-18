const config = require('config');

/**
 * @typedef {import('../helpers/flow-stages/flow-stage').Prepayment} Prepayment
 */

const PAYMENT_RECONCILIATION_DETAILS = config.get('sellers').primary.paymentReconciliationDetails;

/**
 * @typedef {{
 *   '@type': 'Payment',
 *   identifier?: string,
 *   name?: string,
 *   accountId?: string,
 *   paymentProviderId?: string,
 * }} Payment
 */

/**
 * @param {boolean} [includeIdentifier]
 * @returns {Payment}
 */
function createPaymentPart(includeIdentifier = true) {
  /** @type {Payment} */
  const payment = { '@type': 'Payment' };
  if (includeIdentifier) {
    payment.identifier = '1234567890npduy2f';
  }

  if (!PAYMENT_RECONCILIATION_DETAILS) {
    return payment;
  }

  if (PAYMENT_RECONCILIATION_DETAILS.name) {
    payment.name = PAYMENT_RECONCILIATION_DETAILS.name;
  }

  if (PAYMENT_RECONCILIATION_DETAILS.accountId) {
    payment.accountId = PAYMENT_RECONCILIATION_DETAILS.accountId;
  }

  if (PAYMENT_RECONCILIATION_DETAILS.paymentProviderId) {
    payment.paymentProviderId = PAYMENT_RECONCILIATION_DETAILS.paymentProviderId;
  }

  return payment;
}

/**
 * @param {{ totalPaymentDue: number }} data
 * @returns {boolean}
 */
function isPaidOpportunity(data) {
  return data.totalPaymentDue > 0;
}

/**
 * Is `payment` property needed for B/P request?
 *
 * @param {{ totalPaymentDue: number, prepayment?: Prepayment | null | undefined }} data
 * @returns {boolean}
 */
function isPaymentAvailable(data) {
  return isPaidOpportunity(data) && data.prepayment !== 'https://openactive.io/Unavailable';
}

//  * @template {{
//  *   orderedItem: {}[],
//  * }} TReq
/**
 * Additional details required, but not supplied
 *
 * @template {{}} TOrderedItem
 * @template {{
 *   orderedItem: TOrderedItem[],
 * }} TReq
 * @param {TReq} req
 */
function additionalDetailsRequiredNotSupplied(req) {
  return {
    ...req,
    orderedItem: req.orderedItem.map((orderItem) => ({
      ...orderItem,
      orderItemIntakeForm: [
        {
          '@type': 'ShortAnswerFormSpecification',
          '@id': 'https://example.com/experience',
          name: 'Level of experience',
          description: 'Have you played before? Are you a complete beginner or seasoned pro?',
          valueRequired: true,
        },
        {
          '@type': 'DropdownFormFieldSpecification',
          '@id': 'https://example.com/age',
          name: 'Age',
          description: 'Your age is useful for us to place you in the correct group on the day',
          valueOption: ['0-18', '18-30', '30+'],
          valueRequired: true,
        },
        {
          '@type': 'DropdownFormFieldSpecification',
          '@id': 'https://example.com/gender',
          name: 'Gender',
          description: 'We use this information for equality and diversity monitoring',
          valueOption: ['male', 'female', 'non-binary', 'other'],
          valueRequired: false,
        },
        {
          '@type': 'BooleanFormFieldSpecification',
          '@id': 'https://example.com/photoconsent',
          name: 'Photo Consent',
          description: 'Are you happy for us to include photos of you in our marketing materials?',
        },
      ],
    })),
  };
  // for (const orderItem of req.orderedItem) {
  //   orderItem.orderItemIntakeForm = [
  //     {
  //       '@type': 'ShortAnswerFormSpecification',
  //       '@id': 'https://example.com/experience',
  //       name: 'Level of experience',
  //       description: 'Have you played before? Are you a complete beginner or seasoned pro?',
  //       valueRequired: true,
  //     },
  //     {
  //       '@type': 'DropdownFormFieldSpecification',
  //       '@id': 'https://example.com/age',
  //       name: 'Age',
  //       description: 'Your age is useful for us to place you in the correct group on the day',
  //       valueOption: ['0-18', '18-30', '30+'],
  //       valueRequired: true,
  //     },
  //     {
  //       '@type': 'DropdownFormFieldSpecification',
  //       '@id': 'https://example.com/gender',
  //       name: 'Gender',
  //       description: 'We use this information for equality and diversity monitoring',
  //       valueOption: ['male', 'female', 'non-binary', 'other'],
  //       valueRequired: false,
  //     },
  //     {
  //       '@type': 'BooleanFormFieldSpecification',
  //       '@id': 'https://example.com/photoconsent',
  //       name: 'Photo Consent',
  //       description: 'Are you happy for us to include photos of you in our marketing materials?',
  //     },
  //   ];
  // }
  // return req;
}

/**
 * Additional details required and supplied
 *
 * @template {{}} TOrderedItem
 * @template {{
 *   orderedItem: TOrderedItem[],
 * }} TReq
 * @param {TReq} req
 */
function additionalDetailsRequiredAndSupplied(req) {
  const withOrderItemIntakeForm = additionalDetailsRequiredNotSupplied(req);
  return {
    ...withOrderItemIntakeForm,
    orderedItem: withOrderItemIntakeForm.orderedItem.map((orderItem) => ({
      ...orderItem,
      orderItemIntakeFormResponse: [
        {
          '@type': 'PropertyValue',
          propertyID: 'https://example.com/experience',
          value: 'I\'ve played twice before, but I\'m a quick learner so I hope to keep up!',
        },
        {
          '@type': 'PropertyValue',
          propertyID: 'https://example.com/age',
          value: '0-18',
        },
        {
          '@type': 'PropertyValue',
          propertyID: 'https://example.com/photoconsent',
          value: 'true',
        },
      ],
    })),
  };
}

/**
 * Additional details required, invalid boolean supplied
 *
 * @template {{
 *   propertyID: string,
 *   value: string,
 * }} TOrderItemIntakeFormResponse
 * @template {{
 *   orderItemIntakeFormResponse: TOrderItemIntakeFormResponse[],
 * }} TOrderedItem
 * @template {{
 *   orderedItem: TOrderedItem[],
 * }} TReq
 * @param {TReq} req
 */
function additionalDetailsRequiredInvalidBooleanSupplied(req) {
  const withAdditionalDetails = additionalDetailsRequiredAndSupplied(req);
  return {
    ...withAdditionalDetails,
    orderedItem: withAdditionalDetails.orderedItem.map((orderItem) => ({
      ...orderItem,
      orderItemIntakeFormResponse: orderItem.orderItemIntakeFormResponse.map((responseItem) => {
        if (responseItem.propertyID === 'https://example.com/photoconsent') {
          return {
            ...responseItem,
            value: 'yes',
          };
        }
        return responseItem;
      }),
    })),
  };
}

/**
 * Additional details required, invalid dropdown supplied
 *
 * @template {{
 *   propertyID: string,
 *   value: string,
 * }} TOrderItemIntakeFormResponse
 * @template {{
 *   orderItemIntakeFormResponse: TOrderItemIntakeFormResponse[],
 * }} TOrderedItem
 * @template {{
 *   orderedItem: TOrderedItem[],
 * }} TReq
 * @param {TReq} req
 */
function additionalDetailsRequiredInvalidDropdownSupplied(req) {
  const withAdditionalDetails = additionalDetailsRequiredAndSupplied(req);
  return {
    ...withAdditionalDetails,
    orderedItem: withAdditionalDetails.orderedItem.map((orderItem) => ({
      ...orderItem,
      orderItemIntakeFormResponse: orderItem.orderItemIntakeFormResponse.map((responseItem) => {
        if (responseItem.propertyID === 'https://example.com/age') {
          return {
            ...responseItem,
            value: '65+',
          };
        }
        return responseItem;
      }),
    })),
  };
}

module.exports = {
  createPaymentPart,
  isPaidOpportunity,
  isPaymentAvailable,
  additionalDetailsRequiredNotSupplied,
  additionalDetailsRequiredAndSupplied,
  additionalDetailsRequiredInvalidBooleanSupplied,
  additionalDetailsRequiredInvalidDropdownSupplied,
};
