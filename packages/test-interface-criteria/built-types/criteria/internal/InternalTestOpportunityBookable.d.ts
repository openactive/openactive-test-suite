export type OpportunityConstraint = (opportunity: import("../../types/Opportunity").Opportunity, options?: import("../../types/Options").Options) => boolean;
export type OfferConstraint = (offer: import("../../types/Offer").Offer, opportunity: import("../../types/Opportunity").Opportunity, options?: import("../../types/Options").Options) => boolean;
/**
 * Internal criteria which almost implements https://openactive.io/test-interface#TestOpportunityBookable
 * but handily leaves out anything related to openBookingFlowRequirement, so
 * that bookable criteria for Simple Booking Flow, Minimal Proposal Flow,
 * and Proposal Amendment flow can be generated using this
 */
export const InternalTestOpportunityBookable: import("../../types/Criteria").Criteria;
