export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFree
 */
export const TestOpportunityBookableFree: import("../types/Criteria").Criteria;
