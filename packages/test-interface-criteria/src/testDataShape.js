/**
 * @typedef {import('./types/TestDataShape').EventStatusType} EventStatusType
 * @typedef {import('./types/TestDataShape').TaxMode} TaxMode
 * @typedef {import('./types/TestDataShape').RequiredStatusType} RequiredStatusType
 * @typedef {import('./types/TestDataShape').OpenBookingFlowRequirement} OpenBookingFlowRequirement
 * @typedef {import('./types/TestDataShape').DateRangeNodeConstraint} DateRangeNodeConstraint
 * @typedef {import('./types/TestDataShape').NumericNodeConstraint} NumericNodeConstraint
 * @typedef {import('./types/TestDataShape').BooleanNodeConstraint} BooleanNodeConstraint
 * @typedef {import('./types/TestDataShape').NullNodeConstraint} NullNodeConstraint
 * @typedef {import('./types/TestDataShape').TestDataShapeOpportunityConstraints} TestDataShapeOpportunityConstraints
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
  mininclusive: 0,
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

/* TODO this is not a good match for an ArrayConstraint as they presently
are defined and used. See
https://github.com/openactive/openactive-test-suite/issues/629. */
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
  /**
   * @param {number} mininclusive
   * @param {number} mininclusiveIfuSlot Minimum value for IFU slots, which
   *   may have different requirements.
   *   This defaults to 1 because IFU slots can, in the spec, only have a capacity
   *   of 0 or 1.
   * @returns {Pick<Required<TestDataShapeOpportunityConstraints>, 'placeholder:remainingCapacity' | 'placeholder:remainingCapacityIfuSlot'>}
   */
  remainingCapacityMustBeAtLeast: (mininclusive, mininclusiveIfuSlot = 1) => ({
    'placeholder:remainingCapacity': quantitativeValue({ mininclusive }),
    'placeholder:remainingCapacityIfuSlot': quantitativeValue({
      mininclusive: mininclusiveIfuSlot,
    }),
  }),
  /**
   * @param {Options} options
   */
  mustHaveBookableOffer: (options) => ({
    'oa:validFromBeforeStartDate': dateRange({
      // -1s to match the non-equaling comparison in the non-ShEx constraint
      maxDate: options.harvestStartTime.minus({ seconds: 1 }).toISO(),
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
  mustBeWithinCancellationWindowOrHaveNoWindow: () => ({
    'oa:latestCancellationBeforeStartDate': BLOCKED_FIELD,
  }),
  onlyNonFreeBookableOffers: () => ({
    'schema:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
  }),
  onlyFreeBookableOffersWithUnavailablePrepayment: () => ({
    'schema:price': FREE_PRICE_QUANTITATIVE_VALUE,
    'oa:openBookingPrepayment': prepaymentOptionNodeConstraint({
      allowlist: ['https://openactive.io/Unavailable'],
      allowNull: true,
    }),
  }),
  /**
   * @param {Options} options
   */
  startDateMustBe2HrsInAdvance: (options) => ({
    'schema:startDate': dateRange({
      // Add a second to match the fact that the non-ShEx criteria uses a non-equaling comparison
      minDate: options.harvestStartTimeTwoHoursLater.plus({ seconds: 1 }).toISO(),
    }),
  }),
  eventStatusMustNotBeCancelledOrPostponed: () => ({
    'schema:eventStatus': eventStatusOptionNodeConstraint({
      blocklist: ['https://schema.org/EventCancelled', 'https://schema.org/EventPostponed'],
    }),
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
