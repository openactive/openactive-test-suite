/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const config = require('config');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetDatasetSite, OpenIDConnectFlow } = require('../../../../shared-behaviours');

const { BOOKING_PARTNER_CONFIG, SELLER_CONFIG, HEADLESS_AUTH } = global;

const CLIENT_CREDENTIALS = config.get('bookingPartnersForDynamicRegistration.authorizationPersisted.authentication.clientCredentials');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'authorization-persisted',
  testName: 'Authorization Code Flow and Book',
  testDescription: 'When authorisation is requested without offline access and a user has already given permission, consent should not be required.',
  runOnce: true,
  surviveAuthenticationFailure: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  describe('Open ID Connect Authentication', function () {
    const { loginCredentials } = SELLER_CONFIG.primary.authentication;
    const discoveryUrl = 'https://localhost:44353'; // state.datasetSite.accessService.endpointURL;

    (new OpenIDConnectFlow({
      logger,
    }))
      .discover(discoveryUrl)
      .setClientCredentials(CLIENT_CREDENTIALS)
      .authorizeAuthorizationCodeFlow({
        ...loginCredentials,
        assertFlowRequiredConsent: true,
        title: 'first attempt',
        authorizationParameters: {
          scope: 'openid', // No offline_access
        },
      })
      .authorizeAuthorizationCodeFlow({
        ...loginCredentials,
        assertFlowRequiredConsent: false,
        title: 'second attempt',
        authorizationParameters: {
          scope: 'openid', // No offline_access
        },
      })
      .refresh();
  });
});
