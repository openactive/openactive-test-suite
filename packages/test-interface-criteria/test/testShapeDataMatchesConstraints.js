const util = require('util');
const fc = require('fast-check');
const _ = require('lodash');
const { DateTime } = require('luxon');
const { getTestDataShapeExpressions, testMatch, criteriaMap } = require('..');

/**
 * Since each test uses random data, we run each test multiple times to increase
 * the likelihood of catching any issues. A higher value for NUM_SAMPLES leads to
 * more reliability, but increases the time taken to run tests.
 */
const NUM_SAMPLES = 10;

describe('Data randomly generated via the testDataShape satisfies the opportunityConstraints and offerConstraints', () => {
  const allCriteriaNames = [...criteriaMap.keys()];
  const allOpportunityTypes = /** @type {const} */([
    'ScheduledSession', 'FacilityUseSlot', 'IndividualFacilityUseSlot',
  ]);
  const allBookingFlows = /** @type {const} */([
    'OpenBookingApprovalFlow', 'OpenBookingSimpleFlow',
  ]);
  for (const opportunityType of allOpportunityTypes) {
    for (const bookingFlow of allBookingFlows) {
      for (const criteriaName of allCriteriaNames) {
        if (
          opportunityType === 'IndividualFacilityUseSlot'
          && criteriaName === 'TestOpportunityBookableFiveSpaces'
        ) {
          // It's not possible to generate a valid IFU Slot for this criteria
          // as IFU slots can only have a capacity of 0 or 1
          continue;
        }
        test(`For opportunityType: ${opportunityType}; bookingFlow: ${bookingFlow}; criteria: ${criteriaName}`, () => {
          const harvestStartTime = DateTime.now().toUTC().toISO();
          const shapeExpressions = getTestDataShapeExpressions(
            criteriaName,
            bookingFlow,
            opportunityType,
            {
              harvestStartTime,
            },
          );
          // Run test 10 times each as it involves randomly generated data
          for (let i = 0; i < NUM_SAMPLES; i += 1) {
            const generatedOpportunityPart = generateForShapeDataExpressions(
              shapeExpressions['test:testOpportunityDataShapeExpression'],
              { opportunityType },
            );
            const generatedOffer = generateForShapeDataExpressions(
              shapeExpressions['test:testOfferDataShapeExpression'],
              { startDate: generatedOpportunityPart.startDate },
            );
            const generatedOpportunity = {
              ...generatedOpportunityPart,
              offers: [generatedOffer],
            };
            if (opportunityType === 'IndividualFacilityUseSlot') {
              _.set(generatedOpportunity, ['facilityUse', '@type'], 'IndividualFacilityUse');
            }
            const result = testMatch(criteriaMap.get(criteriaName), generatedOpportunity, {
              harvestStartTime,
            });
            if (!result.matchesCriteria) {
              // eslint-disable-next-line no-console
              console.error('ERROR: generated opportunity does not match criteria', util.inspect({
                shapeExpressions,
                generatedOpportunity,
                result,
              }, false, null, true));
            }
            expect(result).toEqual({
              matchesCriteria: true,
              unmetCriteriaDetails: [],
            });
          }
        });
      }
    }
  }
});

