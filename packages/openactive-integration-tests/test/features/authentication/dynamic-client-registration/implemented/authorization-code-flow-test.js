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

const BOOKING_PARTNER_STATIC_CONFIG = config.has('bookingPartnersForDynamicRegistration') ? config.get('bookingPartnersForDynamicRegistration') : {};

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
  surviveDynamicRegistrationFailure: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  describe('Get Authentication Base Url from Dataset Site', function () {
    (new GetDatasetSite({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    it('should include accessService.authenticationAuthority of the Open Booking API', () => {
      chakram.expect(state.datasetSite).to.have.schema('accessService.authenticationAuthority', {
        type: 'string',
      });
    });
  });

  describe('Open ID Connect Authentication', function () {
    (new OpenIDConnectFlow({
      logger,
    }))
      .discover(() => state.datasetSite.body.accessService.authenticationAuthority)
      .register(() => BOOKING_PARTNER_STATIC_CONFIG.dynamicPrimary.authentication.initialAccessToken)
      .authorizeAuthorizationCodeFlow({ loginCredentialsAccessor: () => SELLER_CONFIG.primary.authentication.loginCredentials })
      .refresh();
  });
});
