const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');
const { itShouldIncludeErrorForOnlyPrimaryOrderItems, itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'incomplete-order-item-no-opportunity',
  testName: 'Test for IncompleteOrderItemError with missing `orderedItem`',
  testDescription: 'Test for IncompleteOrderItemError (at C1, C2 and B). If there is a missing `orderedItem` property on the OrderItem.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Set up tests for noOrderedItem
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger,
    {
      c1ReqTemplateRef: 'noOrderedItem', c2ReqTemplateRef: 'noOrderedItem', bookReqTemplateRef: 'noOrderedItem',
    });

  // # Set up Tests
  /**
   * @param {C1FlowStageType | C2FlowStageType} flowStage
   */
  function itShouldIncludeIncompleteOrderItemErrorWhereRelevant(flowStage) {
    itShouldIncludeErrorForOnlyPrimaryOrderItems('IncompleteOrderItemError', {
      orderItemCriteriaList,
      getFeedOrderItems: () => fetchOpportunities.getOutput().orderItems,
      getOrdersApiResponse: () => flowStage.getOutput().httpResponse,
    });
  }

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: false }, c1, () => {
    itShouldIncludeIncompleteOrderItemErrorWhereRelevant(c1);
  });
  FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: false }, c2, () => {
    itShouldIncludeIncompleteOrderItemErrorWhereRelevant(c2);
  });
  FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
    itShouldReturnAnOpenBookingError('UnableToProcessOrderItemError', 409, () => bookRecipe.firstStage.getOutput().httpResponse);
  });
});
