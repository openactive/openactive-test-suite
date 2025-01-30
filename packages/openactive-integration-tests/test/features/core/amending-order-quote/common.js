const { expect } = require('chai');
const { AssertOpportunityCapacityFlowStage } = require('../../../helpers/flow-stages/assert-opportunity-capacity');
const { Common } = require('../../../shared-behaviours');

const RUN_TESTS_WHICH_FAIL_REFIMPL = process.env.RUN_TESTS_WHICH_FAIL_REFIMPL === 'true';

/**
 * @typedef {import('../../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../../helpers/flow-stages/b').BFlowStageType} BFlowStageType
 * @typedef {InstanceType<import('../../../helpers/flow-stages/book-recipe')['BookRecipe']>} BookRecipe
 */

/**
 * @param {object} args
 * @param {OpportunityCriteria[]} args.orderItemCriteriaList
 * @param {FetchOpportunitiesFlowStageType} args.fetchOpportunitiesFlowStage
 * @param {C2FlowStageType | BFlowStageType} args.apiFlowStage
 * @param {BookRecipe} [args.bookRecipe]
 */
function itEachOrderItemIdShouldMatchThoseFromFeed({
  orderItemCriteriaList,
  fetchOpportunitiesFlowStage,
  apiFlowStage,
  bookRecipe,
}) {
  Common.itForEachOrderItem({
    orderItemCriteriaList,
    getFeedOrderItems: () => fetchOpportunitiesFlowStage.getOutput().orderItems,
    getOrdersApiResponse: () => apiFlowStage.getOutput().httpResponse,
    getBookFirstStageResponse: bookRecipe && (() => bookRecipe.firstStage.getOutput().httpResponse),
  },
  'ID should match the one specified in the open data feed',
  (feedOrderItem, apiResponseOrderItem) => {
    expect(apiResponseOrderItem).to.nested.include({
      'orderedItem.@id': feedOrderItem.orderedItem['@id'],
    });
  });
}

const AmendingOrderQuoteFlowStageRecipes = {
  /**
   * @param {string} nameOfPreviousStage
   * @param {import('../../../helpers/flow-stages/flow-stage').UnknownFlowStageType} prerequisite
   * @param {import('../../../helpers/flow-stages/flow-stage-recipes').DefaultFlowStageParams} defaultFlowStageParams
   * @param {FetchOpportunitiesFlowStageType} firstAttemptFetchOpportunities
   */
  assertFirstAttemptOpportunitiesHaveRegainedCapacity(nameOfPreviousStage, prerequisite, defaultFlowStageParams, firstAttemptFetchOpportunities) {
    return new AssertOpportunityCapacityFlowStage({
      ...defaultFlowStageParams,
      // Capacity is not correctly restored after amendment in RefImpl: https://github.com/openactive/OpenActive.Server.NET/issues/168
      doSkip: !RUN_TESTS_WHICH_FAIL_REFIMPL,
      prerequisite,
      nameOfPreviousStage,
      // Capacity for the first Order should have reverted to how it started
      getInput: () => firstAttemptFetchOpportunities.getOutput(),
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity,
    });
  },
};

module.exports = {
  itEachOrderItemIdShouldMatchThoseFromFeed,
  AmendingOrderQuoteFlowStageRecipes,
};
