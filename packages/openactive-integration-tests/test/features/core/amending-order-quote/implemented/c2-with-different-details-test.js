const chai = require('chai');
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { B, C1, Common, GetMatch } = require('../../../../shared-behaviours');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { RequestState } = require('../../../../helpers/request-state');
const { generateUuid } = require('../../../../helpers/generate-uuid');
const { C2 } = require('../../../../shared-behaviours/c2');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'amending-order-quote',
  testFeatureImplemented: true,
  testIdentifier: 'c2-with-different-details',
  testName: 'Run C2 with different details from C1',
  testDescription: 'Run C1 with opportunity A, then - with the same Order UUID - C2 with opportunity B, then run B. Opportunity B should be booked',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // This test uses 2 opportunities, A & B
  numOpportunitiesUsedPerCriteria: 2,
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  // Both runs share the same UUID, so that the 2nd run is an amendment to the same Order
  const uuid = generateUuid();

  /**
   * Note: This generates an it() block. Therefore, this must be run within a describe() block.
   *
   * @param {RequestState} state
   * @param {C1 | B} stage
   * @param {() => import('chakram').ChakramResponse} responseAccessorFn function that gets the stage's response (e.g. `() => state.c1Response`)
   */
  const itFeedItemAndResponseItemShouldMatchIds = (state, stage, responseAccessorFn) => {
    Common.itForOrderItem(orderItemCriteria, state, stage, () => responseAccessorFn().body,
      'ID should match the one specified in the open data feed',
      (feedOrderItem, responseOrderItem) => {
        chai.expect(responseOrderItem).to.nested.include({
          'orderedItem.@id': feedOrderItem.orderedItem['@id'],
        });
      });
  };

  /**
   * Create a new state and flow helper (to represent a distinct batch of opportunities)
   * and then fetch some opportunities
   *
   * Note: This generates jest blocks like `beforeAll()`, `it()`, etc. Therefore, this must be run within a `describe()` block
   */
  function getOpportunityFeedItemsWithNewState() {
    // Each scenario uses a separate state and flowHelper because they fetch separate opportunities
    const state = new RequestState(logger, {
      uuid,
    });
    const flow = new FlowHelper(state, {
      doRunPreviousStages: false,
    });

    beforeAll(async () => {
      await state.fetchOpportunities(orderItemCriteria);
      await chakram.wait();
    });

    describe('Get Opportunity Feed Items', () => {
      (new GetMatch({
        state, flow, logger, orderItemCriteria,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    return {
      state, flow,
    };
  }

  // N.B.: The following two tests must be performed sequentially - with
  // Second Attempt occurring after First Attempt.
  describe('First Attempt - C1', () => {
    const { state, flow } = getOpportunityFeedItemsWithNewState();

    describe('C1', () => {
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });
  });

  /** Fetch some new opportunities, amend the existing order with a C2 request, and then complete it */
  describe('Second Attempt - C2 -> B', () => {
    const { state, flow } = getOpportunityFeedItemsWithNewState();

    describe('C2', () => {
      const c2 = (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      // Ensure that the 2nd batch has overridden the 1st batch
      itFeedItemAndResponseItemShouldMatchIds(state, c2, () => state.c2Response);
    });

    describe('B', () => {
      const b = (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      // Again, the completed order should be using our 2nd batch of order items
      // i.e. it should have been successfully amended.
      itFeedItemAndResponseItemShouldMatchIds(state, b, () => state.bResponse);
    });
  });
});
