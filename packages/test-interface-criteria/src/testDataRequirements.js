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

// /** @type {EventStatusType} */
// const EVENT_STATUS_EVENT_CANCELLED = 'https://schema.org/EventCancelled';
// /** @type {EventStatusType} */
// const EVENT_STATUS_EVENT_POSTPONED = 'https://schema.org/EventPostponed';

// # Generic requirements
/**
 * @param {Omit<TestDataRequirements['test:testOpportunityDataRequirements'], '@type'>} requirements
 * @returns {TestDataRequirements['test:testOpportunityDataRequirements']}
 */
function testOpportunityDataRequirements(requirements) {
  return {
    '@type': 'test:OpportunityTestDataRequirements',
    ...requirements,
  };
}

/**
 * @param {Omit<TestDataRequirements['test:testOfferDataRequirements'], '@type'>} requirements
 * @returns {TestDataRequirements['test:testOfferDataRequirements']}
 */
function testOfferDataRequirements(requirements) {
  return {
    '@type': 'test:OfferTestDataRequirements',
    ...requirements,
  };
}

/**
 * @param {Omit<DateRange, '@type'>} requirements
 * @returns {DateRange}
 */
function dateRange(requirements) {
  return {
    '@type': 'test:DateRange',
    ...requirements,
  };
}

/**
 * @param {Omit<QuantitativeValue, '@type'>} requirements
 * @returns {QuantitativeValue}
 */
function quantitativeValue(requirements) {
  return {
    '@type': 'QuantitativeValue',
    ...requirements,
  };
}

/**
 * @template TOptionType
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataRequirements').OptionRequirements<TOptionType, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataRequirements').OptionRequirements<TOptionType, TValueType>}
 */
function optionRequirements(requirements) {
  return {
    '@type': 'test:OptionRequirements',
    ...requirements,
  };
}

/**
 * @template TArrayOf
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataRequirements').ArrayRequirements<TArrayOf, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataRequirements').ArrayRequirements<TArrayOf, TValueType>}
 */
function arrayRequirements(requirements) {
  return {
    '@type': 'test:ArrayRequirements',
    ...requirements,
  };
}

/** @type {BlockedField} */
const BLOCKED_FIELD = {
  '@type': 'test:BlockedField',
};

// # Specific Requirements
/**
 * @param {Omit<import('./types/TestDataRequirements').OptionRequirements<EventStatusType, 'schema:EventStatusType'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').OptionRequirements<EventStatusType, 'schema:EventStatusType'>}
 */
function eventStatusOptionRequirements(requirements) {
  return optionRequirements({
    valueType: 'schema:EventStatusType',
    ...requirements,
  });
}

/**
 * @param {Omit<import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>}
 */
function advanceBookingOptionRequirements(requirements) {
  return optionRequirements({
    valueType: 'oa:RequiredStatusType',
    ...requirements,
  });
}

/**
 * @param {Omit<import('./types/TestDataRequirements').ArrayRequirements<AvailableChannelType, 'oa:AvailableChannelType'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').ArrayRequirements<AvailableChannelType, 'oa:AvailableChannelType'>}
 */
function availableChannelArrayRequirements(requirements) {
  return arrayRequirements({
    valueType: 'oa:AvailableChannelType',
    ...requirements,
  });
}

/**
 * @param {Omit<import('./types/TestDataRequirements').ArrayRequirements<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>, '@type' | 'valueType'>} requirements
 * @returns {import('./types/TestDataRequirements').ArrayRequirements<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>}
 */
function openBookingFlowRequirementArrayRequirements(requirements) {
  return arrayRequirements({
    valueType: 'oa:OpenBookingFlowRequirement',
    ...requirements,
  });
}

module.exports = {
  // EVENT_STATUS_EVENT_CANCELLED,
  // EVENT_STATUS_EVENT_POSTPONED,
  testOpportunityDataRequirements,
  testOfferDataRequirements,
  dateRange,
  quantitativeValue,
  optionRequirements,
  arrayRequirements,
  BLOCKED_FIELD,
  eventStatusOptionRequirements,
  advanceBookingOptionRequirements,
  availableChannelArrayRequirements,
  openBookingFlowRequirementArrayRequirements,
};
