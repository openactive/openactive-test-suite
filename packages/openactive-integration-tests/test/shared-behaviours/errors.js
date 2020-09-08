const { expect } = require('chai');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {string} errorType e.g. IncompleteBrokerDetailsError
 * @param {number} statusCode Expected HTTP status
 * @param {() => ChakramResponse} getChakramResponse This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldReturnAnOpenBookingError(errorType, statusCode, getChakramResponse) {
  it(`should return a(n) ${errorType}`, () => {
    const chakramResponse = getChakramResponse();
    expect(chakramResponse.response).to.have.property('statusCode', statusCode);
    expect(chakramResponse.body).to.have.property('@type', errorType);
    expect(chakramResponse.body).to.have.property('@context');
  });
}

module.exports = {
  itShouldReturnAnOpenBookingError,
};
