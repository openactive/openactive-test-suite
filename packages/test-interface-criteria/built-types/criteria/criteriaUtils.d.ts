export type Opportunity = {
    [k: string]: any;
};
export type Offer = {
    [k: string]: any;
    '@type': string;
    '@id': string;
};
export type Options = {
    harvestStartTime: Date;
};
export type OpportunityConstraint = (opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
export type Criteria = {
    name: string;
    opportunityConstraints: [string, import("../types/Criteria").OpportunityConstraint][];
    offerConstraints: [string, import("../types/Criteria").OfferConstraint][];
    testDataRequirements: import("../types/Criteria").TestDataRequirementsFactory;
};
export type TestDataRequirementsFactory = (options: import("../types/Options").Options) => import("../types/TestDataRequirements").TestDataRequirements;
export type TestDataRequirements = import("../types/TestDataRequirements").TestDataRequirements;
/**
 * @typedef {import('../types/Opportunity').Opportunity} Opportunity
 * @typedef {import('../types/Offer').Offer} Offer
 * @typedef {import('../types/Options').Options} Options
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 * @typedef {import('../types/Criteria').Criteria} Criteria
 * @typedef {import('../types/Criteria').TestDataRequirementsFactory} TestDataRequirementsFactory
 * @typedef {import('../types/TestDataRequirements').TestDataRequirements} TestDataRequirements
 */
/**
 * @param {object} args
 * @param {string} args.name
 * @param {Criteria['opportunityConstraints']} args.opportunityConstraints
 * @param {Criteria['offerConstraints']} args.offerConstraints
 * @param {Criteria['testDataRequirements']} args.testDataRequirements
 * @param {Criteria | null} [args.includeConstraintsFromCriteria] If provided,
 *   opportunity and offer constraints will be included from this criteria.
 * @returns {Criteria}
 */
export function createCriteria({ name, opportunityConstraints, offerConstraints, testDataRequirements: testDataRequirementsFactory, includeConstraintsFromCriteria, }: {
    name: string;
    opportunityConstraints: Criteria['opportunityConstraints'];
    offerConstraints: Criteria['offerConstraints'];
    testDataRequirements: Criteria['testDataRequirements'];
    includeConstraintsFromCriteria: Criteria | null;
}): Criteria;
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
/**
 * @param {Opportunity} opportunity
 * @returns {boolean}
 */
export function hasCapacityLimitOfOne(opportunity: Opportunity): boolean;
/**
 * @type {OpportunityConstraint}
 */
export function remainingCapacityMustBeAtLeastTwo(opportunity: import("../types/Opportunity").Opportunity): boolean;
/**
 * For a session, get `organizer`. For a facility, get `provider`.
 * These can be used interchangeably as `organizer` is either a Person or an Organization
 * and `provider` is an Organization.
 *
 * @param {Opportunity} opportunity
 */
export function getOrganizerOrProvider(opportunity: Opportunity): any;
