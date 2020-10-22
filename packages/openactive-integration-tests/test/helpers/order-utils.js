/**
 * Utilities for getting data out of Orders
 */
const { isNil, isString, isNumber } = require('lodash');
const { path, pipe } = require('ramda');

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

/** @type {(order: unknown) => number | null | undefined} */
const getTotalPaymentDueFromOrder = pipe(
  path(['totalPaymentDue', 'price']),
  assertValueSatisfiesPredicateIfExists(isNumber, 'totalPaymentDue is not a number'),
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

module.exports = {
  getTotalPaymentDueFromOrder,
  getOrderProposalVersion,
  getOrderId,
};
