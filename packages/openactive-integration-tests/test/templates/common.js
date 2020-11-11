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

module.exports = {
  createPaymentPart,
  isPaidOpportunity,
  isPaymentAvailable,
};
