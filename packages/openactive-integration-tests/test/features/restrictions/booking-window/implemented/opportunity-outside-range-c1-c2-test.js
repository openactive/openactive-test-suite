const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { Common } = require('../../../../shared-behaviours/common');
const { itShouldReturnHttpStatus } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'restrictions',
  testFeature: 'booking-window',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-outside-range-c1-c2',
  testName: 'Running C1 and C2 for opportunity outside range should fail',
  testDescription: 'Booking an opportunity outside the specified booking window',
  testOpportunityCriteria: 'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, describeFeatureRecord, {
    c1ExpectToFail: true,
    c2ExpectToFail: true,
  });

  /**
   * @param {C1FlowStageType | C2FlowStageType} flowStage
   */
  const itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant = (flowStage) => {
    itShouldReturnHttpStatus(409, () => flowStage.getOutput().httpResponse);

    Common.itForEachOrderItemByControl({
      orderItemCriteriaList,
      getFeedOrderItems: () => fetchOpportunities.getOutput().orderItems,
      getOrdersApiResponse: () => flowStage.getOutput().httpResponse,
    },
    'should include an OpportunityOfferPairNotBookableError',
    (feedOrderItem, responseOrderItem, responseOrderItemErrorTypes) => {
      expect(responseOrderItemErrorTypes).to.include('OpportunityOfferPairNotBookableError');
    },
    'should not include an OpportunityOfferPairNotBookableError',
    (feedOrderItem, responseOrderItem, responseOrderItemErrorTypes) => {
      expect(responseOrderItemErrorTypes).not.to.include('OpportunityOfferPairNotBookableError');
    });
  };

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(c1.getStage('c1'));
  });
  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(c2.getStage('c2'));
  });
});
