/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FetchOpportunitiesFlowStage,
  C1FlowStage,
  C2FlowStage,
  FlowStageUtils,
  BFlowStage,
} = require('../../../../helpers/flow-stages');
const { OrderDeletionFlowStage } = require('../../../../helpers/flow-stages/order-deletion');
const RequestHelper = require('../../../../helpers/request-helper');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'order-deletion',
  testFeatureImplemented: true,
  testIdentifier: 'order-quote-delete-idempotent',
  testName: 'Order quote successfully deleted, second delete does not change the state of the first delete',
  testDescription: 'Order Delete is idempotent - run C1, C2 then Order Delete twice - the Order Delete must return 204 in both cases',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, state) => {
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

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  describe('Delete Order Quote', async () => {
    it('Delete Order Quote should return 204 for second delete request also', async () => {
      const apiResponse = await requestHelper.deleteOrderQuote(defaultFlowStageParams.uuid, { sellerId: defaultFlowStageParams.sellerId });
      expect(apiResponse.response.statusCode).to.equal(204);
    });
  });
  describe('Delete Order Quote 2', async () => {
    it('Delete Order Quote should return 204 for second delete request also', async () => {
      const apiResponse = await requestHelper.deleteOrderQuote(defaultFlowStageParams.uuid, { sellerId: defaultFlowStageParams.sellerId });
      expect(apiResponse.response.statusCode).to.equal(204);
    });
  });
});
