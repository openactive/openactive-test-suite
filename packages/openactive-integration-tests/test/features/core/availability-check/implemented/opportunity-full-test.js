const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { Common } = require('../../../../shared-behaviours');
const { FlowStageUtils, FlowStageRecipes } = require('../../../../helpers/flow-stages');
const { itShouldReturnHttpStatus } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'availability-check',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-full',
  testName: 'OpportunityIsFullError returned for full OrderItems',
  testDescription: 'An availability check against a session filled to capacity. As no more capacity is available it is no-longer possible to obtain quotes.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableNoSpaces',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow2(orderItemCriteriaList, logger, { c1ExpectToFail: true, c2ExpectToFail: true });

  // # Set up Tests

  /**
   * C1/C2 should have returned that the full opportunity is indeed full.
   *
   * @param {C1FlowStageType | C2FlowStageType} flowStage
   */
  function itShouldReturnOpportunityIsFullError(flowStage) {
    itShouldReturnHttpStatus(409, () => flowStage.getOutput().httpResponse);

    Common.itForEachOrderItemByControl({
      orderItemCriteriaList,
      getFeedOrderItems: () => fetchOpportunities.getOutput().orderItems,
      getOrdersApiResponse: () => flowStage.getOutput().httpResponse,
    },
    'should include an OpportunityIsFullError',
    (feedOrderItem, apiResponseOrderItem, apiResponseOrderItemErrorTypes) => {
      expect(apiResponseOrderItemErrorTypes).to.include('OpportunityIsFullError');

      if (apiResponseOrderItem.orderedItem['@type'] === 'Slot') {
        expect(apiResponseOrderItem).to.nested.include({
          'orderedItem.remainingUses': 0,
        });
      } else {
        expect(apiResponseOrderItem).to.nested.include({
          'orderedItem.remainingAttendeeCapacity': 0,
        });
      }
    },
    'should not include an OpportunityIsFullError',
    (feedOrderItem, apiResponseOrderItem, apiResponseOrderItemErrorTypes) => {
      expect(apiResponseOrderItemErrorTypes).not.to.include('OpportunityIsFullError');

      if (apiResponseOrderItem.orderedItem['@type'] === 'Slot') {
        expect(apiResponseOrderItem).to.nested.include({
          'orderedItem.remainingUses': feedOrderItem.orderedItem.remainingUses,
        });
      } else {
        expect(apiResponseOrderItem).to.nested.include({
          'orderedItem.remainingAttendeeCapacity': feedOrderItem.orderedItem.remainingAttendeeCapacity,
        });
      }
    });
  }

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
    itShouldReturnOpportunityIsFullError(c1.getStage('c1'));
  });
  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldReturnOpportunityIsFullError(c2.getStage('c2'));
  });
});
