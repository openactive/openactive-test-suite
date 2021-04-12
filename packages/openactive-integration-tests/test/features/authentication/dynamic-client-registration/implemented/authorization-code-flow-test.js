/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { OpenIDConnectFlow } = require('../../../../shared-behaviours');

const { SELLER_CONFIG } = global;

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'dynamic-client-registration',
  testFeatureImplemented: true,
  testIdentifier: 'authorization-code-flow',
  testName: 'Authorization Code Flow and Book',
  testDescription: 'The Authorization Code Flow allows Sellers to authenticate with Booking Partners',
  runOnce: true,
  surviveAuthenticationFailure: true,
  surviveDynamicRegistrationFailure: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  describe('Open ID Connect Authentication', function () {
    (new OpenIDConnectFlow({
      logger,
    }))
      .discover()
      .register(true, 'dynamicPrimary')
      .authorizeAuthorizationCodeFlow({
        loginCredentialsAccessor: () => SELLER_CONFIG.primary.authentication.loginCredentials,
        assertFlowRequiredConsent: true,
        assertSellerIdClaim: SELLER_CONFIG.primary['@id'],
      })
      .refresh();
  });
});
