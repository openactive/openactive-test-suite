const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { Common } = require('../../../../shared-behaviours');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

/* NOTE: These tests (Common.itForEachOrderItemShouldHaveUnchangedCapacity) are
now automatically run whenever C1 / C2 are called, so this test is redundant,
but it is kept for documentational purposes — it makes it clear that this is an
important aspect that must be adhered to */
FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'availability-check',
  testFeatureImplemented: true,
  testIdentifier: 'availability-confirmed',
  testName: 'Occupancy in C1 and C2 matches feed',
  testDescription: 'Runs C1 and C2 for a known opportunity from the feed, and compares the results to those attained from the feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, describeFeatureRecord);

  // # Set up Tests

  /**
   * Occupancy in the result from calling C1 or C2 should match that found in the open data feed.
   *
   * @param {C1FlowStageType | C2FlowStageType} flowStage
   */
  function itShouldMatchOccupancy(flowStage) {
    Common.itForEachOrderItemShouldHaveUnchangedCapacity({
      orderItemCriteriaList,
      getFeedOrderItems: () => fetchOpportunities.getOutput().orderItems,
      getOrdersApiResponse: () => flowStage.getOutput().httpResponse,
    });
  }

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldMatchOccupancy(c1.getStage('c1'));
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldMatchOccupancy(c2.getStage('c2'));
  });
});
