export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellable
 */
export const TestOpportunityBookableCancellable: import("../types/Criteria").Criteria;
