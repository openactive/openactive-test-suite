/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
const config = require('config');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetDatasetSite, OpenIDConnectFlow } = require('../../../../shared-behaviours');

const { BOOKING_PARTNER_CONFIG, SELLER_CONFIG, HEADLESS_AUTH } = global;

const INITIAL_ACCESS_TOKEN = config.get('bookingPartnersForDynamicRegistration.dynamicPrimary.authentication.initialAccessToken');

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
    const initialAccessToken = INITIAL_ACCESS_TOKEN;
    const { loginCredentials } = SELLER_CONFIG.primary.authentication;
    const discoveryUrl = 'https://localhost:44353'; // state.datasetSite.accessService.endpointURL;

    (new OpenIDConnectFlow({
      logger,
    }))
      .discover(discoveryUrl)
      .register({
        initialAccessToken,
      })
      .authorizeAuthorizationCodeFlow(loginCredentials)
      .refresh();
  });
});
