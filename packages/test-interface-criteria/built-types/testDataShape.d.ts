export type EventStatusType = import('./types/TestDataShape').EventStatusType;
export type TaxMode = import('./types/TestDataShape').TaxMode;
export type RequiredStatusType = import('./types/TestDataShape').RequiredStatusType;
export type OpenBookingFlowRequirement = import('./types/TestDataShape').OpenBookingFlowRequirement;
export type DateRangeNodeConstraint = import('./types/TestDataShape').DateRangeNodeConstraint;
export type NumericNodeConstraint = import('./types/TestDataShape').NumericNodeConstraint;
export type BooleanNodeConstraint = import('./types/TestDataShape').BooleanNodeConstraint;
export type NullNodeConstraint = import('./types/TestDataShape').NullNodeConstraint;
export type TestDataShape = import('./types/TestDataShape').TestDataShape;
export type ValueType = import('./types/TestDataShape').ValueType;
export type Options = import('./types/Options').Options;
/**
 * @typedef {import('./types/TestDataShape').EventStatusType} EventStatusType
 * @typedef {import('./types/TestDataShape').TaxMode} TaxMode
 * @typedef {import('./types/TestDataShape').RequiredStatusType} RequiredStatusType
 * @typedef {import('./types/TestDataShape').OpenBookingFlowRequirement} OpenBookingFlowRequirement
 * @typedef {import('./types/TestDataShape').DateRangeNodeConstraint} DateRangeNodeConstraint
 * @typedef {import('./types/TestDataShape').NumericNodeConstraint} NumericNodeConstraint
 * @typedef {import('./types/TestDataShape').BooleanNodeConstraint} BooleanNodeConstraint
 * @typedef {import('./types/TestDataShape').NullNodeConstraint} NullNodeConstraint
 * @typedef {import('./types/TestDataShape').TestDataShape} TestDataShape
 * @typedef {import('./types/TestDataShape').ValueType} ValueType
 * @typedef {import('./types/Options').Options} Options
 */
/**
 * @param {Omit<TestDataShape['opportunityConstraints'], '@type'>} requirements
 * @returns {TestDataShape['opportunityConstraints']}
 */
export function testOpportunityDataShapeExpression(requirements: Omit<TestDataShape['opportunityConstraints'], '@type'>): TestDataShape['opportunityConstraints'];
/**
 * @param {Omit<TestDataShape['offerConstraints'], '@type'>} requirements
 * @returns {TestDataShape['offerConstraints']}
 */
export function testOfferDataShapeExpression(requirements: Omit<TestDataShape['offerConstraints'], '@type'>): TestDataShape['offerConstraints'];
/**
 * @param {Omit<DateRangeNodeConstraint, '@type'>} requirements
 * @returns {DateRangeNodeConstraint}
 */
export function dateRange(requirements: Omit<DateRangeNodeConstraint, '@type'>): DateRangeNodeConstraint;
/**
 * @param {Omit<NumericNodeConstraint, '@type'>} requirements
 * @returns {NumericNodeConstraint}
 */
export function quantitativeValue(requirements: Omit<NumericNodeConstraint, '@type'>): NumericNodeConstraint;
export const FREE_PRICE_QUANTITATIVE_VALUE: import("./types/TestDataShape").NumericNodeConstraint;
export const NON_FREE_PRICE_QUANTITATIVE_VALUE: import("./types/TestDataShape").NumericNodeConstraint;
/**
 * @template TOptionType
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<TOptionType, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<TOptionType, TValueType>}
 */
export function optionNodeConstraint<TOptionType, TValueType extends import("./types/TestDataShape").ValueType>(requirements: Omit<import("./types/TestDataShape").OptionNodeConstraint<TOptionType, TValueType>, "@type">): import("./types/TestDataShape").OptionNodeConstraint<TOptionType, TValueType>;
/**
 * @template TArrayOf
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataShape').ArrayConstraint<TArrayOf, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataShape').ArrayConstraint<TArrayOf, TValueType>}
 */
