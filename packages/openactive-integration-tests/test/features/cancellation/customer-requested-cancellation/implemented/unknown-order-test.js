const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');
const { CancelOrderFlowStage, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'unknown-order',
  testName: 'Expect a UnknownOrderError for an Order that does not exist',
  testDescription: 'Runs Order Cancellation for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned',
  doesNotUseOpportunitiesMode: true,
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  describe('UnknownOrderError for Customer Requested Cancellation', () => {
    const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger });
    const cancelOrder = new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite: null,
      getOrderItemIdArray: () => ['non-existent'],
      templateRef: 'nonExistantOrder',
    });

    FlowStageUtils.describeRunAndCheckIsValid(cancelOrder, () => {
      itShouldReturnAnOpenBookingError('UnknownOrderError', 404, () => cancelOrder.getOutput().httpResponse);
    });
  });
});
