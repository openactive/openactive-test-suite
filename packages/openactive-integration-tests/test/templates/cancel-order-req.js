/**
 * @typedef {{
 *    _uuid: string,
  *   orderItemIdArray: string[]
  * }} CancelOrderReqTemplateData
  */

/**
 *
 * @param {CancelOrderReqTemplateData} data
 * @param {string} [orderItemStatus]
 */
function createStandardCancelOrderReq(data, orderItemStatus = 'https://openactive.io/CustomerCancelled') {
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
 * @param {CancelOrderReqTemplateData} data
 */
function createNonCustomerCancelledOrderItemStatus(data) {
  return createStandardCancelOrderReq(data, 'https://openactive.io/OrderItemConfirmed');
}

/**
 * @param {CancelOrderReqTemplateData} data
 */
function createCancelOrderReqWithExcessiveProperties(data) {
  return {
    ...createStandardCancelOrderReq(data),
    '@id': 'excessiveField',
  };
}

const cancelOrderReqTemplates = {
  standard: createStandardCancelOrderReq,
  nonCustomerCancelledOrderItemStatus: createNonCustomerCancelledOrderItemStatus,
  excessiveProperties: createCancelOrderReqWithExcessiveProperties,
};

/**
 * @typedef {keyof typeof cancelOrderReqTemplates} CancelOrderReqTemplateRef Reference to a particular U Request template
 */

module.exports = {
  cancelOrderReqTemplates,
};
