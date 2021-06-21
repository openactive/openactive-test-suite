export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellableOutsideWindow
 */
export const TestOpportunityBookableCancellableOutsideWindow: import("../types/Criteria").Criteria;
