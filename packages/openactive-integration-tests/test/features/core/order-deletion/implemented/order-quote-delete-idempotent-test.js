const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  OrderQuoteDeletionFlowStage,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');

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
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2Flow2(orderItemCriteriaList, logger);
  // // TODO TODO TODO use flowstageRecipes.c1c2 & maybe assertion after order quote deletion?
  // const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger });
  // const fetchOpportunities = new FetchOpportunitiesFlowStage({
  //   ...defaultFlowStageParams,
  //   orderItemCriteriaList,
  // });
  // const c1 = new C1FlowStage({
  //   ...defaultFlowStageParams,
  //   prerequisite: fetchOpportunities,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //   }),
  // });
  // const c2 = new C2FlowStage({
  //   ...defaultFlowStageParams,
  //   prerequisite: c1,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //   }),
  // });
  const deleteOrderQuote1 = new OrderQuoteDeletionFlowStage({
    ...defaultFlowStageParams,
    prerequisite: c2.getLastStage(),
  });
  const deleteOrderQuote2 = new OrderQuoteDeletionFlowStage({
    ...defaultFlowStageParams,
    prerequisite: deleteOrderQuote1,
  });
  // TODO TODO TODO assert capacity goes back up after Order Quote deletion (if leasing enabled)

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(deleteOrderQuote1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(deleteOrderQuote2);
});
