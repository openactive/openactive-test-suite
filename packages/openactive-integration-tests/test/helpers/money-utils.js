/**
 * If performing calculations on money values, use this function on the final
 * result to ensure that it does not accrue floating point errors.
 *
 * e.g.
 *
 * ```
 * > 55.2 * 3
 * 165.60000000000002
 * > fixCalculatedMoneyValue(55.2 * 3)
 * 165.6
 * ```
 *
 * @param {number} valuePounds
 * @returns {number}
 */
function fixCalculatedMoneyValue(valuePounds) {
  const valuePence = valuePounds * 100;
  return Math.round(valuePence) / 100;
}

module.exports = {
  fixCalculatedMoneyValue,
};
