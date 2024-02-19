const fc = require('fast-check');
const _ = require('lodash');
const { DateTime } = require('luxon');
const util = require('util');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { getTestDataShapeExpressions, testMatch, criteriaMap } = require('..');

// TODO many samples
describe('Data generated via the testDataShape satisfies the opportunityConstraints and offerConstraints', () => {
  // test ('hi', () => {});
  // TODO3
  // const allCriteriaNames = [...criteriaMap.keys()];
  const allCriteriaNames = ['TestOpportunityBookableCancellableOutsideWindow'];
  const allOpportunityTypes = /** @type {const} */([
    // 'ScheduledSession', 'FacilityUseSlot', 'IndividualFacilityUseSlot'
  'IndividualFacilityUseSlot',
  ]);
  const allBookingFlows = /** @type {const} */([
    // 'OpenBookingApprovalFlow', 'OpenBookingSimpleFlow'
  'OpenBookingSimpleFlow',
  ]);
  for (const opportunityType of allOpportunityTypes) {
    for (const bookingFlow of allBookingFlows) {
      for (const criteriaName of allCriteriaNames) {
        test(`For opportunityType: ${opportunityType}; bookingFlow: ${bookingFlow}; criteria: ${criteriaName}`, () => {
          const harvestStartTime = DateTime.now().toUTC().toISO();
          const shapeExpressions = getTestDataShapeExpressions(
            criteriaName,
            bookingFlow,
            opportunityType,
            {
              harvestStartTime,
            }
          );
          console.log('shapeExpressions:', util.inspect(shapeExpressions, false, null, true));
          const generatedOpportunityPart = generateForShapeDataExpressions(
            shapeExpressions['test:testOpportunityDataShapeExpression'],
            { opportunityType },
          );
          console.log('generatedOpportunityPart:', generatedOpportunityPart);
          const generatedOffer = generateForShapeDataExpressions(
            shapeExpressions['test:testOfferDataShapeExpression'],
            { startDate: generatedOpportunityPart.startDate },
          );
          console.log('generatedOffer:', generatedOffer);
          const generatedOpportunity = {
            ...generatedOpportunityPart,
            offers: [generatedOffer],
          };
          const result = testMatch(criteriaMap.get(criteriaName), generatedOpportunity, {
            harvestStartTime,
          });
          console.log('result:', result);
          // expect(result.matchesCriteria).toEqual(tr)
          // expect(result).toHaveProperty('matchesCriteria', true);
          expect(result).toEqual({
            matchesCriteria: true,
            unmetCriteriaDetails: [],
          });
          // expect(result).to.deep.equal({
          //   matchesCriteria: true,
          //   unmetCriteriaDetails: [],
          // });
          // shape.opportunityConstraints.
        });
      }
    }
  }
});

const generatorsByType = {
  /**
   * @param {import('../types/TestDataShape').DateRangeNodeConstraint} constraint
   * @returns {fc.Arbitrary<string | null | undefined>}
   */
  'test:DateRangeNodeConstraint'(constraint) {
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
    }).map(date => date.toISOString());
    // console.log('test:DateRangeNodeConstraint', { constraint, minDate, maxDate });
    if (constraint.allowNull) {
      return fc.oneof(dateArbitrary, fc.constantFrom(null, undefined));
    }
    return dateArbitrary;
  },
  /**
   * @param {import('../types/TestDataShape').NumericNodeConstraint} constraint
   * @returns {fc.Arbitrary<number>}
   */
  NumericNodeConstraint(constraint) {
    const min = constraint.mininclusive ?? undefined;
    const max = constraint.maxinclusive ?? undefined;
    // TODO2 address
    // return fc.oneof(fc.integer({ min, max }), fc.float({ min, max }));
    if (min === max) {
      // fast-check otherwise produces NaN
      return fc.constant(min);
    }
    return fc.double({ min, max });
  },
  /**
   * @param {import('../types/TestDataShape').BooleanNodeConstraint} constraint
   * @returns {fc.Arbitrary<boolean>}
   */
  'test:BooleanNodeConstraint'(constraint) {
    return fc.constant(constraint.value);
  },
  /**
   * @param {import('../types/TestDataShape').OptionNodeConstraint<any, any>} constraint 
   */
  'test:OptionNodeConstraint'(constraint) {
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
   * @param {import('../types/TestDataShape').ArrayConstraint<any, any>} constraint 
   */
  'test:ArrayConstraint'(constraint) {
    if (constraint.includesAll) {
      return fc.constant(constraint.includesAll);
      // return fc.array(fc.constantFrom(...constraint.includesAll), { minLength: constraint.minLength ?? 0 });
    }
    if (constraint.datatype === 'oa:Terms') {
      // special handling because oa:Terms is not an enum constraint
      return fc.array(
        fc.record({
          '@type': fc.constant('Terms'),
          name: fc.string({ minLength: 1 }),
          url: fc.webUrl(),
          requiresExplicitConsent: fc.boolean(),
          dateModified: fc.date().map(date => date.toISOString()),
        }, {
          requiredKeys: ['@type', 'name', 'url', 'requiresExplicitConsent'],
        }),
        { minLength: constraint.minLength ?? 0 }
      )
    }
    const optionsPool = new Set(getDataTypeOptions(constraint.datatype));
    if (constraint.excludesAll) {
      for (const excluded of constraint.excludesAll) {
        optionsPool.delete(excluded);
      }
    }
    // TODO this might need to have no duplicates
    return fc.array(fc.constantFrom(...optionsPool), { minLength: constraint.minLength ?? 0 });
  },
  /**
   * @param {import('../testDataShape').NullNodeConstraint} constraint
   */
  'test:NullNodeConstraint'(constraint) {
    return fc.oneof(fc.constant(null), fc.constant(undefined));
  }
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
}

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
              `opportunityType must be specified when generating data for field: ${tripleConstraint.predicate}`
            );
          }
          const byType = fieldParentPathSpec.byType[opportunityType];
          if (!byType) {
            throw new Error(
              `fieldParentPathSpecs[${fieldName}].byType[${opportunityType}] not found`
            );
          }
          return [...byType, fieldName];
        }
        throw new Error(
          `No known parent path strategy found for fieldParentPathSpecs[${fieldName}]`
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
    // result[fieldName] = generated;
  }
  /* This is a special case in which the generated value is supposed to be a derived
  value i.e. startDate - validFromBeforeStartDate */
  if (result.validFromBeforeStartDate) {
    result.validFromBeforeStartDate = deriveDurationForDateBeforeStart(
      result.validFromBeforeStartDate,
      startDate
    );
  }
  // Same situation as for validFromBeforeStartDate
  if (result.latestCancellationBeforeStartDate) {
    result.latestCancellationBeforeStartDate = deriveDurationForDateBeforeStart(
      result.latestCancellationBeforeStartDate,
      startDate
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
        'https://schema.org/EventScheduled'
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
      ]
    case 'oa:OpenBookingFlowRequirement':
      return [
        'https://openactive.io/OpenBookingIntakeForm',
        'https://openactive.io/OpenBookingAttendeeDetails',
        'https://openactive.io/OpenBookingApproval',
        'https://openactive.io/OpenBookingNegotiation',
        'https://openactive.io/OpenBookingMessageExchange',
      ];
    // case 'oa:Terms':
    //   return [

    //   ];
    default:
      throw new Error(`Unexpected datatype ${datatype}`);
  }
}
