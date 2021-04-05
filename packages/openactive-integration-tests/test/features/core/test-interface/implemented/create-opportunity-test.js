const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch } = require('../../../../shared-behaviours');
const { getConfigVarOrThrow } = require('../../../../helpers/config-utils');

const USE_RANDOM_OPPORTUNITIES = getConfigVarOrThrow('integrationTests', 'useRandomOpportunities');

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
  runOnlyIf: USE_RANDOM_OPPORTUNITIES,
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
