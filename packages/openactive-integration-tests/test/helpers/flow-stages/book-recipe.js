/**
 * @typedef {import('./b').BFlowStageType} BFlowStageType
 * @typedef {import('./p').PFlowStageType} PFlowStageType
 * @typedef {import('./order-feed-update').OrderFeedUpdateCollectorType} OrderFeedUpdateCollectorType
 * @typedef {import('./test-interface-action').TestInterfaceActionFlowStageType} TestInterfaceActionFlowStageType
 * @typedef {import('./assert-opportunity-capacity').AssertOpportunityCapacityFlowStageType} AssertOpportunityCapacityFlowStageType
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
   * @param {{
   *   b: BFlowStageType,
   *   assertOpportunityCapacityAfterBook: AssertOpportunityCapacityFlowStageType,
   * } | {
   *   p: PFlowStageType,
   *   simulateSellerApproval: TestInterfaceActionFlowStageType,
   *   orderFeedUpdateCollector: OrderFeedUpdateCollectorType,
   *   b: BFlowStageType,
   *   orderFeedUpdateAfterDeleteProposal: OrderFeedUpdateCollectorType,
   *   assertOpportunityCapacityAfterBook: AssertOpportunityCapacityFlowStageType,
   * }} args
   */
  constructor(args) {
    this.b = args.b;
    this._assertOpportunityCapacityAfterBook = args.assertOpportunityCapacityAfterBook;
    this.lastStage = this._assertOpportunityCapacityAfterBook;
    if ('p' in args) {
      this.p = args.p;
      this.simulateSellerApproval = args.simulateSellerApproval;
      this.orderFeedUpdateCollector = args.orderFeedUpdateCollector;
      this.orderFeedUpdateAfterDeleteProposal = args.orderFeedUpdateAfterDeleteProposal;
      this.firstStage = this.p;
      this._stagesSequenceBeforeLastStage = [this.p, this.simulateSellerApproval, this.orderFeedUpdateCollector, this.b, this.orderFeedUpdateAfterDeleteProposal];
      this._isApproval = true;
    } else {
      this.firstStage = this.b;
      this._stagesSequenceBeforeLastStage = [this.b];
      this._isApproval = false;
    }
    // TODO TODO TODO next step = have an assert be the last stage here.
  }

  isApproval() { return this._isApproval; }

  getStagesSequenceBeforeLastStage() { return this._stagesSequenceBeforeLastStage; }

  getAssertOpportunityCapacityAfterBook() { return this._assertOpportunityCapacityAfterBook; }
  // /**
  //  * @param {object} args
  //  * @param {BFlowStageType} args.b
  //  * @param {PFlowStageType | null} [args.p]
  //  * @param {TestInterfaceActionFlowStageType | null} [args.simulateSellerApproval]
  //  * @param {OrderFeedUpdateCollectorType | null} [args.orderFeedUpdateCollector]
  //  * @param {OrderFeedUpdateCollectorType | null} [args.orderFeedUpdateAfterDeleteProposal]
  //  * @param {BFlowStageType | PFlowStageType} args.firstStage
  //  * @param {BFlowStageType | OrderFeedUpdateCollectorType} args.lastStage
  //  */
  // constructor({
  //   b,
  //   p,
  //   simulateSellerApproval,
  //   orderFeedUpdateCollector,
  //   orderFeedUpdateAfterDeleteProposal,
  //   firstStage,
  //   lastStage,
  // }) {
  //   this.b = b;
  //   this.p = p;
  //   this.simulateSellerApproval = simulateSellerApproval;
  //   this.orderFeedUpdateCollector = orderFeedUpdateCollector;
  //   this.orderFeedUpdateAfterDeleteProposal = orderFeedUpdateAfterDeleteProposal;
  //   this.firstStage = firstStage;
  //   this.lastStage = lastStage;
  // }
}

//  * @param {object} args
//  * @param {BFlowStageType} args.b
//  * @param {PFlowStageType | null} [args.p]
//  * @param {TestInterfaceActionFlowStageType | null} [args.simulateSellerApproval]
//  * @param {OrderFeedUpdateCollectorType | null} [args.orderFeedUpdateCollector]
//  * @param {OrderFeedUpdateCollectorType | null} [args.orderFeedUpdateAfterDeleteProposal]
//  * @param {BFlowStageType | PFlowStageType} args.firstStage
//  * @param {BFlowStageType | OrderFeedUpdateCollectorType} args.lastStage

module.exports = {
  BookRecipe,
};
