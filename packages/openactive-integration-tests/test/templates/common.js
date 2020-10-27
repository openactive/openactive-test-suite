const config = require('config');

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

module.exports = { createPaymentPart };
