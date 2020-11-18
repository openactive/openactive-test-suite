/**
 * @typedef {import('../helpers/flow-stages/flow-stage').Prepayment} Prepayment
 */

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

  const { paymentReconciliationDetails } = global.SELLER_CONFIG.primary;

  if (!paymentReconciliationDetails) {
    return payment;
  }

  if (paymentReconciliationDetails.name) {
    payment.name = paymentReconciliationDetails.name;
  }

  if (paymentReconciliationDetails.accountId) {
    payment.accountId = paymentReconciliationDetails.accountId;
  }

  if (paymentReconciliationDetails.paymentProviderId) {
    payment.paymentProviderId = paymentReconciliationDetails.paymentProviderId;
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
