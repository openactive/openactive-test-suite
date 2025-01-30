/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { OpenIDConnectFlow } = require('../../../../shared-behaviours');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'dynamic-client-registration',
  testFeatureImplemented: true,
  testIdentifier: 'client-credentials-flow',
  testName: 'Client Credentials Flow',
  testDescription: 'Client Credentials Flow allows Booking Partners to access the Orders Feed',
  doesNotUseOpportunitiesMode: true,
  surviveAuthenticationFailure: true,
  surviveDynamicRegistrationFailure: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  describe('Open ID Connect Authentication', function () {
    (new OpenIDConnectFlow({
      logger,
    }))
      .discover()
      .register(true, 'dynamicSecondary')
      .clientCredentialsFlow();
  });
});
