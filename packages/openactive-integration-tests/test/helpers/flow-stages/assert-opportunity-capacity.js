const { utils: { getRemainingCapacity } } = require('@openactive/test-interface-criteria');
const { uniqBy, intersection } = require('lodash');
const sharedValidationTests = require('../../shared-behaviours/validation');
const { assertIsNotNullish } = require('../asserts');
const { pMapWithCache } = require('../utils');
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
 * @typedef {{ count: number, orderItems: OrderItem[] }} GetOpportunityExpectedCapacityExtraArgs
 * @typedef {(opportunity: OrderItem['orderedItem'], extra: GetOpportunityExpectedCapacityExtraArgs) => number} GetOpportunityExpectedCapacity
 */

const { IMPLEMENTED_FEATURES } = global;

/**
 * Info needed to make GetMatch request for each unique Opportunity
 *
 * @param {GetOpportunityExpectedCapacity} getOpportunityExpectedCapacity
 * @param {ChakramResponse[]} opportunityFeedExtractResponses
 * @param {OrderItem[]} orderItems
 * @returns Opportunity ID -> { ... }
 */
function getGetMatchRequestInfoByOpportunityId(getOpportunityExpectedCapacity, opportunityFeedExtractResponses, orderItems) {
  const uniqueOpportunities = uniqBy(opportunityFeedExtractResponses,
    response => getAndAssertOpportunityFromOpportunityFeedExtractResponse(response)['@id'])
    .map(response => getAndAssertOpportunityFromOpportunityFeedExtractResponse(response));
  return new Map(uniqueOpportunities.map((opportunity) => {
    const count = opportunityFeedExtractResponses.filter(response => (
      getAndAssertOpportunityFromOpportunityFeedExtractResponse(response)['@id'] === opportunity['@id'])).length;
    const orderItemsForThisOpportunity = orderItems.filter(item => item.orderedItem['@id'] === opportunity['@id']);
    const firstOrderItem = orderItemsForThisOpportunity[0];
    assertIsNotNullish(firstOrderItem);
    const expectedCapacity = getOpportunityExpectedCapacity(opportunity, { count, orderItems: orderItemsForThisOpportunity });
    return [opportunity['@id'], {
      opportunity,
      orderItem: firstOrderItem,
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
  const expectedCapacityForEachUniqueOpportunity = getGetMatchRequestInfoByOpportunityId(
    getOpportunityExpectedCapacity, initialOpportunityFeedExtractResponses, orderItems,
  );
  // TODO TODO TODO how to use a same pattern here as with other `reusable-`s..?
  /* This cache is not just an optimization but a necessity. Broker rejects old GetMatch requests if it gets a new
  request for the same Opportunity ID. So, this cache means that there will only be one request per Opportunity ID */
  const opportunityFeedExtractResponses = await pMapWithCache(
    initialOpportunityFeedExtractResponses,
    opportunityFeedExtractResponse => (
      getAndAssertOpportunityFromOpportunityFeedExtractResponse(opportunityFeedExtractResponse)['@id']),
    (opportunityFeedExtractResponse, opportunityId) => {
      const getMatchDetails = expectedCapacityForEachUniqueOpportunity.get(opportunityId);
      assertIsNotNullish(getMatchDetails);
      const { opportunity, orderItem, expectedCapacity } = getMatchDetails;
      return requestHelper.getMatch(opportunity['@id'], orderItem.position, true, { expectedCapacity });
    },
  );
  /* This is output from this FlowStage so that a future AssertOpportunityCapacityFlowStage can use it
  e.g. if C1 is supposed to change capacity, then an Assert.. FlowStage after C2 can be set to expect that capacity
  has not changed since it was checked in C1 by using the opportunityFeedExtractResponses that are output from the
  Assert.. FlowStage after C1 */
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
   * @param {string} args.nameOfPreviousStage
   * @param {GetOpportunityExpectedCapacity} args.getOpportunityExpectedCapacity Function which, when given an
   *   Opportunity, returns the expected capacity for that Opportunity. e.g. it might be
   *   `(opportunity) => getRemainingCapacity(opportunity) - 1` to indicate that the capacity should have
   *   gone down by one.
   *
   *   This function is given these args:
   *   - opportunity: The Opportunity (as it was in getInput().opportunityFeedExtractResponses)
   *   - extra:
   *     - count: The number of times this opportunity appeared in getInput().opportunityFeedExtractResponses.
   *     - orderItems[]: An array of OrderItems. An Opportunity can be included in an Order multiple times to represent
   *       purchasing space at the Opportunity for multiple people. So this array contains all OrderItems which contain
   *       this Opportunity. You can therefore use `orderItems.length` to determine how many times the Opportunity is
   *       used in the Order.
   * @param {() => Input} args.getInput
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {FlowStage<unknown, unknown>} args.prerequisite
   * @param {RequestHelperType} args.requestHelper
   * @param {BaseLoggerType} args.logger
   */
  constructor({ nameOfPreviousStage, getOpportunityExpectedCapacity, getInput, orderItemCriteriaList, prerequisite, requestHelper, logger }) {
    super({
      testName: `Assert Opportunity Capacity (after ${nameOfPreviousStage})`,
      getInput,
      prerequisite,
      /* Capacity Checks should occur even if the FlowStage that precedes it is expected to fail. This is because the
      check should be calibrated to detect that - as it has failed - the capacity has not changed as it would have done
      had it succeeded */
      alwaysDoSuccessChecks: true,
      async runFn(input) {
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
      itValidationTestsFn: (flowStage) => {
        orderItemCriteriaList.forEach((orderItemCriteriaItem, i) => {
          sharedValidationTests.shouldBeValidResponse(
            () => flowStage.getOutput().opportunityFeedExtractResponses[i],
            `Opportunity Feed extract for OrderItem ${i}`,
            logger,
            {
              validationMode: 'BookableRPDEFeed',
            },
            orderItemCriteriaItem.opportunityCriteria,
          );
        });
      },
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
   * @param {object} args
   * @param {number} args.count
   */
  static getOpportunityDecrementedCapacity(opportunity, { count }) {
    // We use -count rather than -1 because the Opportunity may have been included multiple times in
    // the Order. If it's used twice, its capacity should have decreased by 2 rather than 1.
    return getRemainingCapacity(opportunity) - count;
  }

  /**
   * Use this for an capacity assertion that occurs after a successful cancellation. The cancellation will have been
   * configured to cancel specific OrderItems by position. So, the OrderItems with those cancelled positions should
   * have had their capacity incremented.
   *
   * @param {number[]} orderItemPositions
   */
  static getOpportunityCapacityIncrementedForOrderItemPositions(orderItemPositions) {
    /**
     * @param {OrderItem['orderedItem']} opportunity
     * @param {object} args
     * @param {OrderItem[]} args.orderItems
     */
    const getOpportunityExpectedCapacity = (opportunity, { orderItems }) => {
      const initialCapacity = getRemainingCapacity(opportunity);
      const intersectingPositions = intersection(orderItemPositions, orderItems.map(item => item.position));
      const numOrderItemsForThisOpportunityThatRequireAnIncrement = intersectingPositions.length;
      return initialCapacity + numOrderItemsForThisOpportunityThatRequireAnIncrement;
    };
    return getOpportunityExpectedCapacity;
  }

  /**
   * @param {boolean} isExpectedToSucceed Is C1 expected to succeed or fail? If fail, then, capacity will be expected
   * to not have changed.
   */
  static getOpportunityExpectedCapacityAfterC1(isExpectedToSucceed) {
    return (isExpectedToSucceed && IMPLEMENTED_FEATURES['anonymous-leasing'])
      // C1 should decrement capacity when anonymous-leasing is supported as C1 will do a lease
      ? AssertOpportunityCapacityFlowStage.getOpportunityDecrementedCapacity
      : AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity;
  }

  /**
   * @param {boolean} isExpectedToSucceed Is C2 expected to succeed or fail? If fail, then, capacity will be expected
   * to not have changed.
   */
  static getOpportunityExpectedCapacityAfterC2(isExpectedToSucceed) {
    return (isExpectedToSucceed && (!IMPLEMENTED_FEATURES['anonymous-leasing'] && IMPLEMENTED_FEATURES['named-leasing']))
      // C2 should decrement capacity when named-leasing is supported as C2 will do a lease
      ? AssertOpportunityCapacityFlowStage.getOpportunityDecrementedCapacity
      : AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity;
  }

  /**
   * Similar to getOpportunityExpectedCapacityAfterC2(..) but for tests which skip C1. This means that the capacity
   * will be expected to have changed if either anon- or named-leasing are enabled.
   *
   * @param {boolean} isExpectedToSucceed Is C2 expected to succeed or fail? If fail, then, capacity will be expected
   * to not have changed.
   */
  static getOpportunityExpectedCapacityAfterC2SkippingC1(isExpectedToSucceed) {
    return (isExpectedToSucceed && (IMPLEMENTED_FEATURES['anonymous-leasing'] || IMPLEMENTED_FEATURES['named-leasing']))
      // C2 should decrement capacity when named-leasing is supported as C2 will do a lease
      ? AssertOpportunityCapacityFlowStage.getOpportunityDecrementedCapacity
      : AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity;
  }

  /**
   * @param {boolean} isExpectedToSucceed Is Book expected to succeed or fail? If fail, then, capacity will be expected
   * to not have changed.
   */
  static getOpportunityExpectedCapacityAfterBook(isExpectedToSucceed) {
    return (isExpectedToSucceed && (!IMPLEMENTED_FEATURES['anonymous-leasing'] && !IMPLEMENTED_FEATURES['named-leasing']))
      // B should decrement capacity if leasing is not supported (as it won't have happened at C1 or C2)
      ? AssertOpportunityCapacityFlowStage.getOpportunityDecrementedCapacity
      : AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity;
  }

  /**
   * For use after a Book-only flow (i.e. with no C1 -> C2)
   *
   * @param {boolean} isExpectedToSucceed Is Book expected to succeed or fail? If fail, then, capacity will be expected
   * to not have changed.
   */
  static getOpportunityExpectedCapacityAfterBookOnly(isExpectedToSucceed) {
    return isExpectedToSucceed
      ? AssertOpportunityCapacityFlowStage.getOpportunityDecrementedCapacity
      : AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity;
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

/**
 * @typedef {InstanceType<typeof AssertOpportunityCapacityFlowStage>} AssertOpportunityCapacityFlowStageType
 */

module.exports = {
  AssertOpportunityCapacityFlowStage,
};
