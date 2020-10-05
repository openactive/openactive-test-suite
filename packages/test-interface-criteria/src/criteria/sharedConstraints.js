/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/** @type {OfferConstraint} */
function supportsMinimalProposalFlow(offer) {
  return Array.isArray(offer.openBookingFlowRequirement)
    && offer.openBookingFlowRequirement.includes('https://openactive.io/OpenBookingApproval')
    && offer.openBookingFlowRequirement.length === 1;
}

module.exports = {
  supportsMinimalProposalFlow,
};
