/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetDatasetSite } = require('../../../../shared-behaviours');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'dataset-site',
  testFeatureImplemented: true,
  testIdentifier: 'dataset-site-jsonld-valid',
  testName: 'Dataset Site JSON-LD valid',
  testDescription: 'Validates the JSON-LD within the dataset site, using the microservice as a caching proxy. If you make changes to the dataset site, you must restart the microservice.',
  doesNotUseOpportunitiesMode: true,
  supportsApproval: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  describe('Get Dataset Site', function () {
    (new GetDatasetSite({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    it('should include accessService.endpointURL of the Open Booking API', () => {
      chakram.expect(state.datasetSite).to.have.schema('accessService.endpointURL', {
        type: 'string',
      });
    });

    // TODO does validator check that endpointURL does not end in a `/` (as per Open API 3 Base URL https://swagger.io/docs/specification/api-host-and-base-path/)
    it('should include accessService.endpointURL that does not end in a trailing "/"', () => {
      chai.expect(state.datasetSite.body.accessService.endpointURL).not.to.match(/\/$/g, 'a trailing /');
    });
  });
});
