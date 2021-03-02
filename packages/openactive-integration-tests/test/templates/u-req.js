const { BOOKING_API_BASE } = global;

/**
 * @typedef {{
 *    _uuid: string,
  *   orderItemIdArray: string[]
  * }} UReqTemplateData
  */

/**
 *
 * @param {UReqTemplateData} data
 */
function createStandardUReq(data) {
  let req = {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    orderedItem: [],
  };
  for (const orderItemId of data.orderItemIdArray) {
    req.orderedItem.push({
      '@type': 'OrderItem',
      '@id': `${orderItemId}`,
      orderItemStatus: 'https://openactive.io/CustomerCancelled',
    })
  }

  return req;
  
}

/**
 * @param {UReqTemplateData} data
 */
function createNonExistantOrderUReq(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    orderedItem: [
      {
        '@type': 'OrderItem',
        '@id': `${BOOKING_API_BASE}/orders/${data._uuid}#/orderedItems/1`, // non existant OrderItem on non existant Order
        orderItemStatus: 'https://openactive.io/CustomerCancelled',
      },
    ],
  };
}

/**
 * @param {UReqTemplateData} data
 */
function createnonCustomerCancelledOrderItemStatus(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    orderedItem: [
      {
        '@type': 'OrderItem',
        '@id': `${BOOKING_API_BASE}/orders/${data._uuid}#/orderedItems/1`, // non existant OrderItem on non existant Order
        orderItemStatus: 'https://openactive.io/OrderItemConfirmed',
      },
    ],
  };
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
  nonExistantOrder: createNonExistantOrderUReq,
  nonCustomerCancelledOrderItemStatus: createnonCustomerCancelledOrderItemStatus,
  excessiveProperties: createUReqWithExcessiveProperties,
};

/**
 * @typedef {keyof typeof uReqTemplates} UReqTemplateRef Reference to a particular U Request template
 */

module.exports = {
  uReqTemplates,
};
