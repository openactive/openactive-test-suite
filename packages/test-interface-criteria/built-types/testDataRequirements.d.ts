export type EventStatusType = "https://schema.org/EventCancelled" | "https://schema.org/EventPostponed" | "https://schema.org/EventScheduled";
export type TaxMode = "https://openactive.io/TaxGross" | "https://openactive.io/TaxNet";
export type RequiredStatusType = "https://openactive.io/Required" | "https://openactive.io/Optional" | "https://openactive.io/Unavailable";
export type AvailableChannelType = "https://openactive.io/OpenBookingPrepayment" | "https://openactive.io/TelephoneAdvanceBooking" | "https://openactive.io/TelephonePrepayment" | "https://openactive.io/OnlinePrepayment";
export type OpenBookingFlowRequirement = "https://openactive.io/OpenBookingIntakeForm" | "https://openactive.io/OpenBookingAttendeeDetails" | "https://openactive.io/OpenBookingApproval" | "https://openactive.io/OpenBookingNegotiation" | "https://openactive.io/OpenBookingMessageExchange";
export type DateRange = import("./types/TestDataRequirements").DateRange;
export type QuantitativeValue = import("./types/TestDataRequirements").QuantitativeValue;
export type BlockedField = import("./types/TestDataRequirements").BlockedField;
export type TestDataRequirements = import("./types/TestDataRequirements").TestDataRequirements;
export type ValueType = "oa:AvailableChannelType" | "oa:OpenBookingFlowRequirement" | "oa:RequiredStatusType" | "oa:TaxMode" | "oa:Terms" | "schema:EventStatusType";
/**
 * @typedef {import('./types/TestDataRequirements').EventStatusType} EventStatusType
 * @typedef {import('./types/TestDataRequirements').TaxMode} TaxMode
 * @typedef {import('./types/TestDataRequirements').RequiredStatusType} RequiredStatusType
 * @typedef {import('./types/TestDataRequirements').AvailableChannelType} AvailableChannelType
 * @typedef {import('./types/TestDataRequirements').OpenBookingFlowRequirement} OpenBookingFlowRequirement
 * @typedef {import('./types/TestDataRequirements').DateRange} DateRange
 * @typedef {import('./types/TestDataRequirements').QuantitativeValue} QuantitativeValue
 * @typedef {import('./types/TestDataRequirements').BlockedField} BlockedField
 * @typedef {import('./types/TestDataRequirements').TestDataRequirements} TestDataRequirements
 * @typedef {import('./types/TestDataRequirements').ValueType} ValueType
 */
/**
 * @param {Omit<TestDataRequirements['test:testOpportunityDataRequirements'], '@type'>} requirements
 * @returns {TestDataRequirements['test:testOpportunityDataRequirements']}
 */
export function testOpportunityDataRequirements(requirements: Omit<TestDataRequirements['test:testOpportunityDataRequirements'], '@type'>): TestDataRequirements['test:testOpportunityDataRequirements'];
/**
 * @param {Omit<TestDataRequirements['test:testOfferDataRequirements'], '@type'>} requirements
 * @returns {TestDataRequirements['test:testOfferDataRequirements']}
 */
export function testOfferDataRequirements(requirements: Omit<TestDataRequirements['test:testOfferDataRequirements'], '@type'>): TestDataRequirements['test:testOfferDataRequirements'];
/**
 * @param {Omit<DateRange, '@type'>} requirements
 * @returns {DateRange}
 */
export function dateRange(requirements: Omit<DateRange, '@type'>): DateRange;
/**
 * @param {Omit<QuantitativeValue, '@type'>} requirements
 * @returns {QuantitativeValue}
 */
