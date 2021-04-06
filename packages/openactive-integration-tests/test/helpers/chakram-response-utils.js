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

module.exports = {
  isResponse20x,
  isResponse,
};
