/**
 * Check if an opportunity matches some criteria
 */
export type TestMatchResult = {
    /**
     * Does the opportunity match the criteria?
     */
    matchesCriteria: boolean;
    /**
     * Names of constraints which were
     * not met by the opportunity.
     */
    unmetCriteriaDetails: string[];
};
export type Criteria = import('./types/Criteria').Criteria;
export type Opportunity = import('./types/Opportunity').Opportunity;
export type Offer = import('./types/Offer').Offer;
export type Options = import('./types/Options').Options;
export type TestDataShape = import('./types/TestDataShape').TestDataShape;
export type TestDataShapeOpportunityConstraints = import('./types/TestDataShape').TestDataShapeOpportunityConstraints;
/**
 * Options object as supplied to the test-interface-criteria library API.
 */
export type LibOptions = {
    harvestStartTime: string;
};
import { allCriteria } from "./criteria";
/**
 * @typedef {import('./types/Criteria').Criteria} Criteria
 * @typedef {import('./types/Opportunity').Opportunity} Opportunity
 * @typedef {import('./types/Offer').Offer} Offer
 * @typedef {import('./types/Options').Options} Options
 * @typedef {import('./types/TestDataShape').TestDataShape} TestDataShape
 * @typedef {import('./types/TestDataShape').TestDataShapeOpportunityConstraints} TestDataShapeOpportunityConstraints
 */
/**
 * @typedef {{
 *   harvestStartTime: string;
 * }} LibOptions Options object as supplied to the test-interface-criteria library API.
 */
export const criteriaMap: Map<string, import("./types/Criteria").Criteria>;
/**
 * Check if an opportunity matches some criteria
 *
 * @typedef {object} TestMatchResult
 * @property {boolean} matchesCriteria Does the opportunity match the criteria?
 * @property {string[]} unmetCriteriaDetails Names of constraints which were
 *   not met by the opportunity.
 *
 * @param {Criteria} criteria
 * @param {Opportunity} opportunity
 * @param {LibOptions} libOptions
 */
export function testMatch(criteria: Criteria, opportunity: Opportunity, libOptions: LibOptions): {
    matchesCriteria: boolean;
    unmetCriteriaDetails: string[];
};
/**
 * @param {string} criteriaName
 * @param {Opportunity} opportunity
 * @param {LibOptions} libOptions
 */
export function getRelevantOffers(criteriaName: string, opportunity: Opportunity, libOptions: LibOptions): import("./types/Offer").Offer[];
/**
 * @param {string} criteriaName
 * @param {'OpenBookingSimpleFlow' | 'OpenBookingApprovalFlow'} bookingFlow
 * @param {string} opportunityType
 * @param {LibOptions} libOptions
 */
export function getTestDataShapeExpressions(criteriaName: string, bookingFlow: 'OpenBookingSimpleFlow' | 'OpenBookingApprovalFlow', opportunityType: string, libOptions: LibOptions): {
    'test:testOpportunityDataShapeExpression': {
        '@type': string;
        predicate: string;
        valueExpr: import("./types/TestDataShape").TestDataNodeConstraint;
    }[];
    'test:testOfferDataShapeExpression': {
        '@type': string;
        predicate: string;
        valueExpr: import("./types/TestDataShape").TestDataNodeConstraint;
    }[];
};
import { getOrganizerOrProvider } from "./criteria/criteriaUtils";
import { getRemainingCapacity } from "./criteria/criteriaUtils";
export declare namespace utils {
    export { getOrganizerOrProvider };
    export { getRemainingCapacity };
}
export { allCriteria as criteria };
