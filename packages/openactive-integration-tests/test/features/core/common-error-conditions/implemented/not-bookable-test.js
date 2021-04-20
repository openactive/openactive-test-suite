const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { Common } = require('../../../../shared-behaviours');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'not-bookable',
  testName: 'Expect an OpportunityOfferPairNotBookableError when booking not bookable opportunity',
  testDescription: 'Runs C1, C2 and B for an opportunity that is not bookable, expecting an OpportunityOfferPairNotBookableError to be returned at C1 and C2, and an UnableToProcessOrderItemError to be returned at B',
  // The primary opportunity criteria to use for the primary OrderItem under test
  // TODO Note:Should use opportunity criteria: TestOpportunityNotBookableViaAvailableChannel? but it didn't find anything there so I replicated similar to test: opportunity-outside-range-c1-c2 because they produce same error?
  testOpportunityCriteria: 'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);

  // # Set up Tests
  /**
   * @param {C1FlowStageType | C2FlowStageType} flowStage
   */
  function itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(flowStage) {
    it('should return 409', () => {
      expect(flowStage.getOutput().httpResponse.response.statusCode).to.equal(409);
    });

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
  }

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(c1);
  });
  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(c2);
  });
  FlowStageUtils.describeRunAndCheckIsValid(b, () => {
    itShouldReturnAnOpenBookingError('UnableToProcessOrderItemError', 409, () => b.getOutput().httpResponse);
  });
});
