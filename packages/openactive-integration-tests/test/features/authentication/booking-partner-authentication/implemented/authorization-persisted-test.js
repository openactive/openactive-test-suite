const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { OpenIDConnectFlow } = require('../../../../shared-behaviours');

const { SELLER_CONFIG } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'authorization-persisted',
  testName: 'Authorization persists when not requesting offline access',
  testDescription: 'When authorisation is requested without offline access and a user has already given permission, consent must not be required.',
  doesNotUseOpportunitiesMode: true,
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
        // Note we cannot assert assertFlowRequiredConsent === true as authorization could already have been granted from a previous test run
        loginCredentialsAccessor: () => SELLER_CONFIG.primary.authentication.loginCredentials,
        title: 'first attempt',
        authorizationParameters: {
          scope: 'openid openactive-identity', // No offline_access
        },
        assertSellerIdClaim: SELLER_CONFIG.primary['@id'],
      })
      .authorizeAuthorizationCodeFlow({
        loginCredentialsAccessor: () => SELLER_CONFIG.primary.authentication.loginCredentials,
        assertFlowRequiredConsent: false,
        title: 'second attempt',
        authorizationParameters: {
          scope: 'openid openactive-identity', // No offline_access
        },
        assertSellerIdClaim: SELLER_CONFIG.primary['@id'],
      });
  });
});
