/**
 * @typedef {{
 *    _uuid: string,
  *   orderItemIdArray: string[]
  * }} UReqTemplateData
  */

/**
 *
 * @param {UReqTemplateData} data
 * @param {string} [orderItemStatus]
 */
function createStandardUReq(data, orderItemStatus = 'https://openactive.io/CustomerCancelled') {
  const req = {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    orderedItem: [],
  };
  for (const orderItemId of data.orderItemIdArray) {
    req.orderedItem.push({
      '@type': 'OrderItem',
      '@id': `${orderItemId}`,
      orderItemStatus,
    });
  }

  return req;
}

/**
 * @param {UReqTemplateData} data
 */
function createNonCustomerCancelledOrderItemStatus(data) {
  return createStandardUReq(data, 'https://openactive.io/OrderItemConfirmed');
}

/**
 * @param {UReqTemplateData} data
 */
function createUReqWithExcessiveProperties(data) {
  return {
    ...createStandardUReq(data),
    '@id': 'excessiveField',
  };
}

const uReqTemplates = {
  standard: createStandardUReq,
  nonCustomerCancelledOrderItemStatus: createNonCustomerCancelledOrderItemStatus,
  excessiveProperties: createUReqWithExcessiveProperties,
};

/**
 * @typedef {keyof typeof uReqTemplates} UReqTemplateRef Reference to a particular U Request template
 */

module.exports = {
  uReqTemplates,
};
