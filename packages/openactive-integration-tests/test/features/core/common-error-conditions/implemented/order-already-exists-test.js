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
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  describe('OrderAlreadyExistsError at B', () => {
    const uuid = generateUuid();

    /**
     * @param {Set<import('../../../../helpers/flow-helper').StageIdentifier>} [stagesToSkip]
     */
    function getMatchWithNewState(stagesToSkip) {
      const state = new RequestState(logger, { uuid });
      const flow = new FlowHelper(state, { stagesToSkip });

      // Get All Opportunities
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

      return { state, flow };
    }

    describe('First Run', () => {
      const { state, flow } = getMatchWithNewState();

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

      describe('B first time', function () {
        (new B({
          state, flow, logger,
        }))
          .beforeSetup()
          .successChecks()
          .validationTests();
      });
    });


    describe('Second Run', async () => {
      const { state, flow } = getMatchWithNewState(new Set(['C1', 'C2']));

      // Try B again with same UUID specified in state
      describe('B second time', function () {
        (new B({
          state, flow, logger,
        }))
          .beforeSetup()
          .validationTests();

        itShouldReturnAnOpenBookingError('OrderAlreadyExistsError', 500, () => state.bResponse);
      });
    });
  });
});
