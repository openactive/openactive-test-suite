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

/**
 * Additional details required, but not supplied
 */
function additionalDetailsRequiredNotSupplied(req) {
  req.orderedItem.forEach((o) => {
    // eslint-disable-next-line no-param-reassign
    o.orderItemIntakeForm = [
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

    ];
  });
  return req;
}

/**
 * Additional details required and supplied
 */
function additionalDetailsRequiredAndSupplied(req) {
  // eslint-disable-next-line no-param-reassign
  req = additionalDetailsRequiredNotSupplied(req);
  req.orderedItem.forEach((o) => {
    // eslint-disable-next-line no-param-reassign
    o.orderItemIntakeFormResponse = [
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
    ];
  });
  return req;
}

/**
 * Additional details required, invalid boolean supplied
 */
function additionalDetailsRequiredInvalidBooleanSupplied(req) {
  // eslint-disable-next-line no-param-reassign
  req = additionalDetailsRequiredAndSupplied(req);

  const photoConsent = req.orderedItem.flatMap(o => o.orderItemIntakeFormResponse).filter(r => r.propertyID === 'https://example.com/photoconsent')[0];
  // eslint-disable-next-line no-param-reassign
  photoConsent.value = 'yes';

  return req;
}

/**
 * Additional details required, invalid dropdown supplied
 */
function additionalDetailsRequiredInvalidDropdownSupplied(req) {
  // eslint-disable-next-line no-param-reassign
  req = additionalDetailsRequiredAndSupplied(req);

  const photoConsent = req.orderedItem.flatMap(o => o.orderItemIntakeFormResponse).filter(r => r.propertyID === 'https://example.com/age')[0];
  // eslint-disable-next-line no-param-reassign
  photoConsent.value = '65+';

  return req;
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
