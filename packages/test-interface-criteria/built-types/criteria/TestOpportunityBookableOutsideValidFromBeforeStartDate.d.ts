export type OpportunityConstraint = (opportunity: import("../types/Opportunity").Opportunity) => boolean;
export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity) => boolean;
export const TestOpportunityBookableOutsideValidFromBeforeStartDate: import("../types/Criteria").Criteria;
