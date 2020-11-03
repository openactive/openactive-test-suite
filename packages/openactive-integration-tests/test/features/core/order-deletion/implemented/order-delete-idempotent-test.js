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
const { OrderDeletionFlowStage } = require('../../../../helpers/flow-stages/deleteStage');
const RequestHelper = require('../../../../helpers/request-helper');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'order-deletion',
  testFeatureImplemented: true,
  testIdentifier: 'order-delete-idempotent',
  testName: 'Order successfully deleted, second delete does not change the state of the first delete',
  testDescription: 'Order Delete is idempotent - run C1, C2, and B then Order Delete twice - the Order Delete must return 204 in both cases',
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
  const b = new BFlowStage({
    ...defaultFlowStageParams,
    prerequisite: c2,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getOutput().totalPaymentDue,
    }),
  });

  const deleteStage1 = new OrderDeletionFlowStage({
    ...defaultFlowStageParams,
    prerequisite: b,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: b.getOutput().totalPaymentDue,
    }),
  });

  const deleteStage2 = new OrderDeletionFlowStage({
    ...defaultFlowStageParams,
    prerequisite: deleteStage1,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: b.getOutput().totalPaymentDue,
    }),
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(deleteStage1, () => {
    it('Delete Order should return 204', async () => {
      const apiResponse = deleteStage1.getOutput().httpResponse;
      expect(apiResponse.response.statusCode).to.equal(204);
    });
  });

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(deleteStage2, () => {
    it('Delete Order should return 204 for second delete request also', async () => {
      const apiResponse = deleteStage2.getOutput().httpResponse;
      expect(apiResponse.response.statusCode).to.equal(204);
    });
  });
});
