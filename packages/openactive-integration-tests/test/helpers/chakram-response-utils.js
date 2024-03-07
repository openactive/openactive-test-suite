const { expect } = require('chai');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {ChakramResponse | null | undefined} response
 */
function isResponse20x(response) {
  if (!response || !response.response) return false;

  const { statusCode } = response.response;

  return statusCode >= 200 && statusCode < 300;
}

/**
 * @param {ChakramResponse | null | undefined} response
 */
function isResponse(response) {
  if (!response || !response.response) return false;

  const { statusCode } = response.response;

  return statusCode >= 200 && statusCode < 600;
}

/**
 * @param {ChakramResponse} firstResponse
 * @param {ChakramResponse} idempotentSecondResponse
 * @param {string} [message]
 */
function expectSuccessfulIdempotentRequestResponsesToBeDeepEqual(firstResponse, idempotentSecondResponse, message) {
  /**
   * @param {ChakramResponse} response
   */
  const prune = response => ({
    response: {
      statusCode: response.response.statusCode,
    },
    body: response.body,
  });
  expect(prune(idempotentSecondResponse)).to.deep.equal(prune(firstResponse), message);
}

module.exports = {
  isResponse20x,
  isResponse,
  expectSuccessfulIdempotentRequestResponsesToBeDeepEqual,
};
