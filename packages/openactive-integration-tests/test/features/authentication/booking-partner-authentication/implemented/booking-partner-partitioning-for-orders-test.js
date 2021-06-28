const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, CancelOrderFlowStage, OrderFeedUpdateFlowStageUtils, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { generateUuid } = require('../../../../helpers/generate-uuid');

FeatureHelper.describeFeature(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'booking-partner-partitioning-for-orders-test',
  testName: "Booking Partners' Orders are Partitioned",
  testDescription: 'Orders from two different bookings partners must not be visible to each other, and UUID must be unique within each booking partner',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const uuid = generateUuid();

  /**
   * @param {import('../../../../helpers/request-helper').BookingPartnerIdentifier} bookingPartnerIdentifier
   */
  function createBookAndCancelFlowStages(bookingPartnerIdentifier) {
    const {
      fetchOpportunities,
      c1,
      c2,
      bookRecipe,
      defaultFlowStageParams,
    } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
      bookingPartnerIdentifier,
      uuid,
    });
    const [cancel, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
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
    return {
      fetchOpportunities,
      c1,
      c2,
      bookRecipe,
      cancel,
      orderFeedUpdate,
    };
  }

  describe('with primary booking partner', () => {
    // ## Flow Stages
    const {
      fetchOpportunities,
      c1,
      c2,
      bookRecipe,
      cancel,
      orderFeedUpdate,
    } = createBookAndCancelFlowStages('primary');

    // ## Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancel);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate);
  });

  describe('with secondary booking partner', () => {
    // TODO implement this mf
    const ensureUuidNotInFeed = new EnsureUuidNotInFeed({
      ...defaultFlowStageParams,
      uuid,
    });
    // ## Flow Stages
    const {
      fetchOpportunities,
      c1,
      c2,
      bookRecipe,
      cancel,
      orderFeedUpdate,
    } = createBookAndCancelFlowStages('primary');

    // ## Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(ensureUuidNotInFeed);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancel);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate);
  });
});
