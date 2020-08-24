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
};
export type Opportunity = {
    [k: string]: any;
};
export type Offer = {
    [k: string]: any;
    '@type': string;
    '@id': string;
};
declare const allCriteria: import("./types/Criteria").Criteria[];
/**
 * @typedef {import('./types/Criteria').Criteria} Criteria
 * @typedef {import('./types/Opportunity').Opportunity} Opportunity
 * @typedef {import('./types/Offer').Offer} Offer
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
 */
export function testMatch(criteria: Criteria, opportunity: Opportunity): {
    matchesCriteria: boolean;
    unmetCriteriaDetails: string[];
};
/**
 * @param {string} criteriaName
 * @param {Opportunity} opportunity
 */
export function getRelevantOffers(criteriaName: string, opportunity: Opportunity): import("./types/Offer").Offer[];
export { allCriteria as criteria };
