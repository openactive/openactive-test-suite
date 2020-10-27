const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const { GetMatch, C1, C2, TestInterfaceAction, B } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'seller-requested-replacement',
  testFeatureImplemented: true,
  testIdentifier: 'book-and-seller-replace-all-items',
  testName: 'Bookm seller replaces order items.',
  testDescription: 'A successful replacement of order items by seller.',
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  this.requestHelper = new RequestHelper(logger);

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
    (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('Simulate Seller Replacement (Test Interface Action)', () => {
    (new TestInterfaceAction({
      flow,
      logger,
      createActionFn: () => ({
        type: 'test:ReplacementSimulateAction',
        objectType: 'Order',
        objectId: state.bResponse.body['@id'],
      }),
      completedFlowStage: 'B',
    }))
      .beforeSetup()
      .successChecks();
  });
});
