// TODO make this enumerate all criteria
const { faker } = require('@faker-js/faker');
const fc = require('fast-check');
const { DateTime } = require('luxon');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { getTestDataShapeExpressions, testMatch, criteriaMap } = require('..');

// TODO many samples
test('Data generated via the testDataShape satisfies the opportunityConstraints and offerConstraints', () => {
  // const shape = TestOpportunityBookable.testDataShape({
  //   harvestStartTime: DateTime.now(),
  //   harvestStartTimeTwoHoursLater: DateTime.now().plus({ hours: 2 }),
  // });
  const harvestStartTime = DateTime.now().toUTC().toISO();
  const shapeExpressions = getTestDataShapeExpressions('TestOpportunityBookable', 'OpenBookingSimpleFlow', 'ScheduledSession', {
    harvestStartTime,
  });
  console.log('shapeExpressions:', shapeExpressions);
  const generatedOpportunityPart = generateForShapeDataExpressions(shapeExpressions['test:testOpportunityDataShapeExpression']);
  console.log('generatedOpportunityPart:', generatedOpportunityPart);
  const generatedOffer = generateForShapeDataExpressions(shapeExpressions['test:testOfferDataShapeExpression']);
  console.log('generatedOffer:', generatedOffer);
  const generatedOpportunity = {
    ...generatedOpportunityPart,
    offers: generatedOffer,
  };
  const result = testMatch(criteriaMap.get('TestOpportunityBookable'), generatedOpportunity, {
    harvestStartTime,
  });
  console.log('result:', result);
  // shape.opportunityConstraints.
});

const generatorsByType = {
  /**
   * @param {import('../types/TestDataShape').DateRangeNodeConstraint} constraint
   * @returns {fc.Arbitrary<Date | null | undefined>}
   */
  'test:DateRangeNodeConstraint'(constraint) {
    const minDate = constraint.minDate
      ? DateTime.fromISO(constraint.minDate).toJSDate()
      : undefined;
    const maxDate = constraint.maxDate
      ? DateTime.fromISO(constraint.maxDate).toJSDate()
      : undefined;
    const dateArbitrary = fc.date({
      max: maxDate,
      min: minDate,
    });
    if (constraint.allowNull) {
      return fc.oneof(dateArbitrary, fc.constantFrom(null, undefined));
    }
    return dateArbitrary;
    // fc.oneof
  },
  /**
   * @param {import('../types/TestDataShape').NumericNodeConstraint} constraint
   * @returns {fc.Arbitrary<number>}
   */
  NumericNodeConstraint(constraint) {
    const min = constraint.mininclusive ?? undefined;
    const max = constraint.maxinclusive ?? undefined;
    return fc.oneof(fc.integer({ min, max }), fc.float({ min, max }));
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
      return fc.array(fc.constantFrom(...constraint.includesAll), { minLength: constraint.minLength ?? 0 });
    }
    if (constraint.datatype === 'oa:Terms') {
      // special handling because oa:Terms is not an enum constraint
      return fc.array(
        fc.record({
          '@type': fc.constant('Terms'),
          name: fc.string({ minLength: 1}),
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

/**
 * @param {ReturnType<typeof getTestDataShapeExpressions>['test:testOpportunityDataShapeExpression']} shapeExpressions
 */
function generateForShapeDataExpressions(shapeExpressions) {
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
    const constraint = tripleConstraint.valueExpr;
    const generator = generatorsByType[constraint['@type']];
    if (!generator) {
      throw new Error(`No generator for type ${constraint['@type']}`);
    }
    const arbitrary = generator(/** @type {any} */(constraint));
    const [generated] = fc.sample(/** @type {any} */(arbitrary), 1);
    result[fieldName] = generated;
  }
  return result;
  // for (const [key, constraint] of Object.entries(opportunityDataShapeExpression)) {
  //   const generator = generatorsByType[constraint['@type']];
  //   if (!generator) {
  //     throw new Error(`No generator for type ${constraint['@type']}`);
  //   }
  //   const arbitrary = generator(/** @type {any} */(constraint));
  //   const generated = fc.sample(/** @type {any} */(arbitrary), 1);
  //   const nonNamespacedField = /^(^:)+:(.+)$/.exec(key)[2];
  //   result[nonNamespacedField] = generated;
  // }
  // if (opportunityConstraints['schema:startDate']) {
  //   result.startDate = fc.sample(
  //     generatorsByType['test:DateRangeNodeConstraint'](opportunityConstraints['schema:startDate']),
  //     1,
  //   );
  // }
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
