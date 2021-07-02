const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, CancelOrderFlowStage, OrderFeedUpdateFlowStageUtils, FlowStageUtils, EnsureOrderIsNotPresentFlowStage } = require('../../../../helpers/flow-stages');
const { generateUuid } = require('../../../../helpers/generate-uuid');

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'booking-partner-partitioning-for-orders',
  testName: "Booking Partners' Orders are Partitioned",
  testDescription: 'Orders from two different bookings partners must not be visible to each other, and UUID must be unique within each booking partner',
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const uuid = generateUuid();

  /**
   * @param {import('../../../../helpers/flow-stages/flow-stage-recipes').DefaultFlowStageParams} defaultFlowStageParams
   * @param {import('../../../../helpers/flow-stages/book-recipe').BookRecipeType} bookRecipe
   */
  function createCancelAndListenForFeedUpdateFlowStages(defaultFlowStageParams, bookRecipe) {
    return OrderFeedUpdateFlowStageUtils.wrap({
      wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
        ...defaultFlowStageParams,
        prerequisite,
        getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage),
      })),
      orderFeedUpdateParams: {
        ...defaultFlowStageParams,
        prerequisite: bookRecipe.lastStage,
        testName: 'Orders Feed (after cancellation)',
      },
    });
  }

  describe('with primary booking partner', () => {
    // ## Flow Stages
    const {
      fetchOpportunities,
      c1,
      c2,
      bookRecipe,
      defaultFlowStageParams,
    } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
      bookingPartnerIdentifier: 'primary',
      uuid,
    });
    const [cancel, orderFeedUpdate] = createCancelAndListenForFeedUpdateFlowStages(defaultFlowStageParams, bookRecipe);

    // ## Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancel);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate);
  });

  describe('with secondary booking partner', () => {
    // ## Flow Stages
    const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({
      bookingPartnerIdentifier: 'secondary',
      uuid,
      logger,
    });
    // UUID should not be present in `secondary`s feed
    const ensureOrderIsNotPresent = new EnsureOrderIsNotPresentFlowStage({
      ...defaultFlowStageParams,
      orderFeedType: 'orders',
      initialWaitSecs: 6, // As Broker can wait up to 5 seconds before re-polling a feed.
    });
    const {
      fetchOpportunities,
      c1,
      c2,
      bookRecipe,
    } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
      defaultFlowStageParams,
      prerequisite: ensureOrderIsNotPresent,
    });
    const [cancel, orderFeedUpdate] = createCancelAndListenForFeedUpdateFlowStages(defaultFlowStageParams, bookRecipe);

    // ## Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(ensureOrderIsNotPresent);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancel);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate);
  });
});
