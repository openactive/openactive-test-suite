/**
 * @typedef {import('./b').BFlowStageType} BFlowStageType
 * @typedef {import('./p').PFlowStageType} PFlowStageType
 * @typedef {import('./order-feed-update').OrderFeedUpdateCollectorType} OrderFeedUpdateCollectorType
 * @typedef {import('./test-interface-action').TestInterfaceActionFlowStageType} TestInterfaceActionFlowStageType
 */

/**
 * The Flow Stages required to complete booking in either Simple or Approval flow.
 * `firstStage` is a special field that represents the first stage that is needed in either flow. Some tests expect
 * that, regardless of which of P or B was called first, it should fail.
 */
class BookRecipe {
  /**
   * @param {object} args
   * @param {BFlowStageType} args.b
   * @param {PFlowStageType | null} [args.p]
   * @param {TestInterfaceActionFlowStageType | null} [args.simulateSellerApproval]
   * @param {OrderFeedUpdateCollectorType | null} [args.orderFeedUpdateCollector]
   * @param {BFlowStageType | PFlowStageType} args.firstStage
   * @param {OrderFeedUpdateCollectorType | null} [args.orderFeedUpdateAfterDeleteProposal]
   */
  constructor({ b, p, simulateSellerApproval, orderFeedUpdateCollector, firstStage, orderFeedUpdateAfterDeleteProposal }) {
    this.b = b;
    this.p = p;
    this.simulateSellerApproval = simulateSellerApproval;
    this.orderFeedUpdateCollector = orderFeedUpdateCollector;
    this.firstStage = firstStage;
    this.orderFeedUpdateAfterDeleteProposal = orderFeedUpdateAfterDeleteProposal;
  }
}

module.exports = {
  BookRecipe,
};
