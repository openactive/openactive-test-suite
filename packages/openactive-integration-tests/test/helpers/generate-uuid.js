const { v4: uuidv4 } = require('uuid');

/**
 * Generate a random UUID. Note a fully random (V4) UUID must be used as Jest runs tests in parallel,
 * so keeping track of a single sequential Order identifier to use for a deterministic UUID (V3 or V5) is not possible.
 */
function generateUuid() {
  return uuidv4();
}

module.exports = {
  generateUuid,
};
