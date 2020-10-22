export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentOptional
 */
export const TestOpportunityBookablePaidPrepaymentOptional: import("../types/Criteria").Criteria;
