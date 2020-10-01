export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity) => boolean;
/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */
/** @type {OfferConstraint} */
export function supportsMinimalProposalFlow(offer: import("../types/Offer").Offer): boolean;
