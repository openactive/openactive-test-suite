const { BFlowStage } = require('./b');
const { BookRecipe } = require('./book-recipe');
const { C1FlowStage } = require('./c1');
const { C2FlowStage } = require('./c2');
const { FetchOpportunitiesFlowStage } = require('./fetch-opportunities');
const { FlowStageUtils } = require('./flow-stage-utils');
const { OrderFeedUpdateFlowStageUtils } = require('./order-feed-update');
const { PFlowStage } = require('./p');
const { TestInterfaceActionFlowStage } = require('./test-interface-action');

/**
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../../templates/c1-req').C1ReqTemplateRef} C1ReqTemplateRef
 * @typedef {import('../../templates/c2-req').C2ReqTemplateRef} C2ReqTemplateRef
 * @typedef {import('../../templates/b-req').AccessPassItem} AccessPassItem
 * @typedef {import('../../templates/b-req').BReqTemplateRef} BReqTemplateRef
 * @typedef {import('../../templates/b-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('./b').BFlowStageType} BFlowStageType
 * @typedef {import('./p').PFlowStageType} PFlowStageType
 * @typedef {import('./order-feed-update').OrderFeedUpdateCollectorType} OrderFeedUpdateCollectorType
 * @typedef {import('./test-interface-action').TestInterfaceActionFlowStageType} TestInterfaceActionFlowStageType
 * @typedef {import('./flow-stage').UnknownFlowStageType} UnknownFlowStageType
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 */

/**
 * @typedef {{
 *   c1ReqTemplateRef?: C1ReqTemplateRef | null,
 *   c2ReqTemplateRef?: C2ReqTemplateRef | null,
 *   bookReqTemplateRef?: PReqTemplateRef | null,
 *   brokerRole?: string | null,
 *   taxMode?: string | null,
 *   accessPass?: AccessPassItem[] | null,
 * }} InitialiseSimpleC1C2BookFlowOptions
 */

/**
 * @typedef {object} BookRecipeArgs
 * @property {UnknownFlowStageType} prerequisite
 * @property {string | null} [brokerRole]
 * @property {AccessPassItem[] | null} [accessPass]
 * @property {PReqTemplateRef | null} [firstStageReqTemplateRef] Reference for the template which will be used
 *   for the first stage - B or P.
 *   Note that the template ref is a `PReqTemplateRef`. That's because the only difference between `PReqTemplateRef`
 *   and `BReqTemplateRef` is that the latter includes the `afterP` template which is exclusively used for the B at
 *   the end of approval flow. Therefore, regardless of flow, the first stage will never use `afterP`.
 * @property {() => import('./p').Input} getFirstStageInput Input for the first flow stage - B or P.
 */

