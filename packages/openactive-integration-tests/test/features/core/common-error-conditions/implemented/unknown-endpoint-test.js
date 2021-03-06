const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

const { BOOKING_API_BASE } = global;

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/* ! This test will always fail hen run against a Reference Implementation that is running in dev mode.
This is because, in dev mode, the Reference Implementation returns an HTML error for 404 responses rather than
the expected JSON */
FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'unknown-endpoint',
  testName: 'Expect an UnknownOrIncorrectEndpointError for requests to unknown endpoints',
  testDescription: 'Send a request to an endpoint that does not exist, and expect an UnknownOrIncorrectEndpointError to be returned',
  numOpportunitiesUsedPerCriteria: 0,
  doesNotUseOpportunitiesMode: true,
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
        `${BOOKING_API_BASE}/ordeeeeers/abc`,
        { hi: 'there' },
        { timeout: 20000, headers: requestHelper.createHeaders() },
      );
    });

    itShouldReturnAnUnknownOrIncorrectEndpointError(() => response);
  });

  describe('Unknown Endpoint - GET', () => {
    let response;
    beforeAll(async () => {
      const requestHelper = new RequestHelper(logger);
      response = await requestHelper.get('UnknownEndpoint', `${BOOKING_API_BASE}/ordeeeeers/abc`, { timeout: 20000 });
    });

    itShouldReturnAnUnknownOrIncorrectEndpointError(() => response);
  });
});
