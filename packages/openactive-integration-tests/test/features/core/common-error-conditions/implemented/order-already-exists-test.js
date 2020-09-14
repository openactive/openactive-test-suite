const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { generateUuid } = require('../../../../helpers/generate-uuid');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'order-already-exists',
  testName: 'Expect an OrderAlreadyExistsError if an Order UUID exists but with different OrderItems',
  testDescription: 'Do a successful C1, C2, B run. Then, run B again for the same Order UUID, but with different OrderItems. Expect an OrderAlreadyExistsError.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookablePaid',
  numOpportunitiesUsedPerCriteria: 1,
  skipMultiple: true,
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  describe('OrderAlreadyExistsError at B', () => {
    const uuid = generateUuid();
    const state = new RequestState(logger, { uuid });
    const flow = new FlowHelper(state);

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

    // Run C1
    describe('C1', () => {
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    // Run C2
    describe('C2', () => {
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

    it('should get a new set of OrderItems and try booking again, but with the same UUID', async () => {
      // The following requests are not using the helper functions that are used above. This is because
      // those requests are cached (using pMemoize) and therefore would not go back to the Booking System.

      // Get new OrderItems
      await state.getMatch();

      // Try B again with same UUID specified in state
      await state.putOrder();
    });

    itShouldReturnAnOpenBookingError('OrderAlreadyExistsError', 500, () => state.bResponse);
  });
});
