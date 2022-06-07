const { AssertOpportunityCapacityFlowStage } = require('./assert-opportunity-capacity');
const { BFlowStage } = require('./b');
const { BookRecipe } = require('./book-recipe');
const { C1FlowStage } = require('./c1');
const { C2FlowStage } = require('./c2');
const { CancelOrderFlowStage } = require('./cancel-order');
const { FetchOpportunitiesFlowStage } = require('./fetch-opportunities');
const { FlowStageRun } = require('./flow-stage-run');
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
 * @typedef {import('./assert-opportunity-capacity').GetOpportunityExpectedCapacity} GetOpportunityExpectedCapacity
 * @typedef {import('./b').BFlowStageType} BFlowStageType
 * @typedef {import('./p').PFlowStageType} PFlowStageType
 * @typedef {import('./order-feed-update').OrderFeedUpdateCollectorType} OrderFeedUpdateCollectorType
 * @typedef {import('./test-interface-action').TestInterfaceActionFlowStageType} TestInterfaceActionFlowStageType
 * @typedef {import('./flow-stage').FlowStageOutput}  FlowStageOutput
 * @typedef {import('./flow-stage').UnknownFlowStageType} UnknownFlowStageType
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('./flow-stage').FlowStageType<unknown, Required<Pick<FlowStageOutput, 'opportunityFeedExtractResponses'>>>} FlowStageWhichOutputsOpportunityFeedExtractResponses
 * @typedef {import('./test-interface-action').TestInterfaceActionType} TestInterfaceActionType
 */

/**
 * @typedef {ReturnType<typeof FlowStageUtils.createDefaultFlowStageParams>} DefaultFlowStageParams
 *
 * @typedef {{
 *   c1ReqTemplateRef?: C1ReqTemplateRef | null,
 *   c2ReqTemplateRef?: C2ReqTemplateRef | null,
 *   bookReqTemplateRef?: PReqTemplateRef | null,
 *   brokerRole?: string | null,
 *   taxMode?: string | null,
 *   accessPass?: AccessPassItem[] | null,
 *   defaultFlowStageParams?: DefaultFlowStageParams | null,
 *   c1ExpectToFail?: boolean,
 *   c2ExpectToFail?: boolean,
 *   bookExpectToFail?: boolean,
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
 * @property {boolean | null} [isExpectedToFail] is Book expected to fail?
 * @property {() => import('./p').Input} getFirstStageInput Input for the first flow stage - B or P.
 * @property {() => import('./assert-opportunity-capacity').Input} getAssertOpportunityCapacityInput Input for the
 *   AssertOpportunityCapacity flow stage, which runs after the booking is complete
 * @property {GetOpportunityExpectedCapacity} [getOpportunityExpectedCapacity] If not provided, this will
 *   default to using getOpportunityExpectedCapacityAfterBook(..)
 */

