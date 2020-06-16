/* eslint-disable no-unused-vars */
const config = require('config');
const chakram = require('chakram');
const chai = require('chai'); // The latest version for new features than chakram includes
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

const USE_RANDOM_OPPORTUNITIES = config.get('useRandomOpportunities');

// Only run this test if the test interface is in use
FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'test-interface',
  testFeatureImplemented: true,
  testIdentifier: 'create-opportunity',
  testName: 'Create opportunity',
  testDescription: 'Creates an opportunity using the booking system\'s test interface, and validates the resulting feed item matches the criteria.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  skipMultiple: true,
  runOnlyIf: !USE_RANDOM_OPPORTUNITIES,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.fetchOpportunities(orderItemCriteria, false);

    return chakram.wait();
  });

  describe('Get Opportunity Feed Items', function () {
    (new GetMatch({
      state, flow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });
});
