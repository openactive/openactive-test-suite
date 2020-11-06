/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetDatasetSite } = require('../../../../shared-behaviours');
const { OpenActiveOpenIdTestClient, recordWithIntercept } = require('@openactive/openactive-openid-test-client');

const { BOOKING_PARTNER_CONFIG } = global;

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'client-credentials-flow',
  testName: 'Client Credentials Flow and Access Orders Feed',
  testDescription: '...',
  runOnce: true,
  surviveAuthenticationFailure: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  describe('Get Authentication Base Url from Dataset Site', function () {
    (new GetDatasetSite({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    it('should include accessService.identityServerUrl of the Open Booking API', () => {
      chakram.expect(state.datasetSite).to.have.schema('accessService.identityServerUrl', {
        type: 'string',
      });
    });
  });

  describe('Open ID Connect Authentication', function () {
    const logWithIntercept = async (...args) => await recordWithIntercept(entry => logger.recordLogEntry(entry), ...args);
    const client = new OpenActiveOpenIdTestClient(global.MICROSERVICE_BASE);
    const { initialAccessToken } = BOOKING_PARTNER_CONFIG.secondary.authentication;
    const discoveryUrl = 'https://localhost:44353'; // state.datasetSite.accessService.endpointURL;
    const keys = {};

    it('should complete Discovery successfully', async function () {
      // Discovery
      const issuer = await logWithIntercept('Discovery', () => client.discover(discoveryUrl));
      console.log('Discovered issuer %s %O\n\n', issuer.issuer, issuer.metadata);
    });
    it('should complete Dynamic Client Registration successfully', async function () {
      // Dynamic Client Registration
      const { registration, clientId, clientSecret } = await logWithIntercept('Dynamic Client Registration', () => client.register(initialAccessToken));
      keys.clientId = clientId;
      keys.clientSecret = clientSecret;
      console.log('Dynamic Client Registration: %O\n\n', registration);
    });
    it('should complete Client Credentials Flow successfully', async function () {
      chai.expect(keys).to.have.property('clientId');
      chai.expect(keys).to.have.property('clientSecret');
      // Client Credentials Flow
      const { tokenSet: clientCredentialsTokenSet } = await logWithIntercept('Client Credentials Flow', () => client.authorizeClientCredentialsFlow(keys.clientId, keys.clientSecret));
      console.log('Client Credentials Flow: received and validated tokens %j\n\n', clientCredentialsTokenSet);
    });
  });
});
