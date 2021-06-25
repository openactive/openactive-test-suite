const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { OpenIDConnectFlow } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-openid-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'client-credentials-flow',
  testName: 'Client Credentials Flow and Access Orders Feed',
  testDescription: '...',
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
      .clientCredentialsFlow();
  });
});
