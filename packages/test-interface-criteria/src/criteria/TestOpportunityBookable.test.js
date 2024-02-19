// TODO make this enumerate all criteria
const { faker } = require('@faker-js/faker');
const fc = require('fast-check');
const { DateTime } = require('luxon');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { getTestDataShapeExpressions } = require('..');

test('Data generated via the testDataShape satisfies the opportunityConstraints and offerConstraints', () => {
  // const shape = TestOpportunityBookable.testDataShape({
  //   harvestStartTime: DateTime.now(),
  //   harvestStartTimeTwoHoursLater: DateTime.now().plus({ hours: 2 }),
  // });
  const shapeExpressions = getTestDataShapeExpressions('TestOpportunityBookable', 'OpenBookingSimpleFlow', 'ScheduledSession', {
    harvestStartTime: DateTime.now().toUTC().toISO(),
  });
  console.log('shapeExpressions:', shapeExpressions);
  const generated = generateOpportunityConstraints(shapeExpressions['test:testOpportunityDataShapeExpression']);
  console.log('generated:', generated);
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
      return fc.oneof(dateArbitrary, fc.constant(null), fc.constant(undefined));
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
    // TODO3 not sure what to do here yet
    return fc.constant('TODO');
  },
  /**
   * @param {import('../types/TestDataShape').ArrayConstraint<any, any>} constraint 
   */
  'test:ArrayConstraint'(constraint) {
    // TODO3 not sure what to do here yet
    return fc.constant('TODO');
  },
  /**
   * @param {import('../testDataShape').NullNodeConstraint} constraint
   */
  'test:NullNodeConstraint'(constraint) {
    return fc.oneof(fc.constant(null), fc.constant(undefined));
  }
  // TODO3 here i am
  // ValueType
};

/**
 * @param {ReturnType<typeof getTestDataShapeExpressions>['test:testOpportunityDataShapeExpression']} opportunityDataShapeExpression
 */
function generateOpportunityConstraints(opportunityDataShapeExpression) {
  const result = {};
  for (const tripleConstraint of opportunityDataShapeExpression) {
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
    const generated = fc.sample(/** @type {any} */(arbitrary), 1);
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
