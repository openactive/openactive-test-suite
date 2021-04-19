const { expect } = require('chai');
const { Common } = require('../../../shared-behaviours');

/**
 * @typedef {import('../../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../../helpers/flow-stages/b').BFlowStageType} BFlowStageType
 */

/**
 * @param {object} args
 * @param {OpportunityCriteria[]} args.orderItemCriteriaList
 * @param {FetchOpportunitiesFlowStageType} args.fetchOpportunitiesFlowStage
 * @param {C2FlowStageType | BFlowStageType} args.apiFlowStage
 */
function itEachOrderItemIdShouldMatchThoseFromFeed({
  orderItemCriteriaList,
  fetchOpportunitiesFlowStage,
  apiFlowStage,
}) {
  Common.itForEachOrderItem({
    orderItemCriteriaList,
    getFeedOrderItems: () => fetchOpportunitiesFlowStage.getOutput().orderItems,
    getOrdersApiResponse: () => apiFlowStage.getOutput().httpResponse,
    testName: 'ID should match the one specified in the open data feed',
  }, (feedOrderItem, apiResponseOrderItem) => {
    expect(apiResponseOrderItem).to.nested.include({
      'orderedItem.@id': feedOrderItem.orderedItem['@id'],
    });
  });
}

module.exports = {
  itEachOrderItemIdShouldMatchThoseFromFeed,
};