const RUN_TESTS_WHICH_FAIL_REFIMPL = process.env.RUN_TESTS_WHICH_FAIL_REFIMPL === 'true';

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
    bookReqTemplateRef = null,
    brokerRole = null,
    accessPass = null,
    ...options
  } = {}) {
    const bookExpectToFail = options.bookExpectToFail ?? false;
    const {
      fetchOpportunities,
      c1,
      c2,
      defaultFlowStageParams,
    } = FlowStageRecipes.initialiseSimpleC1C2Flow(
      orderItemCriteriaList,
      logger,
      {
        ...options,
        brokerRole,
      },
    );
    const bookRecipe = FlowStageRecipes.book(orderItemCriteriaList, defaultFlowStageParams, {
      prerequisite: c2.getLastStage(),
      accessPass,
      brokerRole,
      firstStageReqTemplateRef: bookReqTemplateRef,
      getFirstStageInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        totalPaymentDue: c2.getStage('c2').getOutput().totalPaymentDue,
        prepayment: c2.getStage('c2').getOutput().prepayment,
        positionOrderIntakeFormMap: c1.getStage('c1').getOutput().positionOrderIntakeFormMap,
      }),
      getAssertOpportunityCapacityInput: () => ({
        opportunityFeedExtractResponses: c2.getStage('assertOpportunityCapacityAfterC2').getOutput().opportunityFeedExtractResponses,
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
      isExpectedToFail: bookExpectToFail,
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
  initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, {
    c2ReqTemplateRef = null,
    brokerRole = null,
    taxMode = null,
    ...options
  } = {}) {
    const c2ExpectToFail = options.c2ExpectToFail ?? false;

    const { fetchOpportunities, c1, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1Flow(orderItemCriteriaList, logger, {
      brokerRole,
      taxMode,
      ...options,
    });
    const c2 = FlowStageRecipes.runs.book.c2AssertCapacity(c1.getLastStage(), defaultFlowStageParams, {
      c2Args: {
        templateRef: c2ReqTemplateRef,
        brokerRole,
        getInput: () => ({
          orderItems: fetchOpportunities.getOutput().orderItems,
          positionOrderIntakeFormMap: c1.getStage('c1').getOutput().positionOrderIntakeFormMap,
        }),
      },
      assertOpportunityCapacityArgs: {
        // Capacity can be incorrectly reduced after a failed lease in RefImpl: https://github.com/openactive/OpenActive.Server.NET/issues/169
        doSkip: !RUN_TESTS_WHICH_FAIL_REFIMPL && c2ExpectToFail,
        getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterC2(!c2ExpectToFail),
        getInput: () => ({
          opportunityFeedExtractResponses: c1.getStage('assertOpportunityCapacityAfterC1').getOutput().opportunityFeedExtractResponses,
          orderItems: fetchOpportunities.getOutput().orderItems,
        }),
        orderItemCriteriaList,
      },
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
   * Initialise Flow Stages for a simple FetchOpportunities -> C1 -> (assert capacity after C1) flow
   * where C1 is expected to pass.
   *
   * Rather than setting custom input for each stage, the input is just fed automatically
   * from the output of previous stages.
   *
   * DO NOT USE THIS FUNCTION if you want to use custom inputs for each stage (e.g.
   * to create erroneous requests).
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {BaseLoggerType} logger
   * @param {Omit<InitialiseSimpleC1C2BookFlowOptions, 'bookReqTemplateRef' | 'c2ReqTemplateRef'>} [options]
   */
  initialiseSimpleC1Flow(orderItemCriteriaList, logger, {
    c1ReqTemplateRef = null,
    taxMode = null,
    brokerRole = null,
    ...options
  } = {}) {
    const defaultFlowStageParams = options.defaultFlowStageParams ?? FlowStageUtils.createSimpleDefaultFlowStageParams({
      orderItemCriteriaList, logger, taxMode,
    });
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...defaultFlowStageParams,
    });
    const c1ExpectToFail = options.c1ExpectToFail ?? false;
    const c1 = FlowStageRecipes.runs.book.c1AssertCapacity(fetchOpportunities, defaultFlowStageParams, {
      c1Args: {
        templateRef: c1ReqTemplateRef,
        brokerRole,
        prerequisite: fetchOpportunities,
        getInput: () => ({
          orderItems: fetchOpportunities.getOutput().orderItems,
        }),
      },
      assertOpportunityCapacityArgs: {
        // Capacity can be incorrectly reduced after a failed lease in RefImpl: https://github.com/openactive/OpenActive.Server.NET/issues/169
        doSkip: !RUN_TESTS_WHICH_FAIL_REFIMPL && c1ExpectToFail,
        getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterC1(!c1ExpectToFail),
        getInput: () => ({
          opportunityFeedExtractResponses: fetchOpportunities.getOutput().opportunityFeedExtractResponses,
          orderItems: fetchOpportunities.getOutput().orderItems,
        }),
        orderItemCriteriaList,
      },
    });
    return {
      fetchOpportunities,
      c1,
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
   * @param {object} [args]
   * @param {boolean} [args.isExpectedToSucceed]
   */
  initialiseSimpleBookOnlyFlow(orderItemCriteriaList, logger, args = {}) {
    const isExpectedToSucceed = args.isExpectedToSucceed ?? true;
    const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({ orderItemCriteriaList, logger });
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...defaultFlowStageParams,
    });
    /** @returns {import('./p').Input}  */
    const bookRecipeGetFirstStageInput = () => {
      const { totalPaymentDue, doPrepay } = (() => {
        const result = { totalPaymentDue: 0, doPrepay: true };
        for (const orderItem of fetchOpportunities.getOutput().orderItems) {
          const { openBookingPrepayment, price } = orderItem.acceptedOffer;
          /* If there are any non-zero unavailable items, there should be no prepayment on the entire Order.
          In fact, non-zero Unavailable items and Required items should not be mixed in the same Order (https://github.com/openactive/open-booking-api/issues/171)
          but this is tested separately */
          if (openBookingPrepayment === 'https://openactive.io/Unavailable' && price > 0) {
            result.doPrepay = false;
          }
          result.totalPaymentDue += price;
        }
        return result;
      })();
      return {
        orderItems: fetchOpportunities.getOutput().orderItems,
        // Because we're not using C2, we've gotta calculate the price ourselves
        totalPaymentDue,
        prepayment: doPrepay
          ? 'https://openactive.io/Required'
          : 'https://openactive.io/Unavailable',
        // excluding `positionOrderIntakeFormMap` because book-only flow cannot be used in conjunction with the
        // intake form flow, which requires C2
      };
    };
    const bookRecipeGetAssertOpportunityCapacityInput = () => ({
      opportunityFeedExtractResponses: fetchOpportunities.getOutput().opportunityFeedExtractResponses,
      orderItems: fetchOpportunities.getOutput().orderItems,
    });
    const bookRecipe = FlowStageRecipes.book(orderItemCriteriaList, defaultFlowStageParams, {
      prerequisite: fetchOpportunities,
      isExpectedToFail: !isExpectedToSucceed,
      getFirstStageInput: bookRecipeGetFirstStageInput,
      getAssertOpportunityCapacityInput: bookRecipeGetAssertOpportunityCapacityInput,
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterBookOnly(isExpectedToSucceed),
    });
    return {
      fetchOpportunities,
      bookRecipe,
      // This is included in the result so that additional stages can be added using
      // these params.
      defaultFlowStageParams,
      // These can be used to create an idempotent second B stage.
      bookRecipeGetFirstStageInput,
      bookRecipeGetAssertOpportunityCapacityInput,
    };
  },
  /**
   * Flow: FetchOpportunities -> C1 -> C2 -> Book -> TestInterfaceAction -> OrderFeedUpdate
   *
   * 1. Make an Order (FetchOpportunities -> C1 -> C2 -> Book)
   * 2. Use a TestInterfaceAction to trigger some kind of update to the Order (e.g. access pass update)
   * 3. Expect an update in the Order Feed
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {BaseLoggerType} logger
   * @param {{
   *   actionType: TestInterfaceActionType,
   * }} testInterfaceActionParams
   */
  successfulC1C2BookFollowedByTestInterfaceAction(orderItemCriteriaList, logger, testInterfaceActionParams) {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
    const [testInterfaceAction, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
        ...defaultFlowStageParams,
        testName: `Test Interface Action (${testInterfaceActionParams.actionType})`,
        prerequisite,
        createActionFn: () => ({
          type: testInterfaceActionParams.actionType,
          // Note that these 2 fields may need to be configurable in future:
          objectType: 'Order',
          objectId: bookRecipe.b.getOutput().orderId,
        }),
      })),
      orderFeedUpdateParams: {
        ...defaultFlowStageParams,
        prerequisite: bookRecipe.lastStage,
        testName: `Orders Feed (after ${testInterfaceActionParams.actionType})`,
      },
    });
    return {
      fetchOpportunities,
      c1,
      c2,
      bookRecipe,
      testInterfaceAction,
      orderFeedUpdate,
      defaultFlowStageParams,
    };
  },
  /**
   * B requests should be idempotent. A repeat B request with the exact same input as a previous one should
   * obtain the same results.
   *
   * This recipe returns a BFlowStage which should be an exact repeat of the last B stage in a given BookRecipe.
   * Use this to test that a Booking System is idempotent at B.
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {BookRecipe} bookRecipe
   * @param {DefaultFlowStageParams} defaultFlowStageParams
   * @param {Omit<BookRecipeArgs, 'prerequisite'>} bookRecipeArgs
   */
  idempotentRepeatBAfterBook(orderItemCriteriaList, bookRecipe, defaultFlowStageParams, bookRecipeArgs) {
    if (bookRecipe.isApproval()) {
      return bAfterP({
        p: bookRecipe.p,
        bookRecipeGetFirstStageInput: bookRecipeArgs.getFirstStageInput,
        defaultFlowStageParams,
        prerequisite: bookRecipe.lastStage,
      });
    }
    const bookRecipeArgsWithPrerequisite = { ...bookRecipeArgs, prerequisite: bookRecipe.lastStage };
    return FlowStageRecipes.bookSimple(orderItemCriteriaList, defaultFlowStageParams, bookRecipeArgsWithPrerequisite);
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
   * @param {DefaultFlowStageParams} defaultFlowStageParams
   * @param {BookRecipeArgs} bookRecipeArgs
   * @returns {BookRecipe}
   */
  book(orderItemCriteriaList, defaultFlowStageParams, bookRecipeArgs) {
    const doUseApprovalFlow = orderItemCriteriaList.some(orderItemCriteria => (
      orderItemCriteria.bookingFlow === 'OpenBookingApprovalFlow'));
    if (doUseApprovalFlow) {
      return FlowStageRecipes.bookApproval(orderItemCriteriaList, defaultFlowStageParams, bookRecipeArgs);
    }
    return FlowStageRecipes.bookSimple(orderItemCriteriaList, defaultFlowStageParams, bookRecipeArgs);
  },
  /**
   * Create a BookRecipe explicitly for the Simple Booking Flow.
   *
   * See: FlowStageRecipes.book for more info
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {DefaultFlowStageParams} defaultFlowStageParams
   * @param {BookRecipeArgs} args
   * @returns {BookRecipe}
   */
  bookSimple(orderItemCriteriaList, defaultFlowStageParams, {
    prerequisite,
    brokerRole = null,
    accessPass = null,
    firstStageReqTemplateRef = null,
    getFirstStageInput,
    getAssertOpportunityCapacityInput,
    isExpectedToFail = null,
    ...args
  }) {
    const b = new BFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      templateRef: firstStageReqTemplateRef,
      brokerRole,
      accessPass,
      getInput: getFirstStageInput,
    });
    const getOpportunityExpectedCapacity = args.getOpportunityExpectedCapacity
      ?? AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterBook(!(isExpectedToFail ?? false));
    const assertOpportunityCapacityAfterBook = new AssertOpportunityCapacityFlowStage({
      nameOfPreviousStage: 'B',
      getOpportunityExpectedCapacity,
      getInput: getAssertOpportunityCapacityInput,
      prerequisite: b,
      ...defaultFlowStageParams,
    });
    return new BookRecipe({
      // firstStage: b,
      // lastStage: b,
      b,
      assertOpportunityCapacityAfterBook,
    });
  },
  /**
   * Create a BookRecipe explicitly for the Approval Flow.
   *
   * See: FlowStageRecipes.book for more info
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {DefaultFlowStageParams} defaultFlowStageParams
   * @param {BookRecipeArgs} args
   * @returns {BookRecipe}
   */
  bookApproval(orderItemCriteriaList, defaultFlowStageParams, {
    prerequisite,
    brokerRole = null,
    accessPass = null,
    firstStageReqTemplateRef = null,
    getFirstStageInput,
    getAssertOpportunityCapacityInput,
    isExpectedToFail = null,
    ...args
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
        failEarlyIf: () => p.getOutput().httpResponse.response.statusCode >= 400,
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
    const getOpportunityExpectedCapacity = args.getOpportunityExpectedCapacity
      ?? AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterBook(!(isExpectedToFail ?? false));
    const assertOpportunityCapacityAfterBook = new AssertOpportunityCapacityFlowStage({
      nameOfPreviousStage: 'OrderProposal Feed Deletion (after B)',
      getOpportunityExpectedCapacity,
      getInput: getAssertOpportunityCapacityInput,
      prerequisite: orderFeedUpdateAfterDeleteProposal,
      ...defaultFlowStageParams,
    });

    return new BookRecipe({
      // firstStage: p,
      // lastStage: orderFeedUpdateAfterDeleteProposal,
      p,
      simulateSellerApproval,
      orderFeedUpdateCollector,
      b,
      orderFeedUpdateAfterDeleteProposal,
      assertOpportunityCapacityAfterBook,
    });
  },

  runs: {
    customerCancel: {
      /**
       * @param {UnknownFlowStageType} prerequisite
       * @param {DefaultFlowStageParams} defaultFlowStageParams
       * @param {object} args
       * @param {import('utility-types').Optional<ConstructorParameters<typeof CancelOrderFlowStage>[0], 'prerequisite' | 'requestHelper' | 'uuid'>} args.cancelArgs
       * @param {import('utility-types').Optional<ConstructorParameters<typeof AssertOpportunityCapacityFlowStage>[0], 'prerequisite' | 'requestHelper' | 'logger' | 'nameOfPreviousStage' | 'orderItemCriteriaList'>} args.assertOpportunityCapacityArgs
       */
      cancelAndAssertCapacity(prerequisite, defaultFlowStageParams, { cancelArgs, assertOpportunityCapacityArgs }) {
        const cancelTestName = cancelArgs.testName ?? 'Cancel';
        const cancel = new CancelOrderFlowStage({
          ...defaultFlowStageParams,
          prerequisite,
          ...cancelArgs,
        });
        const assertOpportunityCapacityAfterCancel = new AssertOpportunityCapacityFlowStage({
          ...defaultFlowStageParams,
          // Capacity is not correctly restored after cancellation in RefImpl: https://github.com/openactive/OpenActive.Server.NET/issues/166
          doSkip: !RUN_TESTS_WHICH_FAIL_REFIMPL,
          nameOfPreviousStage: cancelTestName,
          prerequisite: cancel,
          ...assertOpportunityCapacityArgs,
        });
        return new FlowStageRun({
          cancel,
          assertOpportunityCapacityAfterCancel,
        }, ['cancel', 'assertOpportunityCapacityAfterCancel']);
      },
      /**
       * Only use for Cancellations which are expected to succeed, as these FlowStages will wait for the Order feed to
       * update with the successfully processed cancellation.
       *
       * @param {UnknownFlowStageType} prerequisite
       * @param {DefaultFlowStageParams} defaultFlowStageParams
       * @param {object} args
       * @param {import('utility-types').Optional<ConstructorParameters<typeof CancelOrderFlowStage>[0], 'prerequisite' | 'requestHelper' | 'uuid'>} args.cancelArgs
       * @param {import('utility-types').Optional<ConstructorParameters<typeof AssertOpportunityCapacityFlowStage>[0], 'prerequisite' | 'requestHelper' | 'logger' | 'nameOfPreviousStage' | 'orderItemCriteriaList'>} args.assertOpportunityCapacityArgs
       */
      successfulCancelAssertOrderUpdateAndCapacity(prerequisite, defaultFlowStageParams, { cancelArgs, assertOpportunityCapacityArgs }) {
        const cancelTestName = cancelArgs.testName ?? 'Cancel';
        const [cancel, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
          wrappedStageFn: orderFeedListener => (new CancelOrderFlowStage({
            ...defaultFlowStageParams,
            prerequisite: orderFeedListener,
            ...cancelArgs,
          })),
          orderFeedUpdateParams: {
            ...defaultFlowStageParams,
            prerequisite,
            testName: `Orders Feed (after ${cancelTestName})`,
          },
        });
        const assertOpportunityCapacityAfterCancel = new AssertOpportunityCapacityFlowStage({
          ...defaultFlowStageParams,
          // Capacity is not correctly restored after cancellation in RefImpl: https://github.com/openactive/OpenActive.Server.NET/issues/166
          doSkip: !RUN_TESTS_WHICH_FAIL_REFIMPL,
          nameOfPreviousStage: cancelTestName,
          prerequisite: orderFeedUpdate,
          ...assertOpportunityCapacityArgs,
        });
        return new FlowStageRun({
          cancel,
          orderFeedUpdate,
          assertOpportunityCapacityAfterCancel,
        }, ['cancel', 'orderFeedUpdate', 'assertOpportunityCapacityAfterCancel']);
      },
      /**
       * @param {UnknownFlowStageType} prerequisite
       * @param {DefaultFlowStageParams} defaultFlowStageParams
       * @param {object} args
       * @param {import('./flow-stage').FlowStageType<unknown, Required<Pick<FlowStageOutput, 'orderItems'>>>} args.fetchOpportunitiesFlowStage
       * @param {import('./flow-stage').FlowStageType<unknown, Required<Pick<FlowStageOutput, 'opportunityFeedExtractResponses'>>>} args.lastOpportunityFeedExtractFlowStage
       *   If this cancellation happens after C1/C2/B, use the AssertOpportunityCapacity stage that followed that.
       * @param {import('utility-types').Optional<ConstructorParameters<typeof CancelOrderFlowStage>[0], 'prerequisite' | 'requestHelper' | 'uuid'>} args.cancelArgs
       * @param {import('utility-types').Optional<ConstructorParameters<typeof AssertOpportunityCapacityFlowStage>[0], 'prerequisite' | 'requestHelper' | 'logger' | 'nameOfPreviousStage' | 'orderItemCriteriaList' | 'getOpportunityExpectedCapacity' | 'getInput'>} args.assertOpportunityCapacityArgs
       */
      failedCancelAndAssertCapacity(prerequisite, defaultFlowStageParams, {
        fetchOpportunitiesFlowStage,
        lastOpportunityFeedExtractFlowStage,
        cancelArgs,
        assertOpportunityCapacityArgs,
      }) {
        return FlowStageRecipes.runs.customerCancel.cancelAndAssertCapacity(prerequisite, defaultFlowStageParams, {
          cancelArgs,
          assertOpportunityCapacityArgs: {
            getInput: () => ({
              orderItems: fetchOpportunitiesFlowStage.getOutput().orderItems,
              opportunityFeedExtractResponses: lastOpportunityFeedExtractFlowStage.getOutput().opportunityFeedExtractResponses,
            }),
            getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity,
            ...assertOpportunityCapacityArgs,
          },
        });
      },
    },
    sellerCancel: {
      //  * @param {import('utility-types').Optional<ConstructorParameters<typeof AssertOpportunityCapacityFlowStage>[0], 'prerequisite' | 'requestHelper' | 'nameOfPreviousStage' | 'orderItemCriteriaList'>} args.assertOpportunityCapacityArgs
      /**
       * This will:
       * - Simulate a Seller Requested Cancellation
       * - Check for an update to the Order to appear in the feed.
       * - Check that the Opportunity feed will be updated so that capacity is reverted to its initial values
       *
       * @param {UnknownFlowStageType} prerequisite
       * @param {DefaultFlowStageParams} defaultFlowStageParams
       * @param {object} args
       * @param {string} [args.cancelTestName]
       * @param {TestInterfaceActionType} [args.cancellationActionType]
       * @param {FetchOpportunitiesFlowStage} args.fetchOpportunities
       * @param {() => string} args.getOrderId
       */
      successfulCancelAssertOrderUpdateAndCapacity(prerequisite, defaultFlowStageParams, {
        cancelTestName = 'Simulate Seller Cancellation (Test Interface Action)',
        cancellationActionType = 'test:SellerRequestedCancellationSimulateAction',
        fetchOpportunities,
        getOrderId,
      }) {
        const [simulateSellerCancellation, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
          wrappedStageFn: orderFeedUpdateListener => (new TestInterfaceActionFlowStage({
            ...defaultFlowStageParams,
            testName: cancelTestName,
            prerequisite: orderFeedUpdateListener,
            createActionFn: () => ({
              type: cancellationActionType,
              objectType: 'Order',
              objectId: getOrderId(),
            }),
          })),
          orderFeedUpdateParams: {
            ...defaultFlowStageParams,
            prerequisite,
            testName: `Orders Feed (after ${cancelTestName})`,
          },
        });
        const assertOpportunityCapacityAfterCancel = new AssertOpportunityCapacityFlowStage({
          ...defaultFlowStageParams,
          // Capacity is not correctly restored after cancellation in RefImpl: https://github.com/openactive/OpenActive.Server.NET/issues/166
          doSkip: !RUN_TESTS_WHICH_FAIL_REFIMPL,
          nameOfPreviousStage: cancelTestName,
          prerequisite: orderFeedUpdate,
          // Capacity should be the same as it was when initially fetched from feed.
          getInput: () => fetchOpportunities.getOutput(),
          getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity,
        });
        return new FlowStageRun({
          simulateSellerCancellation,
          orderFeedUpdate,
          assertOpportunityCapacityAfterCancel,
        }, ['simulateSellerCancellation', 'orderFeedUpdate', 'assertOpportunityCapacityAfterCancel']);
      },
    },
    book: {
      /**
       * @param {UnknownFlowStageType} prerequisite
       * @param {DefaultFlowStageParams} defaultFlowStageParams
       * @param {object} args
       * @param {import('utility-types').Optional<ConstructorParameters<typeof C1FlowStage>[0], 'prerequisite' | 'logger' | 'requestHelper' | 'sellerConfig' | 'uuid' | 'orderItemCriteriaList'>} args.c1Args
       * @param {import('utility-types').Optional<ConstructorParameters<typeof AssertOpportunityCapacityFlowStage>[0], 'prerequisite' | 'requestHelper' | 'logger' | 'nameOfPreviousStage' | 'orderItemCriteriaList'>} args.assertOpportunityCapacityArgs
       */
      c1AssertCapacity(prerequisite, defaultFlowStageParams, { c1Args, assertOpportunityCapacityArgs }) {
        const c1 = new C1FlowStage({
          ...defaultFlowStageParams,
          prerequisite,
          ...c1Args,
        });
        const assertOpportunityCapacityAfterC1 = new AssertOpportunityCapacityFlowStage({
          ...defaultFlowStageParams,
          nameOfPreviousStage: 'C1',
          prerequisite: c1,
          ...assertOpportunityCapacityArgs,
        });
        return new FlowStageRun({
          c1,
          assertOpportunityCapacityAfterC1,
        }, ['c1', 'assertOpportunityCapacityAfterC1']);
      },
      /**
       * @param {UnknownFlowStageType} prerequisite
       * @param {DefaultFlowStageParams} defaultFlowStageParams
       * @param {object} args
       * @param {import('utility-types').Optional<ConstructorParameters<typeof C2FlowStage>[0], 'prerequisite' | 'logger' | 'requestHelper' | 'sellerConfig' | 'uuid' | 'orderItemCriteriaList'>} args.c2Args
       * @param {import('utility-types').Optional<ConstructorParameters<typeof AssertOpportunityCapacityFlowStage>[0], 'prerequisite' | 'requestHelper' | 'logger' | 'nameOfPreviousStage' | 'orderItemCriteriaList'>} args.assertOpportunityCapacityArgs
       */
      c2AssertCapacity(prerequisite, defaultFlowStageParams, { c2Args, assertOpportunityCapacityArgs }) {
        const c2 = new C2FlowStage({
          ...defaultFlowStageParams,
          prerequisite,
          ...c2Args,
        });
        const assertOpportunityCapacityAfterC2 = new AssertOpportunityCapacityFlowStage({
          ...defaultFlowStageParams,
          nameOfPreviousStage: 'C2',
          prerequisite: c2,
          ...assertOpportunityCapacityArgs,
        });
        return new FlowStageRun({
          c2,
          assertOpportunityCapacityAfterC2,
        }, ['c2', 'assertOpportunityCapacityAfterC2']);
      },
      /**
       * @param {UnknownFlowStageType} prerequisite
       * @param {DefaultFlowStageParams} defaultFlowStageParams
       * @param {object} args
       * @param {boolean} args.isExpectedToSucceed
       * @param {import('utility-types').Optional<ConstructorParameters<typeof BFlowStage>[0], 'prerequisite' | 'logger' | 'requestHelper' | 'sellerConfig' | 'uuid'>} args.bArgs
       * @param {FetchOpportunitiesFlowStage} args.fetchOpportunities
       * @param {AssertOpportunityCapacityFlowStage} args.previousAssertOpportunityCapacity
       */
      simpleBAssertCapacity(prerequisite, defaultFlowStageParams, { isExpectedToSucceed, bArgs, fetchOpportunities, previousAssertOpportunityCapacity }) {
        const b = new BFlowStage({
          ...defaultFlowStageParams,
          prerequisite,
          ...bArgs,
        });
        const assertOpportunityCapacityAfterB = new AssertOpportunityCapacityFlowStage({
          ...defaultFlowStageParams,
          nameOfPreviousStage: 'B',
          prerequisite: b,
          getInput: () => ({
            orderItems: fetchOpportunities.getOutput().orderItems,
            opportunityFeedExtractResponses: previousAssertOpportunityCapacity.getOutput().opportunityFeedExtractResponses,
          }),
          getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterBook(isExpectedToSucceed),
        });
        return new FlowStageRun({
          b,
          assertOpportunityCapacityAfterB,
        }, ['b', 'assertOpportunityCapacityAfterB']);
      },
    },
  },
};

/**
 * BFlowStage that succeeds a PFlowStage
 *
 * @param {object} args
 * @param {PFlowStageType} args.p
 * @param {DefaultFlowStageParams} args.defaultFlowStageParams
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

/**
 * @typedef {ReturnType<typeof FlowStageRecipes.runs.book.c1AssertCapacity>} C1AssertCapacityRun
 * @typedef {ReturnType<typeof FlowStageRecipes.runs.book.c2AssertCapacity>} C2AssertCapacityRun
 */

module.exports = {
  FlowStageRecipes,
};
