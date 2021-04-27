const { isNil } = require('lodash');

/**
 * @typedef {import('../helpers/flow-stages/fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../helpers/flow-stages/flow-stage').Prepayment} Prepayment
 * @typedef {import('../helpers/flow-stages/flow-stage').OrderItemIntakeForm} OrderItemIntakeForm
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
 * @param {{ totalPaymentDue: number, openBookingPrepayment?: Prepayment | null | undefined }} data
 * @returns {boolean}
 */
function isPaymentAvailable(data) {
  return isPaidOpportunity(data) && data.openBookingPrepayment !== 'https://openactive.io/Unavailable';
}

/**
 *
 * @param {OrderItemIntakeForm} orderIntakeForm
 * @param {boolean} isResponseValid If false, invalid responses will be created (eg string responses to BooleanForms)
 */
function createOrderIntakeFormResponse(orderIntakeForm, isResponseValid) {
  if (isNil(orderIntakeForm)) {
    return null;
  }
  return orderIntakeForm.map((form) => {
    /** @type {import('../helpers/flow-stages/flow-stage').PropertyValue} */
    const propertyValue = {
      '@type': 'PropertyValue',
      propertyID: form['@id'],
      value: '',
    };
    switch (form['@type']) {
      case 'BooleanFormFieldSpecification': {
        if (!isResponseValid) {
          return {
            ...propertyValue,
            value: 'This is not a boolean!',
          };
        }
        return {
          ...propertyValue,
          value: Math.random() < 0.5,
        };
      }
      case 'DropdownFormFieldSpecification': {
        if (!isResponseValid) {
          return {
            ...propertyValue,
            value: 'This is not one of the ValueOptions!',
          };
        }
        return {
          ...propertyValue,
          value: form.valueOption[Math.floor(Math.random() * form.valueOption.length)],
        };
      }
      case 'ParagraphFormFieldSpecification':
      case 'ShortAnswerFormFieldSpecification': {
        if (!isResponseValid) {
          return {
            ...propertyValue,
            value: true, // value not being a string is the invalid response for these types
          };
        }
        return {
          ...propertyValue,
          value: 'An appropriate answer to the question asked.',
        };
      }
      default: return propertyValue;
    }
  });
}

/**
 * Adds either valid or invalid OrderItemIntakeResponse to the provided request
 *
 * @template {{position: number, orderItemIntakeFormResponse: { value: boolean|string; '@type': "PropertyValue"; propertyID: string; }[]}} TOrderedItem
 * @template {{
 *   orderedItem: TOrderedItem[],
 * }} TReq
 * @param {TReq} req
 * @param {{[k:string]: OrderItemIntakeForm}} positionOrderIntakeFormMap
 * @param {boolean} isOrderItemIntakeResponseValid
 */
function addOrderItemIntakeFormResponse(req, positionOrderIntakeFormMap, isOrderItemIntakeResponseValid = true) {
  const newReq = {
    ...req,
  };
  for (const orderItem of newReq.orderedItem) {
    if (positionOrderIntakeFormMap[orderItem.position]) {
      orderItem.orderItemIntakeFormResponse = createOrderIntakeFormResponse(positionOrderIntakeFormMap[orderItem.position], isOrderItemIntakeResponseValid);
    }
  }
  return newReq;
}

module.exports = {
  createPaymentPart,
  isPaidOpportunity,
  isPaymentAvailable,
  addOrderItemIntakeFormResponse,
};
