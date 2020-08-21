export type Opportunity = {
    [k: string]: any;
};
export type Criteria = {
    name: string;
    opportunityConstraints: [string, import("../types/Criteria").OpportunityConstraint][];
    offerConstraints: [string, import("../types/Criteria").OfferConstraint][];
};
/**
 * @typedef {import('../types/Opportunity').Opportunity} Opportunity
 * @typedef {import('../types/Criteria').Criteria} Criteria
 */
/**
 * @param {string} name
 * @param {Criteria['opportunityConstraints']} opportunityConstraints
 * @param {Criteria['offerConstraints']} offerConstraints
 * @param {Pick<Criteria, 'opportunityConstraints' | 'offerConstraints'> | null} [includeConstraintsFromCriteria] If provided,
 *   opportunity and offer constraints will be included from this criteria.
 * @returns {Criteria}
 */
export function createCriteria(name: string, opportunityConstraints: Criteria['opportunityConstraints'], offerConstraints: Criteria['offerConstraints'], includeConstraintsFromCriteria?: Pick<Criteria, 'opportunityConstraints' | 'offerConstraints'> | null): Criteria;
/**
 * @param {Opportunity} opportunity
 * @returns {string}
 */
export function getId(opportunity: Opportunity): string;
/**
 * @param {Opportunity} opportunity
 * @returns {string}
 */
export function getType(opportunity: Opportunity): string;
/**
 * @param {Opportunity} opportunity
 * @returns {number | null | undefined} Not all opportunities have
 *   remainingAttendeeCapacity (which is optional in ScheduledSessions) or
 *   remainingUses, therefore the return value may be null-ish.
 */
export function getRemainingCapacity(opportunity: Opportunity): number | null | undefined;
