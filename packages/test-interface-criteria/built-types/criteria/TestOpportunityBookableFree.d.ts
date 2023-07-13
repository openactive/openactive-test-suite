export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFree
 */
export const TestOpportunityBookableFree: import("../types/Criteria").Criteria;
export const onlyFreeBookableOffersWithUnavailablePrepaymentOfferConstraint: [string, import("../types/Criteria").OfferConstraint];
