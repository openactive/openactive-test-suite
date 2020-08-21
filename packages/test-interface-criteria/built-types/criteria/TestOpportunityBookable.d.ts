export type OpportunityConstraint = (opportunity: import("../types/Opportunity").Opportunity) => boolean;
export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookable
 */
export const TestOpportunityBookable: import("../types/Criteria").Criteria;
