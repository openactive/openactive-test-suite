const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetDatasetSite } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-openid-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'authentication-authority-present',
  testName: 'authenticationAuthority present in dataset site',
  testDescription: 'The authenticationAuthority must be specified within the dataset site to facilitate Open ID Connect authentication',
  doesNotUseOpportunitiesMode: true,
  surviveAuthenticationFailure: true,
  surviveDynamicRegistrationFailure: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  describe('Get Authentication Base Url from Dataset Site', function () {
    const getDatasetSite = (new GetDatasetSite({ logger })
      .beforeSetup()
      .successChecks()
      .validationTests());

    it('should include accessService.authenticationAuthority containing Open ID Connect Issuer base URL', () => {
      chakram.expect(getDatasetSite.datasetSite).to.have.schema('accessService.authenticationAuthority', {
        type: 'string',
      });
    });
  });
});