const FlowStageRecipes = {
  /**
   * Initialise Flow Stages for a simple FetchOpportunities -> C1 -> C2 -> Book (*) flow.
   *
   * Rather than setting custom input for each stage, the input is just fed automatically
   * from the output of previous stages.
   *
   * DO NOT USE THIS FUNCTION if you want to use custom inputs for each stage (e.g.
   * to create erroneous requests).
   *
   * (*) Book = B or P -> A -> B. See FlowStageRecipes.book(..) for more info.
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {BaseLoggerType} logger
   * @param {InitialiseSimpleC1C2BookFlowOptions} [options]
   */
  initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
    c1ReqTemplateRef = null,
    c2ReqTemplateRef = null,
    bookReqTemplateRef = null,
    brokerRole = null,
    taxMode = null,
    accessPass = null,
  } = {}) {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2Flow(
      orderItemCriteriaList,
      logger,
      {
        c1ReqTemplateRef,
        c2ReqTemplateRef,
        brokerRole,
        taxMode,
      },
    );
    const bookRecipe = FlowStageRecipes.book(orderItemCriteriaList, defaultFlowStageParams, {
      prerequisite: c2,
      accessPass,
      brokerRole,
      firstStageReqTemplateRef: bookReqTemplateRef,
      getFirstStageInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        totalPaymentDue: c2.getOutput().totalPaymentDue,
        prepayment: c2.getOutput().prepayment,
        positionOrderIntakeFormMap: c1.getOutput().positionOrderIntakeFormMap,
      }),
    });

    return {
      fetchOpportunities,
      c1,
      c2,
      bookRecipe,
      // This is included in the result so that additional stages can be added using
      // these params.
      defaultFlowStageParams,
    };
  },

  /**
   * Initialise Flow Stages for a simple FetchOpportunities -> C1 -> C2 flow
   *
   * Rather than setting custom input for each stage, the input is just fed automatically
   * from the output of previous stages.
   *
   * DO NOT USE THIS FUNCTION if you want to use custom inputs for each stage (e.g.
   * to create erroneous requests).
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {BaseLoggerType} logger
   * @param {Omit<InitialiseSimpleC1C2BookFlowOptions, 'bookReqTemplateRef'>} [options]
   */
  initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, { c1ReqTemplateRef = null, c2ReqTemplateRef = null, brokerRole = null, taxMode = null } = {}) {
    const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger, taxMode });
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...defaultFlowStageParams,
      orderItemCriteriaList,
    });
    const c1 = new C1FlowStage({
      ...defaultFlowStageParams,
      templateRef: c1ReqTemplateRef,
      brokerRole,
      prerequisite: fetchOpportunities,
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
    });
    const c2 = new C2FlowStage({
      ...defaultFlowStageParams,
      templateRef: c2ReqTemplateRef,
      brokerRole,
      prerequisite: c1,
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        positionOrderIntakeFormMap: c1.getOutput().positionOrderIntakeFormMap,
      }),
    });
    return {
      fetchOpportunities,
      c1,
      c2,
      // This is included in the result so that additional stages can be added using
      // these params.
      defaultFlowStageParams,
    };
  },
  /**
   * A flow which skips C1 & C2 (which are optional in certain circumstances) and proceeds straight to book.
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {BaseLoggerType} logger
   */
  initialiseSimpleBookOnlyFlow(orderItemCriteriaList, logger) {
    const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ logger });
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...defaultFlowStageParams,
      orderItemCriteriaList,
    });
    /** @returns {import('./p').Input}  */
    const bookRecipeGetFirstStageInput = () => {
      const totalPaymentDue = fetchOpportunities.getOutput().orderItems
        .map(o => o.acceptedOffer.price ?? 0)
        .reduce((x, y) => x + y, 0);
      return {
        orderItems: fetchOpportunities.getOutput().orderItems,
        // Because we're not using C2, we've gotta calculate the price ourselves
        totalPaymentDue,
        prepayment: (totalPaymentDue === 0)
          ? 'https://openactive.io/Unavailable'
          : 'https://openactive.io/Required',
        // excluding `positionOrderIntakeFormMap` because book-only flow cannot be used in conjunction with the
        // intake form flow, which requires C2
      };
    };
    const bookRecipe = FlowStageRecipes.book(orderItemCriteriaList, defaultFlowStageParams, {
      prerequisite: fetchOpportunities,
      getFirstStageInput: bookRecipeGetFirstStageInput,
    });
    return {
      fetchOpportunities,
      bookRecipe,
      // This is included in the result so that additional stages can be added using
      // these params.
      defaultFlowStageParams,
      // This can be used to create an idempotent second B stage.
      bookRecipeGetFirstStageInput,
    };
  },
  /**
   * B requests should be idempotent. A repeat B request with the exact same input as a previous one should
   * obtain the same results.
   *
   * This recipe returns a BFlowStage which should be an exact repeat of the last B stage in a given BookRecipe.
   * Use this to test that a Booking System is idempotent at B.
   *
   * @param {BookRecipe} bookRecipe
   * @param {ReturnType<typeof FlowStageUtils.createDefaultFlowStageParams>} defaultFlowStageParams
   * @param {Omit<BookRecipeArgs, 'prerequisite'>} bookRecipeArgs
   */
  idempotentRepeatBAfterBook(bookRecipe, defaultFlowStageParams, bookRecipeArgs) {
    if (bookRecipe.p) {
      return bAfterP({
        p: bookRecipe.p,
        bookRecipeGetFirstStageInput: bookRecipeArgs.getFirstStageInput,
        defaultFlowStageParams,
        prerequisite: bookRecipe.lastStage,
      });
    }
    const bookRecipeArgsWithPrerequisite = { ...bookRecipeArgs, prerequisite: bookRecipe.lastStage };
    return FlowStageRecipes.bookSimple(defaultFlowStageParams, bookRecipeArgsWithPrerequisite).b;
  },
  /**
   * A Recipe to either run B or P -> Approve -> B depending on the flow.
   *
   * - If in Simple Booking Flow, the recipe will just return B
   * - If in Approval Flow, the recipe will return
   *   1. P
   *   2. SellerAcceptOrderProposalSimulateAction
   *     a. Await OrderFeedUpdate, which should return approved Proposal
   *   3. B
   *     a. Await OrderFeedUpdate, which should delete Proposal
   *
   * This therefore represents the Book step of either flow.
   *
   * It is HIGHLY recommended that you use this function rather than manually creating B or P Flow Stages unless you
   * are explicitly writing a test that uses one flow instead of another.
   *
   * The selected flow will be found in the `orderItemCriteriaList`, which will in almost all cases be based on the
   * Booking Flow that is currently being tested. See (TODO) for more info about how Test Suite tests both Booking
   * Flows.
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {ReturnType<typeof FlowStageUtils.createDefaultFlowStageParams>} defaultFlowStageParams
   * @param {BookRecipeArgs} bookRecipeArgs
   * @returns {BookRecipe}
   */
  book(orderItemCriteriaList, defaultFlowStageParams, bookRecipeArgs) {
    const doUseApprovalFlow = orderItemCriteriaList.some(orderItemCriteria => (
      orderItemCriteria.bookingFlow === 'OpenBookingApprovalFlow'));
    if (doUseApprovalFlow) {
      return FlowStageRecipes.bookApproval(defaultFlowStageParams, bookRecipeArgs);
    }
    return FlowStageRecipes.bookSimple(defaultFlowStageParams, bookRecipeArgs);
  },
  /**
   * Create a BookRecipe explicitly for the Simple Booking Flow.
   *
   * See: FlowStageRecipes.book for more info
   *
   * @param {ReturnType<typeof FlowStageUtils.createDefaultFlowStageParams>} defaultFlowStageParams
   * @param {BookRecipeArgs} args
   * @returns {BookRecipe}
   */
  bookSimple(defaultFlowStageParams, {
    prerequisite,
    brokerRole = null,
    accessPass = null,
    firstStageReqTemplateRef = null,
    getFirstStageInput,
  }) {
    const b = new BFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      templateRef: firstStageReqTemplateRef,
      brokerRole,
      accessPass,
      getInput: getFirstStageInput,
    });
    return new BookRecipe({
      firstStage: b,
      lastStage: b,
      b,
    });
  },
  /**
   * Create a BookRecipe explicitly for the Approval Flow.
   *
   * See: FlowStageRecipes.book for more info
   *
   * @param {ReturnType<typeof FlowStageUtils.createDefaultFlowStageParams>} defaultFlowStageParams
   * @param {BookRecipeArgs} args
   * @returns {BookRecipe}
   */
  bookApproval(defaultFlowStageParams, {
    prerequisite,
    brokerRole = null,
    accessPass = null,
    firstStageReqTemplateRef = null,
    getFirstStageInput,
  }) {
    const p = new PFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      templateRef: firstStageReqTemplateRef,
      brokerRole,
      accessPass,
      getInput: getFirstStageInput,
    });
    const [simulateSellerApproval, orderFeedUpdateCollector] = OrderFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: orderFeedUpdateListener => (new TestInterfaceActionFlowStage({
        ...defaultFlowStageParams,
        testName: 'Simulate Seller Approval (Test Interface Action)',
        prerequisite: orderFeedUpdateListener,
        createActionFn: () => ({
          type: 'test:SellerAcceptOrderProposalSimulateAction',
          objectType: 'OrderProposal',
          objectId: p.getOutput().orderId,
        }),
      })),
      orderFeedUpdateParams: {
        ...defaultFlowStageParams,
        prerequisite: p,
        testName: 'OrderProposal Feed Update (after Simulate Seller Approval)',
        orderFeedType: 'order-proposals',
      },
    });

    const [b, orderFeedUpdateAfterDeleteProposal] = OrderFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: orderFeedUpdateListener => bAfterP({
        p,
        defaultFlowStageParams,
        prerequisite: orderFeedUpdateListener,
        bookRecipeGetFirstStageInput: getFirstStageInput,
      }),
      orderFeedUpdateParams: {
        ...defaultFlowStageParams,
        prerequisite: orderFeedUpdateCollector,
        testName: 'OrderProposal Feed Deletion (after B)',
        orderFeedType: 'order-proposals',
      },
    });

    return new BookRecipe({
      firstStage: p,
      lastStage: orderFeedUpdateAfterDeleteProposal,
      p,
      simulateSellerApproval,
      orderFeedUpdateCollector,
      b,
      orderFeedUpdateAfterDeleteProposal,
    });
  },
};

/**
 * BFlowStage that succeeds a PFlowStage
 *
 * @param {object} args
 * @param {PFlowStageType} args.p
 * @param {ReturnType<typeof FlowStageUtils.createDefaultFlowStageParams>} args.defaultFlowStageParams
 * @param {UnknownFlowStageType} args.prerequisite
 * @param {() => import('./p').Input} args.bookRecipeGetFirstStageInput
 */
function bAfterP({ p, defaultFlowStageParams, prerequisite, bookRecipeGetFirstStageInput }) {
  return new BFlowStage({
    ...defaultFlowStageParams,
    prerequisite,
    templateRef: 'afterP',
    getInput: () => {
      /* note that brokerRole & accessPass don't need to be passed. This is the minimal "B after P" call which
      just presents `orderProposalVersion` and optional payment details */
      const firstStageInput = bookRecipeGetFirstStageInput();
      return {
        orderItems: firstStageInput.orderItems,
        totalPaymentDue: p.getOutput().totalPaymentDue,
        orderProposalVersion: p.getOutput().orderProposalVersion,
        prepayment: p.getOutput().prepayment,
      };
    },
  });
}

module.exports = {
  FlowStageRecipes,
};
