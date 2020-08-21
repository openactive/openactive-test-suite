export type OpportunityConstraint = (opportunity: import("../types/Opportunity").Opportunity) => boolean;
/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNoSpaces
 */
export const TestOpportunityBookableNoSpaces: import("../types/Criteria").Criteria;
