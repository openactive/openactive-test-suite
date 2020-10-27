export type Opportunity = {
    [k: string]: any;
};
export type Offer = {
    [k: string]: any;
    '@type': string;
    '@id': string;
};
export type OpportunityConstraint = (opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
export type OfferConstraint = (offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options) => boolean;
export type Criteria = {
    name: string;
    opportunityConstraints: [string, import("../types/Criteria").OpportunityConstraint][];
    offerConstraints: [string, import("../types/Criteria").OfferConstraint][];
};
/**
 * @typedef {import('../types/Opportunity').Opportunity} Opportunity
 * @typedef {import('../types/Offer').Offer} Offer
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 * @typedef {import('../types/Criteria').Criteria} Criteria
 */
/**
 * @param {object} args
 * @param {string} args.name
 * @param {Criteria['opportunityConstraints']} args.opportunityConstraints
 * @param {Criteria['offerConstraints']} args.offerConstraints
 * @param {Criteria | null} [args.includeConstraintsFromCriteria] If provided,
 *   opportunity and offer constraints will be included from this criteria.
 * @returns {Criteria}
 */
export function createCriteria({ name, opportunityConstraints, offerConstraints, includeConstraintsFromCriteria }: {
    name: string;
    opportunityConstraints: Criteria['opportunityConstraints'];
    offerConstraints: Criteria['offerConstraints'];
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
 * @type {OfferConstraint}
 */
export function mustBeWithinBookingWindow(offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options: import("../types/Options").Options): boolean;
/**
 * @type {OfferConstraint}
 */
export function mustBeWithinCancellationWindow(offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options: import("../types/Options").Options): boolean;
/**
 * @param {Opportunity} opportunity
 * @returns {boolean}
 */
export function hasCapacityLimitOfOne(opportunity: Opportunity): boolean;
/**
 * @type {OpportunityConstraint}
 */
export function remainingCapacityMustBeAtLeastTwo(opportunity: import("../types/Opportunity").Opportunity): boolean;
