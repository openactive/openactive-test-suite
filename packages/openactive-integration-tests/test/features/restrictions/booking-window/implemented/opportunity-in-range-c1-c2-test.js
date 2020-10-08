const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2 } = require('../../../../shared-behaviours');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'restriction',
  testFeature: 'booking-window',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-in-range-c1-c2',
  testName: 'Running C1 and C2 for opportunity in range should succeed',
  testDescription: 'Booking an opportunity within the specified booking window',
  testOpportunityCriteria: 'TestOpportunityBookableWithinValidFromBeforeStartDate',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  beforeAll(async () => {
    await state.fetchOpportunities(orderItemCriteria);
  });

  describe('Get Opportunity Feed Items', () => {
    (new GetMatch({
      state, flow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C1', () => {
    (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C2', () => {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });
});
