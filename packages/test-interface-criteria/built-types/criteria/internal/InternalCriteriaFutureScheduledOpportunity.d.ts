export type Criteria = {
    name: string;
    opportunityConstraints: [string, import("../../types/Criteria").OpportunityConstraint][];
    offerConstraints: [string, import("../../types/Criteria").OfferConstraint][];
    testDataShape: import("../../types/Criteria").TestDataShapeFactory;
};
export type OpportunityConstraint = (opportunity: import("../../types/Opportunity").Opportunity, options?: import("../../types/Options").Options) => boolean;
/**
 * Useful base filters for future opportunities.
 *
 * This shouldn't be used for any tests, as it is not an [official criteria](https://openactive.io/test-interface/).
 * It's just a useful basis for other criteria to include constraints from.
 */
export const InternalCriteriaFutureScheduledOpportunity: import("../../types/Criteria").Criteria;
