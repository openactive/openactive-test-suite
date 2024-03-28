/**
 * Note that this criteria will ALWAYS reject any event whose latestCancellationBeforeStartDate
 * duration is less than 2 hours. This is because this will conflict with the
 * `startDateMustBe2HrsInAdvance` constraint (from `InternalCriteriaFutureScheduledOpportunity`).
 *
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellableWithinWindow
 */
export const TestOpportunityBookableCancellableWithinWindow: import("../types/Criteria").Criteria;
