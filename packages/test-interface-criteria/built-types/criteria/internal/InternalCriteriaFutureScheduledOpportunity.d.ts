export type Criteria = {
    name: string;
    opportunityConstraints: [string, import("../../types/Criteria").OpportunityConstraint][];
    offerConstraints: [string, import("../../types/Criteria").OfferConstraint][];
};
export type OpportunityConstraint = (opportunity: import("../../types/Opportunity").Opportunity) => boolean;
/**
 * Useful base filters for future opportunities
 */
export const InternalCriteriaFutureScheduledOpportunity: import("../../types/Criteria").Criteria;
