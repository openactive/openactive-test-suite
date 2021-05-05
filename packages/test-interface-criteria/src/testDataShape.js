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

// # Generic requirements
/**
 * @param {Omit<TestDataShape['opportunityConstraints'], '@type'>} requirements
 * @returns {TestDataShape['opportunityConstraints']}
 */
function testOpportunityDataShapeExpression(requirements) {
  return {
    ...requirements,
  };
}

/**
 * @param {Omit<TestDataShape['offerConstraints'], '@type'>} requirements
 * @returns {TestDataShape['offerConstraints']}
 */
function testOfferDataShapeExpression(requirements) {
  return {
    ...requirements,
  };
}

/**
 * @param {Omit<DateRangeNodeConstraint, '@type'>} requirements
 * @returns {DateRangeNodeConstraint}
 */
function dateRange(requirements) {
  return {
    '@type': 'test:DateRangeNodeConstraint',
    ...requirements,
  };
}

/**
 * @param {Omit<NumericNodeConstraint, '@type'>} requirements
 * @returns {NumericNodeConstraint}
 */
function quantitativeValue(requirements) {
  return {
    '@type': 'NumericNodeConstraint',
    ...requirements,
  };
}

const FREE_PRICE_QUANTITATIVE_VALUE = quantitativeValue({
  maxinclusive: 0,
});

const NON_FREE_PRICE_QUANTITATIVE_VALUE = quantitativeValue({
  mininclusive: 0.01, // must cost at least £0.01
});

/**
 *
 * @param {Omit<BooleanNodeConstraint, '@type'>} requirements
 * @returns {BooleanNodeConstraint}
 */
function boolean(requirements) {
  return {
    '@type': 'test:BooleanNodeConstraint',
    ...requirements,
  };
}

const TRUE_BOOLEAN_CONSTRAINT = boolean({
  value: true,
});

const FALSE_BOOLEAN_CONSTRAINT = boolean({
  value: false,
});

/**
 * @template TOptionType
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<TOptionType, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<TOptionType, TValueType>}
 */
function optionNodeConstraint(requirements) {
  return {
    '@type': 'test:OptionNodeConstraint',
    ...requirements,
  };
}

/**
 * @template TArrayOf
 * @template {ValueType} TValueType
 * @param {Omit<import('./types/TestDataShape').ArrayConstraint<TArrayOf, TValueType>, '@type'>} requirements
 * @returns {import('./types/TestDataShape').ArrayConstraint<TArrayOf, TValueType>}
 */
function arrayConstraint(requirements) {
  return {
    '@type': 'test:ArrayConstraint',
    ...requirements,
  };
}

/** @type {NullNodeConstraint} */
const BLOCKED_FIELD = {
  '@type': 'test:NullNodeConstraint',
};

// # Specific Constraints
/**
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>}
 */
function eventStatusOptionNodeConstraint(requirements) {
  return optionNodeConstraint({
    datatype: 'schema:EventStatusType',
    ...requirements,
  });
}

/**
 * @param {Omit<import('./types/TestDataShape').TestDataShape['opportunityConstraints']['schema:eventAttendanceMode'], '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').TestDataShape['opportunityConstraints']['schema:eventAttendanceMode']}
 */
function eventAttendanceModeOptionNodeConstraint(requirements) {
  return optionNodeConstraint({
    datatype: 'schema:EventAttendanceModeEnumeration',
    ...requirements,
  });
}

/**
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>}
 */
function requiredStatusTypeOptionNodeConstraint(requirements) {
  return optionNodeConstraint({
    datatype: 'oa:RequiredStatusType',
    ...requirements,
  });
}

const advanceBookingOptionNodeConstraint = requiredStatusTypeOptionNodeConstraint;
const prepaymentOptionNodeConstraint = requiredStatusTypeOptionNodeConstraint;

/**
 * @param {Omit<import('./types/TestDataShape').OptionNodeConstraint<TaxMode, 'oa:TaxMode'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').OptionNodeConstraint<TaxMode, 'oa:TaxMode'>}
 */
function taxModeOptionNodeConstraint(requirements) {
  return optionNodeConstraint({
    datatype: 'oa:TaxMode',
    ...requirements,
  });
}

/**
 * @param {Omit<import('./types/TestDataShape').ArrayConstraint<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>, '@type' | 'datatype'>} requirements
 * @returns {import('./types/TestDataShape').ArrayConstraint<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>}
 */
function openBookingFlowRequirementArrayConstraint(requirements) {
  return arrayConstraint({
    datatype: 'oa:OpenBookingFlowRequirement',
    ...requirements,
  });
}

/**
 * @param {number} minLength
 * @returns {import('./types/TestDataShape').ArrayConstraint<unknown, 'oa:Terms'>}
 */
function termsOfServiceArrayConstraint(minLength) {
  return arrayConstraint({
    datatype: 'oa:Terms',
    minLength,
  });
}

/** Constraints that match the criteriaUtils functions */
const shapeConstraintRecipes = {
  remainingCapacityMustBeAtLeastTwo: () => ({
    'placeholder:remainingCapacity': quantitativeValue({
      mininclusive: 2,
    }),
  }),
  /**
   * @param {Options} options
   */
  mustHaveBookableOffer: (options) => ({
    'oa:validFromBeforeStartDate': dateRange({
      maxDate: options.harvestStartTime,
      allowNull: true,
    }),
    'oa:openBookingInAdvance': advanceBookingOptionNodeConstraint({
      blocklist: ['https://openactive.io/Unavailable'],
    }),
  }),
  sellerMustAllowOpenBooking: () => ({
    'oa:isOpenBookingAllowed': TRUE_BOOLEAN_CONSTRAINT,
  }),
  mustAllowFullRefund: () => ({
    'oa:allowCustomerCancellationFullRefund': TRUE_BOOLEAN_CONSTRAINT,
  }),
};

module.exports = {
  testOpportunityDataShapeExpression,
  testOfferDataShapeExpression,
  dateRange,
  quantitativeValue,
  FREE_PRICE_QUANTITATIVE_VALUE,
  NON_FREE_PRICE_QUANTITATIVE_VALUE,
  optionNodeConstraint,
  arrayConstraint,
  BLOCKED_FIELD,
  eventStatusOptionNodeConstraint,
  eventAttendanceModeOptionNodeConstraint,
  advanceBookingOptionNodeConstraint,
  prepaymentOptionNodeConstraint,
  taxModeOptionNodeConstraint,
  openBookingFlowRequirementArrayConstraint,
  termsOfServiceArrayConstraint,
  TRUE_BOOLEAN_CONSTRAINT,
  FALSE_BOOLEAN_CONSTRAINT,
  shapeConstraintRecipes,
};
