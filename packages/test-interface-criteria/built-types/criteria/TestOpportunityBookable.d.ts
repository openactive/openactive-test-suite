/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookable.
 *
 * Note that this differs from the above by forbidding Minimal Proposal Flow
 * offers. This means that tests written for this criteria can focus on
 * Simple Booking Flow scenarios.
 */
export const TestOpportunityBookable: import("../types/Criteria").Criteria;
