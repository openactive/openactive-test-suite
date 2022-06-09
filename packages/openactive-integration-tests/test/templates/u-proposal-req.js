/**
 *
 * @param {string} [orderProposalStatus]
 */
function createStandardUProposalReq(orderProposalStatus = 'https://openactive.io/CustomerRejected') {
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
  return createStandardUProposalReq('https://openactive.io/OrderItemConfirmed');
}

/**
 */
function createUProposalReqWithExcessiveProperties() {
  return {
    ...createStandardUProposalReq(),
    '@id': 'excessiveField',
  };
}

const uProposalReqTemplates = {
  standard: createStandardUProposalReq,
  nonCustomerRejectedOrderItemStatus: createNonCustomerRejectedOrderItemStatus,
  excessiveProperties: createUProposalReqWithExcessiveProperties,
};

/**
 * @typedef {keyof typeof uProposalReqTemplates} UProposalReqTemplateRef Reference to a particular U Proposal Request template
 */

module.exports = {
  uProposalReqTemplates,
};
