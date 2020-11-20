/**
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

module.exports = {
  testOpportunityDataRequirements,
  testOfferDataRequirements,
  dateRange,
  quantitativeValue,
  optionRequirements,
  arrayRequirements,
  BLOCKED_FIELD,
};
