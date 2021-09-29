const { utils: { getRemainingCapacity } } = require('@openactive/test-interface-criteria');
const { assertIsNotNullish } = require('@tool-belt/type-predicates');
const { uniqBy } = require('lodash');
const { FlowStage } = require('./flow-stage');
const { itSuccessChecksOpportunityFeedUpdateCollector } = require('./opportunity-feed-update');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'opportunityFeedExtractResponses' | 'orderItems'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'opportunityFeedExtractResponses'>>} Output
 *
 * @typedef {{ opportunity: OrderItem['orderedItem'], count: number }} ArgsToGetExpectedCapacity
 * @typedef {(opportunity: OrderItem['orderedItem'], count: number) => number} GetOpportunityExpectedCapacity
 */

// TODO TODO TODO doc and better name
/**
 * @param {GetOpportunityExpectedCapacity} getOpportunityExpectedCapacity
 * @param {ChakramResponse[]} opportunityFeedExtractResponses
 * @param {OrderItem[]} orderItems
 * @returns Opportunity ID -> { ... }
 */
function getExpectedCapacityForEachUniqueOpportunity(getOpportunityExpectedCapacity, opportunityFeedExtractResponses, orderItems) {
  const uniqueOpportunities = uniqBy(opportunityFeedExtractResponses,
    response => getAndAssertOpportunityFromOpportunityFeedExtractResponse(response)['@id'])
    .map(response => getAndAssertOpportunityFromOpportunityFeedExtractResponse(response));
  return new Map(uniqueOpportunities.map((opportunity) => {
    const count = opportunityFeedExtractResponses.filter(response => (
      getAndAssertOpportunityFromOpportunityFeedExtractResponse(response)['@id'] === opportunity['@id'])).length;
    const orderItem = orderItems.find(item => item.orderedItem['@id'] === opportunity['@id']);
    assertIsNotNullish(orderItem);
    const expectedCapacity = getOpportunityExpectedCapacity(opportunity, count);
    return [opportunity['@id'], {
      opportunity,
      orderItem,
      expectedCapacity,
    }];
  }));
}

/**
 * @param {object} args
 * @param {GetOpportunityExpectedCapacity} args.getOpportunityExpectedCapacity
 * @param {ChakramResponse[]} args.opportunityFeedExtractResponses
 * @param {FlowStageOutput['orderItems']} args.orderItems
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runAssertOpportunityCapacity({
  getOpportunityExpectedCapacity,
  opportunityFeedExtractResponses: initialOpportunityFeedExtractResponses,
  orderItems,
  requestHelper,
}) {
  const expectedCapacityForEachUniqueOpportunity = getExpectedCapacityForEachUniqueOpportunity(
    getOpportunityExpectedCapacity, initialOpportunityFeedExtractResponses, orderItems,
  );
  // TODO TODO TODO put this pattern into a function
  /** @type {Map<string, Promise<ChakramResponse>>} */
  const reusableGetMatchPromises = new Map();
  const opportunityFeedExtractResponsePromises = initialOpportunityFeedExtractResponses.map((opportunityFeedExtractResponse) => {
    const opportunityId = getAndAssertOpportunityFromOpportunityFeedExtractResponse(opportunityFeedExtractResponse)['@id'];
    if (reusableGetMatchPromises.has(opportunityId)) {
      return reusableGetMatchPromises.get(opportunityId);
    }
    const getMatchDetails = expectedCapacityForEachUniqueOpportunity.get(opportunityId);
    assertIsNotNullish(getMatchDetails);
    const { opportunity, orderItem, expectedCapacity } = getMatchDetails;
    const matchPromise = requestHelper.getMatch(opportunity['@id'], orderItem.position, true, { expectedCapacity });
    reusableGetMatchPromises.set(opportunityId, matchPromise);
    return matchPromise;
  });
  const opportunityFeedExtractResponses = await Promise.all(opportunityFeedExtractResponsePromises);
  return {
    opportunityFeedExtractResponses,
  };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class AssertOpportunityCapacityFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {GetOpportunityExpectedCapacity} args.getOpportunityExpectedCapacity Function which, when given an
   *   Opportunity, returns the expected capacity for that Opportunity. e.g. it might be
   *   `(opportunity) => getRemainingCapacity(opportunity) - 1` to indicate that the capacity should have
   *   gone down by one.
   *
   *   This function is given two args:
   *   - opportunity: The Opportunity
   *   - orderItems[]: An array of OrderItems. An Opportunity can be included in an Order multiple times to represent
   *     purchasing space at the Opportunity for multiple people. So this array contains all OrderItems which contain
   *     this Opportunity. You can therefore use `orderItems.length` to determine how many times the Opportunity is
   *     used in the Order.
   * @param {() => Input} args.getInput
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {FlowStage<unknown, unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   */
  constructor({ getOpportunityExpectedCapacity, getInput, orderItemCriteriaList, prerequisite, requestHelper }) {
    super({
      testName: 'Assert Opportunity Capacity',
      getInput,
      prerequisite,
      async runFn(input) {
        // const { orderItems } = input;
        const { opportunityFeedExtractResponses, orderItems } = input;
        return await runAssertOpportunityCapacity({
          getOpportunityExpectedCapacity,
          orderItems,
          opportunityFeedExtractResponses,
          requestHelper,
        });
      },
      itSuccessChecksFn(flowStage) {
        itSuccessChecksOpportunityFeedUpdateCollector({
          orderItemCriteriaList,
          getterFn: () => flowStage.getOutput(),
        });
      },
      // TODO validation
      itValidationTestsFn: () => { },
    });
  }

  /**
   * Use this as getOpportunityExpectedCapacity when the capacity is expected not to have changed since the
   * OrderItems were first constructed.
   *
   * @param {OrderItem['orderedItem']} opportunity
   */
  static getOpportunityUnchangedCapacity(opportunity) {
    return getRemainingCapacity(opportunity);
  }

  /**
   * Use this as getOpportunityExpectedCapacity when the capacity is expected to have been decremented since the
   * OrderItems were first constructed i.e. because they've been leased or booked.
   *
   * @param {OrderItem['orderedItem']} opportunity
   * @param {number} count
   */
  static getOpportunityDecrementedCapacity(opportunity, count) {
    // We use -count rather than -1 because the Opportunity may have been included multiple times in
    // the Order. If it's used twice, its capacity should have decreased by 2 rather than 1.
    return getRemainingCapacity(opportunity) - count;
  }
}

/**
 * @param {ChakramResponse} opportunityFeedExtractResponse
 * @returns {OrderItem['orderedItem']}
 */
function getAndAssertOpportunityFromOpportunityFeedExtractResponse(opportunityFeedExtractResponse) {
  const opportunity = opportunityFeedExtractResponse.body?.data;
  assertIsNotNullish(opportunity);
  return opportunity;
}

module.exports = {
  AssertOpportunityCapacityFlowStage,
};
