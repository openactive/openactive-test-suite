const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { OrderDeletionFlowStage, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'order-deletion',
  testFeatureImplemented: true,
  testIdentifier: 'unknown-order',
  testName: 'Expect a UnknownOrderError for an Order that does not exist',
  testDescription: 'Runs Order Deletion for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned',
  doesNotUseOpportunitiesMode: true,
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
  const deleteOrder = new OrderDeletionFlowStage({
    ...FlowStageUtils.createSimpleDefaultFlowStageParams({
      logger, orderItemCriteriaList, describeFeatureRecord,
    }),
    prerequisite: null,
  });

  FlowStageUtils.describeRunAndCheckIsValid(deleteOrder, () => {
    itShouldReturnAnOpenBookingError('UnknownOrderError', 404, () => deleteOrder.getOutput().httpResponse);
  });
});
