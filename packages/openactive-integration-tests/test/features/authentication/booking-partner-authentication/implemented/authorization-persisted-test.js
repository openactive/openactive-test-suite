/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const config = require('config');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetDatasetSite, OpenIDConnectFlow } = require('../../../../shared-behaviours');

const { BOOKING_PARTNER_CONFIG, SELLER_CONFIG, HEADLESS_AUTH } = global;

const BOOKING_PARTNER_STATIC_CONFIG = config.has('bookingPartnersForDynamicRegistration') ? config.get('bookingPartnersForDynamicRegistration') : {};

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'authorization-persisted',
  testName: 'Authorization persists when not requesting offline access',
  testDescription: 'When authorisation is requested without offline access and a user has already given permission, consent should not be required.',
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

    it('should include accessService.authenticationAuthority of the Open Booking API', () => {
      chakram.expect(state.datasetSite).to.have.schema('accessService.authenticationAuthority', {
        type: 'string',
      });
    });
  });

  describe('Open ID Connect Authentication', function () {
    (new OpenIDConnectFlow({
      logger,
    }))
      .discover(() => state.datasetSite.body.accessService.authenticationAuthority)
      .setClientCredentials(() => BOOKING_PARTNER_STATIC_CONFIG.authorizationPersisted.authentication.clientCredentials)
      .authorizeAuthorizationCodeFlow({
        loginCredentialsAccessor: () => SELLER_CONFIG.primary.authentication.loginCredentials,
        // assertFlowRequiredConsent: true, // TODO: reintroduce this when there's a test interface for auth actions (to remove client authorization)
        title: 'first attempt',
        authorizationParameters: {
          scope: 'openid', // No offline_access
        },
      })
      .authorizeAuthorizationCodeFlow({
        loginCredentialsAccessor: () => SELLER_CONFIG.primary.authentication.loginCredentials,
        // assertFlowRequiredConsent: false, // TODO: reintroduce this when there's a test interface for auth actions (to remove client authorization)
        title: 'second attempt',
        authorizationParameters: {
          scope: 'openid', // No offline_access
        },
      });
  });
});