const generatorsByType = {
  /**
   * @param {import('../src/types/TestDataShape').DateRangeNodeConstraint} constraint
   * @returns {fc.Arbitrary<string | null | undefined>}
   */
  'test:DateRangeNodeConstraint': (constraint) => {
    const minDate = constraint.minDate
      ? DateTime.fromISO(constraint.minDate).toJSDate()
      // Reasonable min date so that we don't need to worry about like 10,000 BCE, etc
      : DateTime.fromISO('2000-01-01T00:00:00Z').toJSDate();
    const maxDate = constraint.maxDate
      ? DateTime.fromISO(constraint.maxDate).toJSDate()
      // Reasonable max date so that we don't need to worry about like 999,999 CE, etc
      : DateTime.fromISO('3000-01-01T00:00:00Z').toJSDate();
    const dateArbitrary = fc.date({
      max: maxDate,
      min: minDate,
    }).map((date) => date.toISOString());
    if (constraint.allowNull) {
      return fc.oneof(dateArbitrary, fc.constantFrom(null, undefined));
    }
    return dateArbitrary;
  },
  /**
   * @param {import('../src/types/TestDataShape').NumericNodeConstraint} constraint
   * @returns {fc.Arbitrary<number>}
   */
  NumericNodeConstraint(constraint) {
    const min = constraint.mininclusive ?? undefined;
    const max = constraint.maxinclusive ?? undefined;
    if (min === max) {
      // fast-check otherwise produces NaN
      return fc.constant(min);
    }
    /* NOTE: This does not presently only produce integers. For the time being,
    this is fine as the opportunity/offerConstraints don't check that e.g.
    remainingUses is an integer.
    In that case, we may want to add a new property to the NumericNodeConstraint,
    or add a new kind of shape constraint for ints. */
    return fc.double({
      min, max, noNaN: true, noDefaultInfinity: true,
    });
  },
  /**
   * @param {import('../src/types/TestDataShape').BooleanNodeConstraint} constraint
   * @returns {fc.Arbitrary<boolean>}
   */
  'test:BooleanNodeConstraint': (constraint) => fc.constant(constraint.value),
  /**
   * @param {import('../src/types/TestDataShape').OptionNodeConstraint<any, any>} constraint
   */
  'test:OptionNodeConstraint': (constraint) => {
    if (constraint.allowlist) {
      if (constraint.allowNull) {
        return fc.constantFrom(...constraint.allowlist, null, undefined);
      }
      return fc.constantFrom(...constraint.allowlist);
    }
    const optionsPool = new Set(getDataTypeOptions(constraint.datatype));
    if (constraint.allowNull) {
      optionsPool.add(null);
      optionsPool.add(undefined);
    }
    if (constraint.blocklist) {
      for (const blocklisted of constraint.blocklist) {
        optionsPool.delete(blocklisted);
      }
    }
    return fc.constantFrom(...optionsPool);
  },
  /**
   * @param {import('../src/types/TestDataShape').ArrayConstraint<any, any>} constraint
   */
  'test:ArrayConstraint': (constraint) => {
    if (constraint.includesAll) {
      return fc.constant(constraint.includesAll);
    }
    if (constraint.datatype === 'oa:Terms') {
      // special handling because oa:Terms is not an enum constraint
      return fc.array(
        fc.record({
          '@type': fc.constant('Terms'),
          name: fc.string({ minLength: 1 }),
          url: fc.webUrl(),
          requiresExplicitConsent: fc.boolean(),
          dateModified: fc.date().map((date) => date.toISOString()),
        }, {
          requiredKeys: ['@type', 'name', 'url', 'requiresExplicitConsent'],
        }),
        { minLength: constraint.minLength ?? 0 },
      );
    }
    const optionsPool = new Set(getDataTypeOptions(constraint.datatype));
    if (constraint.excludesAll) {
      for (const excluded of constraint.excludesAll) {
        optionsPool.delete(excluded);
      }
    }
    // Note: this currently produces duplicates, but this is not yet a problem
    return fc.array(fc.constantFrom(...optionsPool), { minLength: constraint.minLength ?? 0 });
  },
  /**
   * @param {import('../src/testDataShape').NullNodeConstraint} constraint
   */
  // eslint-disable-next-line no-unused-vars
  'test:NullNodeConstraint': (constraint) => fc.oneof(fc.constant(null), fc.constant(undefined)),
};

const fieldParentPathSpecHelpers = {
  organizerOrProvider: {
    byType: {
      ScheduledSession: ['superEvent', 'organizer'],
      FacilityUseSlot: ['facilityUse', 'provider'],
      IndividualFacilityUseSlot: ['facilityUse', 'aggregateFacilityUse', 'provider'],
    },
  },
};

/**
 * @type {{
 *   [fieldName: string]: {
 *     byType: Record<'ScheduledSession' | 'FacilityUseSlot' | 'IndividualFacilityUseSlot', string[]>
 *   }
 * }}
 */
const fieldParentPathSpecs = {
  taxMode: fieldParentPathSpecHelpers.organizerOrProvider,
  isOpenBookingAllowed: fieldParentPathSpecHelpers.organizerOrProvider,
  termsOfService: fieldParentPathSpecHelpers.organizerOrProvider,
};

/**
 * @param {ReturnType<typeof getTestDataShapeExpressions>['test:testOpportunityDataShapeExpression']} shapeExpressions
 * @param {object} options
 * @param {'ScheduledSession' | 'FacilityUseSlot' | 'IndividualFacilityUseSlot'} [options.opportunityType]
 *   Exclude if generating for an offer
 * @param {string} [options.startDate] Include if startDate has already been
 *   generated. Used to derive validFromBeforeStartDate
 */
