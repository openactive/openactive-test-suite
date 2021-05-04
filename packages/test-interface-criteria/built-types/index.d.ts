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
export type Criteria = {
    name: string;
    opportunityConstraints: [string, import("./types/Criteria").OpportunityConstraint][];
    offerConstraints: [string, import("./types/Criteria").OfferConstraint][];
    testDataShape: import("./types/Criteria").TestDataShapeFactory;
};
export type Opportunity = {
    [k: string]: any;
};
export type Offer = {
    [k: string]: any;
    '@type': string;
    '@id': string;
};
export type Options = {
    harvestStartTime: any;
    harvestStartTimeTwoHoursLater: any;
};
export type TestDataShape = import("./types/TestDataShape").TestDataShape;
/**
 * Options object as supplied to the test-interface-criteria library API.
 */
export type LibOptions = {
    harvestStartTime: string;
};
declare const allCriteria: import("./types/Criteria").Criteria[];
/**
 * @typedef {import('./types/Criteria').Criteria} Criteria
 * @typedef {import('./types/Opportunity').Opportunity} Opportunity
 * @typedef {import('./types/Offer').Offer} Offer
 * @typedef {import('./types/Options').Options} Options
 * @typedef {import('./types/TestDataShape').TestDataShape} TestDataShape
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
 * @param {string} remainingCapacityPredicate The ShEx predicate to use for "remaining capacity". This should be
 *   remainingUses for Slots and remainingAttendeeCapacity for Events.
 * @param {LibOptions} libOptions
 */
export function getTestDataShapeExpressions(criteriaName: string, bookingFlow: 'OpenBookingSimpleFlow' | 'OpenBookingApprovalFlow', remainingCapacityPredicate: string, libOptions: LibOptions): {
    'test:testOpportunityDataShapeExpression': {
        '@type': string;
        predicate: any;
        valueExpr: import("./types/TestDataShape").TestDataNodeConstraint;
    }[];
    'test:testOfferDataShapeExpression': {
        '@type': string;
        predicate: any;
        valueExpr: import("./types/TestDataShape").TestDataNodeConstraint;
    }[];
};
declare const getOrganizerOrProvider: (opportunity: import("./types/Opportunity").Opportunity) => any;
export declare namespace utils {
    export { getOrganizerOrProvider };
}
export { allCriteria as criteria };
