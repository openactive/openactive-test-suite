const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  OrderDeletionFlowStage,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');

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
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);

  const deleteStage1 = new OrderDeletionFlowStage({
    ...defaultFlowStageParams,
    prerequisite: b,
  });

  const deleteStage2 = new OrderDeletionFlowStage({
    ...defaultFlowStageParams,
    prerequisite: deleteStage1,
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
