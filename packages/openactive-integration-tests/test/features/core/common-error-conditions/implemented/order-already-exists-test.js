const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');


FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'order-already-exists',
  testName: 'Expect an OrderAlreadyExistsError if an Order UUID exists but with different OrderItems',
  testDescription: 'Do a successful C1, C2, B run. Then, run B again for the same Order UUID, but with different OrderItems. Expect an OrderAlreadyExistsError.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  numOpportunitiesUsedPerCriteria: 1,
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  describe('OrderAlreadyExistsError at B', () => {
    // Get All Opportunities
    beforeAll(async () => {
      await state.fetchOpportunities(orderItemCriteria);
    });

    describe('Get Opportunity Feed Items for first run', () => {
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

    describe('C2', function () {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe('B first time ', function () {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe('Get Opportunity Feed Items for first run', () => {
      (new GetMatch({
        state, flow, logger, orderItemCriteria,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe('B second time with different OrderItems to the first B', function () {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();

      itShouldReturnAnOpenBookingError('OrderAlreadyExistsError', 400, () => state.bResponse);
    });
  });
});
