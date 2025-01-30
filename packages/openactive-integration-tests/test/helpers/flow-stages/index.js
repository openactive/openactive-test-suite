const { BFlowStage } = require('./b');
const { C1FlowStage } = require('./c1');
const { C2FlowStage } = require('./c2');
const { CancelOrderFlowStage } = require('./cancel-order');
const { CustomerRejectOrderProposalFlowStage } = require('./customer-reject-orderproposal');
const { OrderDeletionFlowStage } = require('./order-deletion');
const { FetchOpportunitiesFlowStage } = require('./fetch-opportunities');
const { FlowStageRecipes } = require('./flow-stage-recipes');
const { FlowStageUtils } = require('./flow-stage-utils');
const { OpportunityFeedUpdateCollectorFlowStage, OpportunityFeedUpdateFlowStageUtils, OpportunityFeedUpdateListenerFlowStage } = require('./opportunity-feed-update');
const { OrderFeedUpdateFlowStageUtils, OrderFeedUpdateListener, OrderFeedUpdateCollector } = require('./order-feed-update');
const { PFlowStage } = require('./p');
const { TestInterfaceActionFlowStage } = require('./test-interface-action');
const { OrderQuoteDeletionFlowStage } = require('./order-quote-deletion');
const { EnsureOrderIsNotPresentFlowStage } = require('./ensure-order-is-not-present');

module.exports = {
  FetchOpportunitiesFlowStage,
  C1FlowStage,
  C2FlowStage,
  BFlowStage,
  PFlowStage,
  CancelOrderFlowStage,
  CustomerRejectOrderProposalFlowStage,
  OpportunityFeedUpdateCollectorFlowStage,
  OpportunityFeedUpdateFlowStageUtils,
  OpportunityFeedUpdateListenerFlowStage,
  OrderDeletionFlowStage,
  OrderFeedUpdateFlowStageUtils,
  OrderFeedUpdateListener,
  OrderFeedUpdateCollector,
  EnsureOrderIsNotPresentFlowStage,
  OrderQuoteDeletionFlowStage,
  TestInterfaceActionFlowStage,
  FlowStageRecipes,
  FlowStageUtils,
};
