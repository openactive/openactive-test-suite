const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { OpenIDConnectFlow } = require('../../../../shared-behaviours');

const { SELLER_CONFIG } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-openid-authentication-for-multiple-sellers',
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
        /* TODO: Add a test interface Action that resets consent for the
        specified user, and call it before this flow starts. Then this flow
        should assert consent. */
        assertFlowRequiredConsent: null,
        assertSellerIdClaim: SELLER_CONFIG.primary['@id'],
      })
      .refresh();
  });
});
