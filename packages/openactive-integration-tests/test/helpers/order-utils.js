/**
 * Utilities for getting data out of Orders
 */
const { isNil, isString, isNumber } = require('lodash');
const { path, pipe } = require('ramda');

/**
 * @typedef {import('./flow-stages/flow-stage').Prepayment} Prepayment
 * @typedef {import('./flow-stages/fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('./flow-stages/flow-stage').OrderItemIntakeForm} OrderItemIntakeForm
 */

/**
 * Asserts that a value is null/undefined or satisfies some predicate.
 * If it is not null/undefined and does not satisfy the predicate, an error will
 * be thrown.
 *
 * These assertions are used in the below get.. functions so that the return type
 * is guarantueed to be of the desired type, even though the order object itself
 * is of unknown type due to being generated in an external system.
 *
 * @template TType
 * @param {(value: unknown) => value is TType} predicate
 * @param {string} errorMessage
 */
function assertValueSatisfiesPredicateIfExists(predicate, errorMessage) {
  /**
   * @param {unknown | null | undefined} value
   * @returns {TType | null | undefined}
   */
  const fn = (value) => {
    if (isNil(value)) {
      return value;
    }
    if (!predicate(value)) {
      throw new Error(errorMessage);
    }
    return value;
  };
  return fn;
}

/**
 * @template TArrayValue
 * @param {TArrayValue[]} array
 */
function isInArray(array) {
  /**
   * @param {unknown} value
   * @returns {value is TArrayValue}
   */
  const predicate = value => (
    // TS is concerned that value may not be of the type that is contained in the
    // array. i.e. it might not be a TArrayValue. But this is fine. An array.includes
    // can take any kind of value and won't break.
    array.includes(/** @type {any} */(value)));
  return predicate;
}

/** @type {(order: unknown) => number | null | undefined} */
const getTotalPaymentDueFromOrder = pipe(
  path(['totalPaymentDue', 'price']),
  assertValueSatisfiesPredicateIfExists(isNumber, 'totalPaymentDue.price is not a number'),
);

/** @type {(order: unknown) => Prepayment | null | undefined} */
const getPrepaymentFromOrder = pipe(
  path(['totalPaymentDue', 'prepayment']),
  assertValueSatisfiesPredicateIfExists(
    isInArray(['https://openactive.io/Required', 'https://openactive.io/Optional', 'https://openactive.io/Unavailable']),
    'totalPaymentDue.prepayment is not a valid value',
  ),
);

/** @type {(order: unknown) => string | null | undefined} */
const getOrderProposalVersion = pipe(
  path(['orderProposalVersion']),
  assertValueSatisfiesPredicateIfExists(isString, 'orderProposalVersion is not a string'),
);

/** @type {(order: unknown) => string | null | undefined} */
const getOrderId = pipe(
  path(['@id']),
  assertValueSatisfiesPredicateIfExists(isString, 'orderId (@id) is not a string'),
);

/**
 * @param {{
 * orderedItem: OrderItem[]
 * }} order
 */
function createPositionOrderIntakeFormMap(order) {
  /** @type {{[k: string]:OrderItemIntakeForm}} */
  const map = {};

  for (const orderItem of order.orderedItem) {
    if (!isNil(orderItem.orderItemIntakeForm)) {
      map[String(orderItem.position)] = orderItem.orderItemIntakeForm;
    }
  }
  return map;
}

module.exports = {
  getTotalPaymentDueFromOrder,
  getPrepaymentFromOrder,
  getOrderProposalVersion,
  getOrderId,
  createPositionOrderIntakeFormMap,
};
