export type Opportunity = import('../types/Opportunity').Opportunity;
export type Offer = import('../types/Offer').Offer;
export type Options = import('../types/Options').Options;
export type OpportunityConstraint = import('../types/Criteria').OpportunityConstraint;
export type OfferConstraint = import('../types/Criteria').OfferConstraint;
export type Criteria = import('../types/Criteria').Criteria;
export type TestDataShapeFactory = import('../types/Criteria').TestDataShapeFactory;
export type TestDataShape = import('../types/TestDataShape').TestDataShape;
export type TestDataNodeConstraint = import('../types/TestDataShape').TestDataNodeConstraint;
export type DateRangeNodeConstraint = import('../types/TestDataShape').DateRangeNodeConstraint;
export type NumericNodeConstraint = import('../types/TestDataShape').NumericNodeConstraint;
export type ArrayConstraint = import("../types/TestDataShape").ArrayConstraint<any, any>;
export type DateTime = any;
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
    includeConstraintsFromCriteria?: Criteria | null;
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
 * Get the date that the startDate - validFromBeforeStartDate window starts
 *
 * @param {Offer} offer
 * @param {Opportunity} opportunity
 * @returns {DateTime | null} null if there is no booking window defined.
 */
export function getDateAfterWhichBookingsCanBeMade(offer: Offer, opportunity: Opportunity): DateTime | null;
/**
 * @param {Offer} offer
 * @param {Opportunity} opportunity
 * @returns {DateTime | null} null if there is no cancellation window defined.
 */
export function getDateBeforeWhichCancellationsCanBeMade(offer: Offer, opportunity: Opportunity): DateTime | null;
/**
* @param {Opportunity} opportunity
* @returns {boolean}
*/
export function hasCapacityLimitOfOne(opportunity: Opportunity): boolean;
export function remainingCapacityMustBeAtLeastTwo(opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function mustRequireAttendeeDetails(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function mustNotRequireAttendeeDetails(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function mustAllowProposalAmendment(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function startDateMustBe2HrsInAdvance(opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function endDateMustBeInThePast(opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function eventStatusMustNotBeCancelledOrPostponed(opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function mustNotBeOpenBookingInAdvanceUnavailable(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function mustHaveBeInsideValidFromBeforeStartDateWindow(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
/**
* For a session, get `organizer`. For a facility, get `provider`.
* These can be used interchangeably as `organizer` is either a Person or an Organization
* and `provider` is an Organization.
*
* @param {Opportunity} opportunity
*/
export function getOrganizerOrProvider(opportunity: Opportunity): any;
export function mustBeOutsideCancellationWindow(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function mustNotAllowFullRefund(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function mustAllowFullRefund(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export const mustAllowFullRefundOfferConstraint: [string, import("../types/Criteria").OfferConstraint];
export function mustRequireAdditionalDetails(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function mustNotRequireAdditionalDetails(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function sellerMustAllowOpenBooking(opportunity: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
export function excludePaidBookableOffersWithPrepaymentUnavailable(offer: import("../types/Offer").Offer, opportunity?: import("../types/Opportunity").Opportunity, options?: import("../types/Options").Options): boolean;
/**
 * Merge constraints so that the result has the simplest representation of the combination of all constraints.
 *
 * @param {TestDataShape} baseTestDataShape
 * @param {TestDataShape} extraTestDataShape
 * @param {string} criteriaName
 * @return {TestDataShape}
 */
export function extendTestDataShape(baseTestDataShape: TestDataShape, extraTestDataShape: TestDataShape, criteriaName: string): TestDataShape;
/**
 * @param {string} name
 * @param {OfferConstraint} constraint
 * @returns {Criteria['offerConstraints'][number]}
 */
export function createCriteriaOfferConstraint(name: string, constraint: OfferConstraint): Criteria['offerConstraints'][number];
