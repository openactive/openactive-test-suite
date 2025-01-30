/**
 * @param {string} [orderProposalStatus]
 */
function createStandardRejectOrderProposalReq(orderProposalStatus = 'https://openactive.io/CustomerRejected') {
  const req = {
    '@context': 'https://openactive.io/',
    '@type': 'OrderProposal',
    orderProposalStatus,
    orderCustomerNote: "Sorry I've actually made other plans, hope you find someone!",
  };

  return req;
}

/**
 */
function createNonCustomerRejectedOrderItemStatus() {
  return createStandardRejectOrderProposalReq('https://openactive.io/OrderItemConfirmed');
}

/**
 */
function createRejectOrderProposalReqWithExcessiveProperties() {
  return {
    ...createStandardRejectOrderProposalReq(),
    '@id': 'excessiveField',
  };
}

const rejectOrderProposalReqTemplates = {
  standard: createStandardRejectOrderProposalReq,
  nonCustomerRejectedOrderItemStatus: createNonCustomerRejectedOrderItemStatus,
  excessiveProperties: createRejectOrderProposalReqWithExcessiveProperties,
};

/**
 * @typedef {keyof typeof rejectOrderProposalReqTemplates} RejectOrderProposalReqTemplateRef Reference to a particular Reject Order Proposal Request template
 */

module.exports = {
  rejectOrderProposalReqTemplates,
};