export function arrayConstraint<TArrayOf, TValueType extends import("./types/TestDataShape").ValueType>(requirements: Omit<import("./types/TestDataShape").ArrayConstraint<TArrayOf, TValueType>, "@type">): import("./types/TestDataShape").ArrayConstraint<TArrayOf, TValueType>;
/** @type {NullNodeConstraint} */
export const BLOCKED_FIELD: NullNodeConstraint;
/**
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>}
 */
export function eventStatusOptionNodeConstraint(requirements: Omit<import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>, '@type' | 'datatype'>): import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>;
/**
 * @param {Omit<import('./types/TestDataShape').TestDataShape['opportunityConstraints']['schema:eventAttendanceMode'], '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').TestDataShape['opportunityConstraints']['schema:eventAttendanceMode']}
 */
export function eventAttendanceModeOptionNodeConstraint(requirements: Omit<import('./types/TestDataShape').TestDataShape['opportunityConstraints']['schema:eventAttendanceMode'], '@type' | 'datatype'>): import('./types/TestDataShape').TestDataShape['opportunityConstraints']['schema:eventAttendanceMode'];
/**
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>}
 */
export function advanceBookingOptionNodeConstraint(requirements: Omit<import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'datatype'>): import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>;
/**
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>}
 */
export function prepaymentOptionNodeConstraint(requirements: Omit<import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'datatype'>): import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>;
/**
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<TaxMode, 'oa:TaxMode'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<TaxMode, 'oa:TaxMode'>}
 */
export function taxModeOptionNodeConstraint(requirements: Omit<import('./types/TestDataShape').OptionNodeConstraint<TaxMode, 'oa:TaxMode'>, '@type' | 'datatype'>): import('./types/TestDataShape').OptionNodeConstraint<TaxMode, 'oa:TaxMode'>;
/**
 * @param {Omit<import('./types/TestDataShape').ArrayConstraint<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').ArrayConstraint<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>}
 */
export function openBookingFlowRequirementArrayConstraint(requirements: Omit<import('./types/TestDataShape').ArrayConstraint<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>, '@type' | 'datatype'>): import('./types/TestDataShape').ArrayConstraint<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>;
/**
 * @param {number} minLength
 * @returns {import('./types/TestDataShape').ArrayConstraint<unknown, 'oa:Terms'>}
 */
export function termsOfServiceArrayConstraint(minLength: number): import('./types/TestDataShape').ArrayConstraint<unknown, 'oa:Terms'>;
export const TRUE_BOOLEAN_CONSTRAINT: import("./types/TestDataShape").BooleanNodeConstraint;
export const FALSE_BOOLEAN_CONSTRAINT: import("./types/TestDataShape").BooleanNodeConstraint;
export namespace shapeConstraintRecipes {
    function remainingCapacityMustBeAtLeast(mininclusive: any): {
        'placeholder:remainingCapacity': import("./types/TestDataShape").NumericNodeConstraint;
    };
    function mustHaveBookableOffer(options: import("./types/Options").Options): {
        'oa:validFromBeforeStartDate': import("./types/TestDataShape").DateRangeNodeConstraint;
        'oa:openBookingInAdvance': import("./types/TestDataShape").OptionNodeConstraint<import("./types/TestDataShape").RequiredStatusType, "oa:RequiredStatusType">;
    };
    function sellerMustAllowOpenBooking(): {
        'oa:isOpenBookingAllowed': import("./types/TestDataShape").BooleanNodeConstraint;
    };
    function mustAllowFullRefund(): {
        'oa:allowCustomerCancellationFullRefund': import("./types/TestDataShape").BooleanNodeConstraint;
    };
    function mustBeWithinCancellationWindowOrHaveNoWindow(): {
        'oa:latestCancellationBeforeStartDate': import("./types/TestDataShape").NullNodeConstraint;
    };
    function onlyNonFreeBookableOffers(): {
        'schema:price': import("./types/TestDataShape").NumericNodeConstraint;
    };
    function onlyFreeBookableOffersWithUnavailablePrepayment(): {
        'schema:price': import("./types/TestDataShape").NumericNodeConstraint;
        'oa:openBookingPrepayment': import("./types/TestDataShape").OptionNodeConstraint<import("./types/TestDataShape").RequiredStatusType, "oa:RequiredStatusType">;
    };
}
