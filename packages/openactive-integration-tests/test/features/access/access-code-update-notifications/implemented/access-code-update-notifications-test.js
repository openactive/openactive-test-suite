const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const {
  FetchOpportunitiesFlowStage,
  C1FlowStage,
  C2FlowStage,
  FlowStageUtils,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
  BFlowStage,
} = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-code-update-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'access-code-update-notifications-test',
  testName: 'Access code updated after B request.',
  testDescription: 'Access code updated after B request is reflected in Orders feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, state, flow) => {
  const requestHelper = new RequestHelper(logger);

  // ## Initiate Flow Stages
  const defaultFlowStageParams = FlowStageUtils.createDefaultFlowStageParams({ requestHelper, logger });
  const fetchOpportunities = new FetchOpportunitiesFlowStage({
    ...defaultFlowStageParams,
    orderItemCriteriaList,
  });
  const c1 = new C1FlowStage({
    ...defaultFlowStageParams,
    prerequisite: fetchOpportunities,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
    }),
  });
  const c2 = new C2FlowStage({
    ...defaultFlowStageParams,
    prerequisite: c1,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
    }),
  });
  const b = new BFlowStage({
    ...defaultFlowStageParams,
    prerequisite: c2,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getOutput().totalPaymentDue,
    }),
  });
  const [simulateSellerCancellation, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Simulate Access Code Update (Test Interface Action)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:AccessCodeUpdateSimulateAction',
        objectType: 'Order',
        objectId: b.getOutput().orderId,
      }),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after Simulate Access Code Update)',
    },
  });
  // TODO TODO TODO finish

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerCancellation);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have orderItemStatus: SellerCancelled', () => {
      const orderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(orderItems).to.be.an('array').with.lengthOf(fetchOpportunities.getOutput().orderItems.length);
      for (const orderItem of orderItems) {
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/SellerCancelled');
        expect(orderItem).to.have.property('cancellationMessage').which.is.a('string');
      }
    });
  });

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

  describe('B', () => {
    const resp = (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('Simulate Access Code Update (Test Interface Action)', () => {
    const response = (new TestInterfaceAction({
      flow,
      logger,
      createActionFn: () => ({
        type: 'test:AccessCodeUpdateSimulateAction',
        objectType: 'Order',
        objectId: state.bResponse.body['@id'],
      }),
      completedFlowStage: 'B',
    }))
      .beforeSetup()
      .successChecks();
  });

  // TODO: Orders feed check
  // describe('Orders Feed (after U)', () => {
  //     const orderFeedUpdate = (new OrderFeedUpdate({
  //       state,
  //       flow,
  //       logger,
  //       ordersFeedMode: 'orders-feed-after-u',
  //     }))
  //       .beforeSetup()
  //       .successChecks()
  //       .validationTests();
  //Test that accesscode is updated!
  // it('Response should include accessCode array with appropriate fields (name and description) for each OrderItem', () => {
  //   chai.expect(state.bResponse.body.orderedItem).to.be.an('array');

  //   state.bResponse.body.orderedItem.forEach((orderItem, orderItemIndex) => {
  //     chai.expect(orderItem.accessCode).to.be.an('array');

  //     orderItem.accessCode.forEach((accessCode, accessCodeIndex) => {
  //       chai.expect(state.bResponse.body).to.have.nested.property(`orderedItem[${orderItemIndex}].accessCode[${accessCodeIndex}].name`).that.is.a('string');
  //       chai.expect(state.bResponse.body).to.have.nested.property(`orderedItem[${orderItemIndex}].accessCode[${accessCodeIndex}].description`).to.equal('updatedPinCode');
  //     });
  //   });
  // });
   // });
});
