const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

const { BOOKING_API_BASE } = global;

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'unknown-endpoint',
  testName: 'Expect an UnknownOrIncorrectEndpointError for requests to unknown endpoints',
  testDescription: 'Send a request to an endpoint that does not exist, and expect an UnknownOrIncorrectEndpointError to be returned',
  numOpportunitiesUsedPerCriteria: 0,
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  /**
   * @param {() => ChakramResponse} getChakramResponse
   */
  const itShouldReturnAnUnknownOrIncorrectEndpointError = getChakramResponse => (
    itShouldReturnAnOpenBookingError('UnknownOrIncorrectEndpointError', 404, getChakramResponse));

  describe('Unknown Endpoint - JSON PUT', () => {
    let response;
    beforeAll(async () => {
      const requestHelper = new RequestHelper(logger);
      response = await requestHelper.put(
        'UnknownEndpoint',
        `${BOOKING_API_BASE}ordeeeeers/abc`,
        { hi: 'there' },
        { timeout: 10000, headers: requestHelper.createHeaders() },
      );
    });

    itShouldReturnAnUnknownOrIncorrectEndpointError(() => response);
  });

  describe('Unknown Endpoint - GET', () => {
    let response;
    beforeAll(async () => {
      const requestHelper = new RequestHelper(logger);
      response = await requestHelper.get('UnknownEndpoint', `${BOOKING_API_BASE}ordeeeeers/abc`, { timeout: 10000 });
    });

    itShouldReturnAnUnknownOrIncorrectEndpointError(() => response);
  });
});
