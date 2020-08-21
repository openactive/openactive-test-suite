export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaid
 */
export const TestOpportunityBookablePaid: import("../types/Criteria").Criteria;
