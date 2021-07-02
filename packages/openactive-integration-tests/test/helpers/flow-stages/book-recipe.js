/**
 * @typedef {import('./b').BFlowStageType} BFlowStageType
 * @typedef {import('./p').PFlowStageType} PFlowStageType
 * @typedef {import('./order-feed-update').OrderFeedUpdateCollectorType} OrderFeedUpdateCollectorType
 * @typedef {import('./test-interface-action').TestInterfaceActionFlowStageType} TestInterfaceActionFlowStageType
 */

/**
 * The Flow Stages required to complete booking in either Simple or Approval flow.
 *
 * `firstStage` is a special field that represents the first stage that is needed in either flow. Some tests expect
 * that, regardless of which of P or B was called first, it should fail.
 *
 * `lastStage` is another special field - the last stage that is needed in either flow. For Simple, this will be B
 * and, for Approval, this will be orderFeedUpdateAfterDeleteProposal. Use this as prerequisite for any subsequent
 * stages.
 */
class BookRecipe {
  /**
   * @param {object} args
   * @param {BFlowStageType} args.b
   * @param {PFlowStageType | null} [args.p]
   * @param {TestInterfaceActionFlowStageType | null} [args.simulateSellerApproval]
   * @param {OrderFeedUpdateCollectorType | null} [args.orderFeedUpdateCollector]
   * @param {OrderFeedUpdateCollectorType | null} [args.orderFeedUpdateAfterDeleteProposal]
   * @param {BFlowStageType | PFlowStageType} args.firstStage
   * @param {BFlowStageType | OrderFeedUpdateCollectorType} args.lastStage
   */
  constructor({
    b,
    p,
    simulateSellerApproval,
    orderFeedUpdateCollector,
    orderFeedUpdateAfterDeleteProposal,
    firstStage,
    lastStage,
  }) {
    this.b = b;
    this.p = p;
    this.simulateSellerApproval = simulateSellerApproval;
    this.orderFeedUpdateCollector = orderFeedUpdateCollector;
    this.orderFeedUpdateAfterDeleteProposal = orderFeedUpdateAfterDeleteProposal;
    this.firstStage = firstStage;
    this.lastStage = lastStage;
  }
}

/**
 * @typedef {InstanceType<typeof BookRecipe>} BookRecipeType
 */

module.exports = {
  BookRecipe,
};
