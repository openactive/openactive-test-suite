const { expect } = require('chai');
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, Common } = require('../../../../shared-behaviours');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { RequestState } = require('../../../../helpers/request-state');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'leasing',
  testFeature: 'named-leasing',
  testFeatureImplemented: true,
  testIdentifier: 'lease-opportunity-capacity-update',
  testName: 'Leased spaces are unavailable for purchase by other users',
  testDescription: 'When an opportunity is leased, the capacity is decremented',
  testOpportunityCriteria: 'TestOpportunityBookableFiveSpaces',
  skipMultiple: true, // multiple tests fail, as we run out of slots/occurrences due to the repetition
},
(configuration, orderItemCriteria, featureIsImplemented, logger, parentState, parentFlow) => {
  /**
   * @param {number} expected
   * @param {C1|C2} stage
   * @param {() => ChakramResponse} responseAccessor
   */
  function itShouldHaveCapacity(expected, stage, responseAccessor) {
    Common.itForOrderItem(orderItemCriteria, parentState, stage, () => responseAccessor().body,
      'should decrement remaining slots',
      (feedOrderItem, responseOrderItem) => {
        if (responseOrderItem && responseOrderItem.orderedItem['@type'] === 'Slot') {
          expect(responseOrderItem).to.nested.include({
            'orderedItem.remainingUses': expected,
          });
        } else {
          expect(responseOrderItem).to.nested.include({
            'orderedItem.remainingAttendeeCapacity': expected,
          });
        }
      });
  }

  /**
   * @param {C1|C2} stage
   * @param {() => ChakramResponse} responseAccessor This is wrapped in a
   *   function because the actual response won't be available until the
   *   asynchronous before() block has completed.
   */
  function itShouldReturn409Conflict(stage, responseAccessor) {
    it('should return 409', () => {
      stage.expectResponseReceived();
      chakram.expect(responseAccessor()).to.have.status(409);
    });
  }

  /**
   * @param {RequestState} state
   * @param {number} count
   */
  function setOrderItemsOnState(state, count) {
    const orderItems = parentState.orderItems.filter(oi => !oi['test:control']);

    /* eslint-disable no-param-reassign */
    state.orderItems = [];
    let i = 0;

    for (const referenceOrderItem of orderItems) {
      for (let _ = 0; _ < count; _ += 1) {
        const orderItem = { ...referenceOrderItem };
        orderItem.position = i;
        state.orderItems.push(orderItem);

        i += 1;
      }
    }
  }

  beforeAll(async () => {
    await parentState.fetchOpportunities(orderItemCriteria);
    return chakram.wait();
  });

  describe('Get Opportunity Feed Items', () => {
    (new GetMatch({
      state: parentState, flow: parentFlow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('Lease three items (succeed)', () => {
    const state = new RequestState(logger);
    const flow = new FlowHelper(state, {
      stagesToSkip: new Set(['getMatch']),
    });

    beforeAll(() => {
      setOrderItemsOnState(state, 3);
    });

    describe('C1', () => {
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();
    });

    describe('C2', () => {
      const c2 = (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      // it should not take into account leased opportunities on this order
      itShouldHaveCapacity(5, c2, () => state.c2Response);
    });

    // Note: this test currently doesn't do anything, as the response is cached; once changes by @lukehesluke are merged, this test will be relevant
    describe('C2 (test idempotency)', () => {
      const c2 = (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      // it should be idempotent
      itShouldHaveCapacity(5, c2, () => state.c2Response);
    });
  });

  describe('Lease ten items (fail)', () => {
    const state = new RequestState(logger);
    const flow = new FlowHelper(state, {
      stagesToSkip: new Set(['getMatch']),
    });

    beforeAll(() => {
      setOrderItemsOnState(state, 10);
    });

    describe('C1', () => {
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();
    });

    describe('C2', () => {
      const c2 = (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();

      itShouldHaveCapacity(2, c2, () => state.c2Response);
      itShouldReturn409Conflict(c2, () => state.c2Response);

      it('should return correct numbers of OpportunityCapacityIsReservedByLeaseError and OpportunityHasInsufficientCapacityError', () => {
        c2.expectResponseReceived();

        const errors = state.c2Response.body.orderedItem.map(oi => oi.error && oi.error[0] && oi.error[0]['@type']);
        const factor = errors.length / 10;

        const count = (array, value) => array.filter(x => x === value).length;
        expect(count(errors, undefined)).to.equal(factor * 2);
        expect(count(errors, 'OpportunityCapacityIsReservedByLeaseError')).to.equal(factor * 3);
        expect(count(errors, 'OpportunityHasInsufficientCapacityError')).to.equal(factor * 5);
      });
    });
  });

  describe('Lease two items (succeed)', () => {
    const state = new RequestState(logger);
    const flow = new FlowHelper(state, {
      stagesToSkip: new Set(['getMatch']),
    });

    beforeAll(() => {
      setOrderItemsOnState(state, 2);
    });

    describe('C1', () => {
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();
    });

    describe('C2', () => {
      const c2 = (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      // it should only take into account leases on other orders
      itShouldHaveCapacity(2, c2, () => state.c2Response);
    });
  });

  describe('Lease one item (fail)', () => {
    const state = new RequestState(logger);
    const flow = new FlowHelper(state, {
      stagesToSkip: new Set(['getMatch']),
    });

    beforeAll(() => {
      state.orderItems = parentState.orderItems;
    });

    describe('C1', () => {
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();
    });

    describe('C2', () => {
      const c2 = (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();

      itShouldHaveCapacity(0, c2, () => state.c2Response);
      itShouldReturn409Conflict(c2, () => state.c2Response);
    });
  });
});