function generateForShapeDataExpressions(shapeExpressions, {
  opportunityType,
  startDate,
}) {
  const result = {};
  for (const tripleConstraint of shapeExpressions) {
    if (tripleConstraint['@type'] !== 'test:TripleConstraint') {
      throw new Error(`Expected test:TripleConstraint but got ${tripleConstraint['@type']}`);
    }
    const fieldNameRegexResult = /^https:\/\/[^/]+\/(.+)$/.exec(tripleConstraint.predicate);
    if (!fieldNameRegexResult) {
      throw new Error(`Not able to extract field name from ${tripleConstraint.predicate}`);
    }
    const fieldName = fieldNameRegexResult[1];
    const fieldPath = (() => {
      const fieldParentPathSpec = fieldParentPathSpecs[fieldName];
      if (fieldParentPathSpec) {
        if (fieldParentPathSpec.byType) {
          if (!opportunityType) {
            throw new Error(
              `opportunityType must be specified when generating data for field: ${tripleConstraint.predicate}`,
            );
          }
          const byType = fieldParentPathSpec.byType[opportunityType];
          if (!byType) {
            throw new Error(
              `fieldParentPathSpecs[${fieldName}].byType[${opportunityType}] not found`,
            );
          }
          return [...byType, fieldName];
        }
        throw new Error(
          `No known parent path strategy found for fieldParentPathSpecs[${fieldName}]`,
        );
      }
      return [fieldName];
    })();
    const constraint = tripleConstraint.valueExpr;
    const generator = generatorsByType[constraint['@type']];
    if (!generator) {
      throw new Error(`No generator for type ${constraint['@type']}`);
    }
    const arbitrary = generator(/** @type {any} */(constraint));
    const [generated] = fc.sample(/** @type {any} */(arbitrary), 1);
    _.set(result, fieldPath, generated);
  }
  /* This is a special case in which the generated value is supposed to be a derived
  value i.e. startDate - validFromBeforeStartDate */
  if (result.validFromBeforeStartDate) {
    result.validFromBeforeStartDate = deriveDurationForDateBeforeStart(
      result.validFromBeforeStartDate,
      startDate,
    );
  }
  // Same situation as for validFromBeforeStartDate
  if (result.latestCancellationBeforeStartDate) {
    result.latestCancellationBeforeStartDate = deriveDurationForDateBeforeStart(
      result.latestCancellationBeforeStartDate,
      startDate,
    );
  }
  // Same situation as for validFromBeforeStartDate
  if (result.validThroughBeforeStartDate) {
    result.validThroughBeforeStartDate = deriveDurationForDateBeforeStart(
      result.validThroughBeforeStartDate,
      startDate,
    );
  }
  return result;
}

/**
 * @param {string} dateBeforeStart
 * @param {string} [startDate]
 */
function deriveDurationForDateBeforeStart(dateBeforeStart, startDate) {
  if (!startDate) {
    throw new Error('startDate must be set in order to derive validFromBeforeStartDate/latestCancellationBeforeStartDate');
  }
  const startDateAsDate = DateTime.fromISO(startDate);
  const validFromBeforeStartDateAsDate = DateTime.fromISO(dateBeforeStart);
  const validFromBeforeStartDateAsDuration = startDateAsDate.diff(validFromBeforeStartDateAsDate);
  return validFromBeforeStartDateAsDuration.toISO();
}

/**
 * @param {string} datatype
 * @returns {string[]}
 */
function getDataTypeOptions(datatype) {
  switch (datatype) {
    case 'schema:EventStatusType':
      return [
        'https://schema.org/EventCancelled',
        'https://schema.org/EventPostponed',
        'https://schema.org/EventScheduled',
      ];
    case 'schema:EventAttendanceModeEnumeration':
      return [
        'https://schema.org/MixedEventAttendanceMode',
        'https://schema.org/OfflineEventAttendanceMode',
        'https://schema.org/OnlineEventAttendanceMode',
      ];
    case 'oa:RequiredStatusType':
      return [
        'https://openactive.io/Required',
        'https://openactive.io/Optional',
        'https://openactive.io/Unavailable',
      ];
    case 'oa:TaxMode':
      return [
        'https://openactive.io/TaxGross',
        'https://openactive.io/TaxNet',
      ];
    case 'oa:OpenBookingFlowRequirement':
      return [
        'https://openactive.io/OpenBookingIntakeForm',
        'https://openactive.io/OpenBookingAttendeeDetails',
        'https://openactive.io/OpenBookingApproval',
        'https://openactive.io/OpenBookingNegotiation',
        'https://openactive.io/OpenBookingMessageExchange',
      ];
    default:
      throw new Error(`Unexpected datatype ${datatype}`);
  }
}
