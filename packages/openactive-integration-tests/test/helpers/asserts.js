const { strict: assert } = require('assert');

/**
 * @param {unknown} thing
 */
function assertIsNotNullish(thing) {
  assert.notEqual(thing, null);
  assert.notEqual(thing, undefined);
}

module.exports = {
  assertIsNotNullish,
};
