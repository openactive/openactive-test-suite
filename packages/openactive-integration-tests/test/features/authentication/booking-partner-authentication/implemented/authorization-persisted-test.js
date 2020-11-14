/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { OpenIDConnectFlow } = require('../../../../shared-behaviours');

const { SELLER_CONFIG } = global;

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
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  describe('Open ID Connect Authentication', function () {
    (new OpenIDConnectFlow({
      logger,
    }))
      .discover()
      .setClientCredentials(true, 'authorizationPersisted')
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
