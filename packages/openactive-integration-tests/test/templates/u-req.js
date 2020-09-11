const { BOOKING_API_BASE } = global;

/**
 *
 * @param {UReqTemplateData} data
 */
function createStandardUReq(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    orderedItem: [
      {
        '@type': 'OrderItem',
        '@id': `${data.orderItemId}`,
        orderItemStatus: 'https://openactive.io/CustomerCancelled',
      },
    ],
  };
}

function createNonExistantOrderUReq(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'Order',
    orderedItem: [
      {
        '@type': 'OrderItem',
        '@id': `${BOOKING_API_BASE}orders/${data._uuid}#/orderedItems/1`, // non existant OrderItem on non existant Order
        orderItemStatus: 'https://openactive.io/CustomerCancelled',
      },
    ],
  };
}

const uReqTemplates = {
  standard: createStandardUReq,
  nonExistantOrder: createNonExistantOrderUReq,
};

/**
 * @typedef {keyof typeof uReqTemplates} UReqTemplateRef Reference to a particular U Request template
 */

module.exports = {
  uReqTemplates,
};
