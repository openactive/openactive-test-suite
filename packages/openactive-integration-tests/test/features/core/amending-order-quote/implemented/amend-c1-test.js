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
  testIdentifier: 'amend-c1',
  testName: 'Amend, at C1, an existing OrderQuote',
  testDescription: 'Run C1 with X opportunities, then - with the same Order UUID - run C1 with Y opportunities. Then, run B. The resulting Order should include confirmed bookings for only Y opportunities',
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
   * and then fetch some opportunities and run C1
   *
   * Note: This generates jest blocks like `beforeAll()`, `it()`, etc. Therefore, this must be run within a `describe()` block
   */
  function attemptC1WithNewState() {
    // Each scenario uses a separate state and flowHelper because they fetch separate opportunities
    const state = new RequestState(logger, {
      uuid,
    });
    const flow = new FlowHelper(state);

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

    describe('C1', () => {
      const c1 = (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
      // Confirm that the booking system has the same opportunities as we gave
      // it in our C1 request. This is especially important for the 2nd attempt,
      // as this verifies that the order was successfully amended.
      itFeedItemAndResponseItemShouldMatchIds(state, c1, () => state.c1Response);
    });

    return {
      state, flow,
    };
  }

  // N.B.: The following two tests must be performed sequentially - with
  // Second Attempt occurring after First Attempt.
  describe('First Attempt - C1', () => {
    attemptC1WithNewState();
  });
  /** Fetch some new opportunities and amend the existing order at C1, and then complete it */
  describe('Second Attempt - C1 -> B', () => {
    const { state, flow } = attemptC1WithNewState();

    describe('C2', () => {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
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
