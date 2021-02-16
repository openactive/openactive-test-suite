export type Criteria = {
    name: string;
    opportunityConstraints: [string, import("../../types/Criteria").OpportunityConstraint][];
    offerConstraints: [string, import("../../types/Criteria").OfferConstraint][];
    testDataRequirements: import("../../types/Criteria").TestDataRequirementsFactory;
};
export type OpportunityConstraint = (opportunity: import("../../types/Opportunity").Opportunity, options?: import("../../types/Options").Options) => boolean;
/**
 * @typedef {import('../../types/Criteria').Criteria} Criteria
 * @typedef {import('../../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */
/**
 * Useful base filters for future opportunities
 */
export const InternalCriteriaFutureScheduledOpportunity: import("../../types/Criteria").Criteria;
