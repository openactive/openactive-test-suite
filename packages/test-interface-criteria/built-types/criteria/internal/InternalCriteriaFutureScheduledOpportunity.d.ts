export type Criteria = import('../../types/Criteria').Criteria;
export type OpportunityConstraint = import('../../types/Criteria').OpportunityConstraint;
/**
 * Useful base constraints for future opportunities.
 *
 * This shouldn't be used for any tests, as it is not an [official criteria](https://openactive.io/test-interface/).
 * It's just a useful basis for other criteria to include constraints from.
 */
export const InternalCriteriaFutureScheduledOpportunity: import("../../types/Criteria").Criteria;
