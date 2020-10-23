const config = require('config');

const PAYMENT_RECONCEILIATION_DETAILS = config.get('sellers').primary.paymentReconciliationDetails;

function createPaymentPart(includeIdentifier = true) {
  const payment = { '@type': 'Payment' };
  if (includeIdentifier) {
    payment.identifier = '1234567890npduy2f';
  }

  if (!PAYMENT_RECONCEILIATION_DETAILS) {
    return payment;
  }

  if (PAYMENT_RECONCEILIATION_DETAILS.name) {
    payment.name = PAYMENT_RECONCEILIATION_DETAILS.name;
  }

  if (PAYMENT_RECONCEILIATION_DETAILS.accountId) {
    payment.accountId = PAYMENT_RECONCEILIATION_DETAILS.accountId;
  }

  if (PAYMENT_RECONCEILIATION_DETAILS.paymentProviderId) {
    payment.paymentProviderId = PAYMENT_RECONCEILIATION_DETAILS.paymentProviderId;
  }

  return payment;
}

module.exports = { createPaymentPart };
