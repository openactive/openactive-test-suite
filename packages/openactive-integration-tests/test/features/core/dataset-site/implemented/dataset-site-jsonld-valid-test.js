const chakram = require('chakram');
const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetDatasetSite } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'dataset-site',
  testFeatureImplemented: true,
  testIdentifier: 'dataset-site-jsonld-valid',
  testName: 'Dataset Site JSON-LD valid',
  testDescription: 'Validates the JSON-LD within the dataset site, using the microservice as a caching proxy. If you make changes to the dataset site, you must restart the microservice.',
  doesNotUseOpportunitiesMode: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  describe('Get Dataset Site', () => {
    const getDatasetSite = (new GetDatasetSite({ logger })
      .beforeSetup()
      .successChecks()
      .validationTests());

    it('should include accessService.endpointUrl of the Open Booking API', () => {
      chakram.expect(getDatasetSite.datasetSite).to.have.schema('accessService.endpointUrl', {
        type: 'string',
      });
    });

    /* TODO have validator check that endpointUrl does not end in a `/` (as per
    Open API 3 Base URL
    https://swagger.io/docs/specification/api-host-and-base-path/). See GitHub
    issue: https://github.com/openactive/data-model-validator/issues/450 */
    it('should include accessService.endpointUrl that does not end in a trailing "/"', () => {
      chai.expect(getDatasetSite.datasetSite.body.accessService.endpointUrl).not.to.match(/\/$/g, 'a trailing /');
    });
  });
});
