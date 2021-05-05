export type EventStatusType = "https://schema.org/EventCancelled" | "https://schema.org/EventPostponed" | "https://schema.org/EventScheduled";
export type TaxMode = "https://openactive.io/TaxGross" | "https://openactive.io/TaxNet";
export type RequiredStatusType = "https://openactive.io/Required" | "https://openactive.io/Optional" | "https://openactive.io/Unavailable";
export type OpenBookingFlowRequirement = "https://openactive.io/OpenBookingIntakeForm" | "https://openactive.io/OpenBookingAttendeeDetails" | "https://openactive.io/OpenBookingApproval" | "https://openactive.io/OpenBookingNegotiation" | "https://openactive.io/OpenBookingMessageExchange";
export type DateRangeNodeConstraint = import("./types/TestDataShape").DateRangeNodeConstraint;
export type NumericNodeConstraint = import("./types/TestDataShape").NumericNodeConstraint;
export type BooleanNodeConstraint = import("./types/TestDataShape").BooleanNodeConstraint;
export type NullNodeConstraint = import("./types/TestDataShape").NullNodeConstraint;
export type TestDataShape = import("./types/TestDataShape").TestDataShape;
export type ValueType = "oa:OpenBookingFlowRequirement" | "oa:RequiredStatusType" | "oa:TaxMode" | "oa:Terms" | "schema:EventStatusType";
export type Options = {
    harvestStartTime: any;
    harvestStartTimeTwoHoursLater: any;
};
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
export function optionNodeConstraint<TOptionType, TValueType extends import("./types/TestDataShape").ValueType>(requirements: Pick<import("./types/TestDataShape").OptionNodeConstraint<TOptionType, TValueType>, "allowNull" | "datatype" | "allowlist" | "blocklist">): import("./types/TestDataShape").OptionNodeConstraint<TOptionType, TValueType>;
/**
 * @template TArrayOf
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataShape').ArrayConstraint<TArrayOf, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataShape').ArrayConstraint<TArrayOf, TValueType>}
 */
export function arrayConstraint<TArrayOf, TValueType extends import("./types/TestDataShape").ValueType>(requirements: Pick<import("./types/TestDataShape").ArrayConstraint<TArrayOf, TValueType>, "datatype" | "includesAll" | "excludesAll" | "minLength">): import("./types/TestDataShape").ArrayConstraint<TArrayOf, TValueType>;
/** @type {NullNodeConstraint} */
export const BLOCKED_FIELD: NullNodeConstraint;
/**
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>}
 */
export function eventStatusOptionNodeConstraint(requirements: Omit<import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>, '@type' | 'datatype'>): import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>;
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
    export function remainingCapacityMustBeAtLeastTwo(): {
        'placeholder:remainingCapacity': import("./types/TestDataShape").NumericNodeConstraint;
    };
    export function mustHaveBookableOffer(options: import("./types/Options").Options): {
        'oa:validFromBeforeStartDate': import("./types/TestDataShape").DateRangeNodeConstraint;
        'oa:openBookingInAdvance': import("./types/TestDataShape").OptionNodeConstraint<import("./types/TestDataShape").RequiredStatusType, "oa:RequiredStatusType">;
    };
    export function sellerMustAllowOpenBooking(): {
        'oa:isOpenBookingAllowed': import("./types/TestDataShape").BooleanNodeConstraint;
    };
    export function mustAllowFullRefund(): {
        'oa:allowCustomerCancellationFullRefund': import("./types/TestDataShape").BooleanNodeConstraint;
    };
}
