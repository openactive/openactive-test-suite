export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellable
 */
export const TestOpportunityBookableCancellable: import("../types/Criteria").Criteria;
export const mustBeWithinCancellationWindowOrHaveNoWindowOfferConstraint: [string, import("../types/Criteria").OfferConstraint];
