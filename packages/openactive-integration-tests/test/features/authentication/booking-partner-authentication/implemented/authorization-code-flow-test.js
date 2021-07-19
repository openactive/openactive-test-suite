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
  testIdentifier: 'authorization-code-flow',
  testName: 'Authorization Code Flow',
  testDescription: 'The Authorization Code Flow allows Sellers to authenticate with Booking Partners',
  doesNotUseOpportunitiesMode: true,
  surviveAuthenticationFailure: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  describe('Open ID Connect Authentication', function () {
    (new OpenIDConnectFlow({
      logger,
    }))
      .discover()
      .setClientCredentials(false, 'primary')
      .authorizeAuthorizationCodeFlow({
        loginCredentialsAccessor: () => SELLER_CONFIG.primary.authentication.loginCredentials,
        assertFlowRequiredConsent: null, // TODO: Add a test interface Action that resets consent for the specified user, and call it before this flow starts. Then this flow should assert consent.
        assertSellerIdClaim: SELLER_CONFIG.primary['@id'],
      })
      .refresh();
  });
});
