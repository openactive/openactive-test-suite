/**
 * @typedef {import('./twoPhaseListeners').Listener} Listener
 */

/**
 * @param {import('express').Response} res
 * @param {Map<string, Listener>} listenersMap
 * @param {string} type e.g. "opportunities"
 * @param {string} listenerId
 * @returns {boolean} If false, this caused an error.
 */
function error409IfListenerAlreadyExists(res, listenersMap, type, listenerId) {
  if (listenersMap.has(listenerId)) {
    res.status(409).send({
      error: `A listener for ${type} with ID: "${listenerId}" has already been registered. The same ${type === 'opportunities' ? 'Opportunity @id' : 'Order UUID'} must not be used across multiple tests, or listened for multiple times concurrently within the same test.`,
    });
    return false;
  }
  return true;
}

module.exports = {
  error409IfListenerAlreadyExists,
};
