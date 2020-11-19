export type Criteria = {
    name: string;
    opportunityConstraints: [string, import("../../types/Criteria").OpportunityConstraint][];
    offerConstraints: [string, import("../../types/Criteria").OfferConstraint][];
    testDataRequirements: import("../../types/Criteria").TestDataRequirementsFactory;
};
export type OpportunityConstraint = (opportunity: import("../../types/Opportunity").Opportunity, options?: import("../../types/Options").Options) => boolean;
/**
 * Useful base filters for future opportunities
 */
export const InternalCriteriaFutureScheduledOpportunity: import("../../types/Criteria").Criteria;