export function quantitativeValue(requirements: Omit<QuantitativeValue, '@type'>): QuantitativeValue;
export const FREE_PRICE_QUANTITATIVE_VALUE: import("./types/TestDataRequirements").QuantitativeValue;
export const NON_FREE_PRICE_QUANTITATIVE_VALUE: import("./types/TestDataRequirements").QuantitativeValue;
/**
 * @template TOptionType
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataRequirements').OptionRequirements<TOptionType, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataRequirements').OptionRequirements<TOptionType, TValueType>}
 */
export function optionRequirements<TOptionType, TValueType extends import("./types/TestDataRequirements").ValueType>(requirements: Pick<import("./types/TestDataRequirements").OptionRequirements<TOptionType, TValueType>, "allowNull" | "valueType" | "allowlist" | "blocklist">): import("./types/TestDataRequirements").OptionRequirements<TOptionType, TValueType>;
/**
 * @template TArrayOf
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataRequirements').ArrayRequirements<TArrayOf, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataRequirements').ArrayRequirements<TArrayOf, TValueType>}
 */
export function arrayRequirements<TArrayOf, TValueType extends import("./types/TestDataRequirements").ValueType>(requirements: Pick<import("./types/TestDataRequirements").ArrayRequirements<TArrayOf, TValueType>, "valueType" | "includesAll" | "excludesAll" | "minLength">): import("./types/TestDataRequirements").ArrayRequirements<TArrayOf, TValueType>;
/** @type {BlockedField} */
export const BLOCKED_FIELD: BlockedField;
/**
 * @param {Omit<import('./types/TestDataRequirements').OptionRequirements<EventStatusType, 'schema:EventStatusType'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').OptionRequirements<EventStatusType, 'schema:EventStatusType'>}
 */
export function eventStatusOptionRequirements(requirements: Omit<import('./types/TestDataRequirements').OptionRequirements<EventStatusType, 'schema:EventStatusType'>, '@type' | 'valueType'>): import('./types/TestDataRequirements').OptionRequirements<EventStatusType, 'schema:EventStatusType'>;
/**
 * @param {Omit<import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>}
 */
export function advanceBookingOptionRequirements(requirements: Omit<import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'valueType'>): import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>;
/**
 * @param {Omit<import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>}
 */
export function prepaymentOptionRequirements(requirements: Omit<import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'valueType'>): import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>;
/**
 * @param {Omit<import('./types/TestDataRequirements').OptionRequirements<TaxMode, 'oa:TaxMode'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').OptionRequirements<TaxMode, 'oa:TaxMode'>}
 */
export function taxModeOptionRequirements(requirements: Omit<import('./types/TestDataRequirements').OptionRequirements<TaxMode, 'oa:TaxMode'>, '@type' | 'valueType'>): import('./types/TestDataRequirements').OptionRequirements<TaxMode, 'oa:TaxMode'>;
/**
 * @param {Omit<import('./types/TestDataRequirements').ArrayRequirements<AvailableChannelType, 'oa:AvailableChannelType'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').ArrayRequirements<AvailableChannelType, 'oa:AvailableChannelType'>}
 */
export function availableChannelArrayRequirements(requirements: Omit<import('./types/TestDataRequirements').ArrayRequirements<AvailableChannelType, 'oa:AvailableChannelType'>, '@type' | 'valueType'>): import('./types/TestDataRequirements').ArrayRequirements<AvailableChannelType, 'oa:AvailableChannelType'>;
/**
 * @param {Omit<import('./types/TestDataRequirements').ArrayRequirements<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').ArrayRequirements<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>}
 */
export function openBookingFlowRequirementArrayRequirements(requirements: Omit<import('./types/TestDataRequirements').ArrayRequirements<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>, '@type' | 'valueType'>): import('./types/TestDataRequirements').ArrayRequirements<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>;
/**
 * @param {number} minLength
 * @returns {import('./types/TestDataRequirements').ArrayRequirements<unknown, 'oa:Terms'>}
 */
export function termsOfServiceArrayRequirements(minLength: number): import('./types/TestDataRequirements').ArrayRequirements<unknown, 'oa:Terms'>;
