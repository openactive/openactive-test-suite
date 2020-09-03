const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');

const { BOOKING_API_BASE } = global;

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
  describe('Unknown Endpoint - JSON PUT', () => {
    it('should return an UnknownOrIncorrectEndpointError', async () => {
      const requestHelper = new RequestHelper(logger);
      const response = await requestHelper.put('UnknownEndpoint', `${BOOKING_API_BASE}ordeeeeers/abc`, { hi: 'there' }, { timeout: 10000 });
      expect(response.response).to.have.property('statusCode', 404);
      expect(response.body).to.have.property('@type', 'UnknownOrIncorrectEndpointError');
      expect(response.body).to.have.property('@context');
    });
  });
  describe('Unknown Endpoint - GET', () => {
    it('should return an UnknownOrIncorrectEndpointError', async () => {
      const requestHelper = new RequestHelper(logger);
      const response = await requestHelper.get('UnknownEndpoint', `${BOOKING_API_BASE}ordeeeeers/abc`, { timeout: 10000 });
      expect(response.response).to.have.property('statusCode', 404);
      expect(response.body).to.have.property('@type', 'UnknownOrIncorrectEndpointError');
      expect(response.body).to.have.property('@context');
    });
  });
});
