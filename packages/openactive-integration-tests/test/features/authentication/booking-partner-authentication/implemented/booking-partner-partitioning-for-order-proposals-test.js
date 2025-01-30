const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, EnsureOrderIsNotPresentFlowStage } = require('../../../../helpers/flow-stages');
// const { generateUuid } = require('../../../../helpers/generate-uuid');

const { IMPLEMENTED_FEATURES } = global;

FeatureHelper.describeFeature(module, {
  runOnlyIf: IMPLEMENTED_FEATURES['minimal-proposal'],
  testCategory: 'authentication',
  testFeature: 'booking-partner-authentication',
  testFeatureImplemented: true,
  testIdentifier: 'booking-partner-partitioning-for-order-proposals',
  testName: "Booking Partners' Orders are Partitioned",
  testDescription: 'Order Proposals from two different bookings partners must not be visible to each other, and UUID must be unique within each booking partner',
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipBookingFlows: ['OpenBookingSimpleFlow'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
  /* TODO uncomment the below and use a single shared UUID for both primary and secondary tests once that is supported
  by the Reference Implementation */
  // const uuid = generateUuid();

  describe('with primary booking partner', () => {
    // ## Flow Stages
    const {
      fetchOpportunities,
      c1,
      c2,
      defaultFlowStageParams,
    } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, describeFeatureRecord, {
      bookingPartnerIdentifier: 'primary',
      // uuid,
    });
    const { p, simulateSellerApproval, orderFeedUpdateCollector } = FlowStageRecipes.proposeAndSimulateSellerApproval(defaultFlowStageParams, {
      prerequisite: c2.getLastStage(),
      getFirstStageInput: FlowStageRecipes.getSimpleBookFirstStageInput(
        fetchOpportunities,
        c1.getStage('c1'),
        c2.getStage('c2'),
      ),
      // TODO2 check that this is what is expected here?
      paymentIdentifierIfPaid: FlowStageRecipes.createRandomPaymentIdentifierIfPaid(),
    });

    // ## Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(p);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerApproval);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateCollector);
  });

  describe('with secondary booking partner', () => {
    // ## Flow Stages
    const defaultFlowStageParams = FlowStageUtils.createSimpleDefaultFlowStageParams({
      bookingPartnerIdentifier: 'secondary',
      // uuid,
      logger,
      describeFeatureRecord,
      orderItemCriteriaList,
    });
    // UUID should not be present in `secondary`s feed
    const ensureOrderIsNotPresent = new EnsureOrderIsNotPresentFlowStage({
      ...defaultFlowStageParams,
      initialWaitSecs: 6, // As Broker can wait up to 5 seconds before re-polling a feed.
      orderFeedType: 'order-proposals',
    });
    /* TODO uncomment the below when the problem with Ref Impl is fixed. Presently, the `secondary` cancellation
    never appears in the feed */
    // const {
    //   fetchOpportunities,
    //   c1,
    //   c2,
    // } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, {
    //   defaultFlowStageParams,
    //   prerequisite: ensureOrderIsNotPresent,
    // });
    // const { p, simulateSellerApproval, orderFeedUpdateCollector } = FlowStageRecipes.proposeAndSimulateSellerApproval(defaultFlowStageParams, {
    //   prerequisite: c2,
    //   getFirstStageInput: FlowStageRecipes.getSimpleBookFirstStageInput(fetchOpportunities, c1, c2),
    // });

    // ## Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(ensureOrderIsNotPresent);
    // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(p);
    // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerApproval);
    // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateCollector);
  });
});
