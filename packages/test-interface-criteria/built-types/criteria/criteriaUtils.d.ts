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
    testDataShape: import("../types/Criteria").TestDataShapeFactory;
};
export type TestDataShapeFactory = (options: import("../types/Options").Options) => import("../types/TestDataShape").TestDataShape;
export type TestDataShape = import("../types/TestDataShape").TestDataShape;
export type TestDataNodeConstraint = import("../types/TestDataShape").DateRangeNodeConstraint | import("../types/TestDataShape").NumericNodeConstraint | import("../types/TestDataShape").NullNodeConstraint | import("../types/TestDataShape").OptionNodeConstraint<any, any> | import("../types/TestDataShape").ArrayConstraint<any, any>;
export type DateRangeNodeConstraint = import("../types/TestDataShape").DateRangeNodeConstraint;
export type NumericNodeConstraint = import("../types/TestDataShape").NumericNodeConstraint;
export type ArrayConstraint = import("../types/TestDataShape").ArrayConstraint<any, any>;
/**
 * @param {object} args
 * @param {string} args.name
 * @param {Criteria['opportunityConstraints']} args.opportunityConstraints
 * @param {Criteria['offerConstraints']} args.offerConstraints
 * @param {Criteria['testDataShape']} args.testDataShape
 * @param {Criteria | null} [args.includeConstraintsFromCriteria] If provided,
 *   opportunity and offer constraints will be included from this criteria.
 * @returns {Criteria}
 */
export function createCriteria({ name, opportunityConstraints, offerConstraints, testDataShape: testDataShapeFactory, includeConstraintsFromCriteria, }: {
    name: string;
    opportunityConstraints: Criteria['opportunityConstraints'];
    offerConstraints: Criteria['offerConstraints'];
    testDataShape: Criteria['testDataShape'];
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
/**
* @type {OfferConstraint}
*/
export function mustRequireAttendeeDetails(offer: import("../types/Offer").Offer): boolean;
/**
* @type {OfferConstraint}
*/
export function mustNotRequireAttendeeDetails(offer: import("../types/Offer").Offer): boolean;
/**
* @type {OpportunityConstraint}
*/
export function startDateMustBe2HrsInAdvance(opportunity: import("../types/Opportunity").Opportunity, options: import("../types/Options").Options): boolean;
/**
* @type {OpportunityConstraint}
*/
export function eventStatusMustNotBeCancelledOrPostponed(opportunity: import("../types/Opportunity").Opportunity): boolean;
/**
* @type {OfferConstraint}
*/
export function mustHaveBookableOffer(offer: import("../types/Offer").Offer, opportunity: import("../types/Opportunity").Opportunity, options: import("../types/Options").Options): boolean;
/**
* For a session, get `organizer`. For a facility, get `provider`.
* These can be used interchangeably as `organizer` is either a Person or an Organization
* and `provider` is an Organization.
*
* @param {Opportunity} opportunity
*/
export function getOrganizerOrProvider(opportunity: Opportunity): any;
/**
* @type {OfferConstraint}
*/
export function mustNotAllowFullRefund(offer: import("../types/Offer").Offer): boolean;
/**
* @type {OfferConstraint}
*/
export function mustAllowFullRefund(offer: import("../types/Offer").Offer): boolean;
/**
 * @type {OfferConstraint}
 */
export function mustRequireAdditionalDetails(offer: import("../types/Offer").Offer): boolean;
/**
 * @type {OfferConstraint}
 */
export function mustNotRequireAdditionalDetails(offer: import("../types/Offer").Offer): boolean;
/**
 * Merge constraints so that the result has the simplest representation of the combination of all constraints.
 *
 * @param {TestDataShape} baseTestDataShape
 * @param {TestDataShape} extraTestDataShape
 * @param {string} criteriaName
 * @return {TestDataShape}
 */
export function extendTestDataShape(baseTestDataShape: TestDataShape, extraTestDataShape: TestDataShape, criteriaName: string): TestDataShape;
