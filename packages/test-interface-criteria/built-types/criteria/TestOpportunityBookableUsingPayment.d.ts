export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableUsingPayment
 */
export const TestOpportunityBookableUsingPayment: import("../types/Criteria").Criteria;
