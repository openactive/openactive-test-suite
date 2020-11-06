/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetDatasetSite, OpenIDConnectFlow } = require('../../../../shared-behaviours');

const { BOOKING_PARTNER_CONFIG } = global;

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'client-credentials-flow',
  testName: 'Client Credentials Flow and Access Orders Feed',
  testDescription: '...',
  runOnce: true,
  surviveAuthenticationFailure: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  describe('Get Authentication Base Url from Dataset Site', function () {
    (new GetDatasetSite({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    it('should include accessService.identityServerUrl of the Open Booking API', () => {
      chakram.expect(state.datasetSite).to.have.schema('accessService.identityServerUrl', {
        type: 'string',
      });
    });
  });

  describe('Open ID Connect Authentication', function () {
    const { clientCredentials } = BOOKING_PARTNER_CONFIG.secondary.authentication;
    const discoveryUrl = 'https://localhost:44353'; // state.datasetSite.accessService.endpointURL;

    (new OpenIDConnectFlow({
      logger,
    }))
      .discover(discoveryUrl)
      .setClientCredentials(clientCredentials)
      .clientCredentialsFlow();
  });
});
