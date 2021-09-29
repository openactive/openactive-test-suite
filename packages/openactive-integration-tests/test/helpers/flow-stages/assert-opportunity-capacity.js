const { utils: { getRemainingCapacity } } = require('@openactive/test-interface-criteria');
const { assertIsNotNullish } = require('@tool-belt/type-predicates');
const { expect } = require('chai');
const { zip } = require('lodash');
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

//  * @typedef {Required<Pick<FlowStageOutput, 'orderItems'>>} Input
//  * @typedef {{ opportunity: OrderItem['orderedItem'], orderItems: OrderItem[] }} ArgsToGetExpectedCapacity
//  * @typedef {(opportunity: OrderItem['orderedItem'], orderItems: OrderItem[]) => number} GetOpportunityExpectedCapacity

/**
 * @typedef {Required<Pick<FlowStageOutput, 'opportunityFeedExtractResponses' | 'orderItems'>>} Input
 * @typedef {Required<Pick<FlowStageOutput, 'opportunityFeedExtractResponses'>>} Output
 *
 * @typedef {{ opportunity: OrderItem['orderedItem'], count: number }} ArgsToGetExpectedCapacity
 * @typedef {(opportunity: OrderItem['orderedItem'], count: number) => number} GetOpportunityExpectedCapacity
 */

/**
 * @param {GetOpportunityExpectedCapacity} getOpportunityExpectedCapacity
 * @param {ChakramResponse[]} opportunityFeedExtractResponses
 * @returns Opportunity ID -> expected capacity for that Opportunity
 */
function getExpectedCapacitiesPerOpportunityId(getOpportunityExpectedCapacity, opportunityFeedExtractResponses) {
  // First, get the list of distinct Opportunities, along with the list of OrderItems that goes with each
  /** @type {Map<string, ArgsToGetExpectedCapacity>} */
  const argsToGetExpectedCapacitiesPerOpportunityId = new Map();
  for (const opportunityFeedExtractResponse of opportunityFeedExtractResponses) {
    const opportunity = getAndAssertOpportunityFromOpportunityFeedExtractResponse(opportunityFeedExtractResponse);
    const opportunityId = opportunity['@id'];
    const existing = argsToGetExpectedCapacitiesPerOpportunityId.get(opportunityId);
    if (existing) {
      existing.count += 1;
      // existing.orderItems.push(opportunityFeedExtractResponse);
    } else {
      /** @type {ArgsToGetExpectedCapacity} */
      const args = {
        opportunity,
        count: 1,
        // orderItems: [opportunityFeedExtractResponse],
      };
      argsToGetExpectedCapacitiesPerOpportunityId.set(opportunityId, args);
    }
  }
  // Then, get expected capacities using getOpportunityExpectedCapacity(..)
  /** @type {Map<string, number>} */
  const expectedCapacitiesPerOpportunityId = new Map();
  for (const [opportunityId, args] of argsToGetExpectedCapacitiesPerOpportunityId) {
    const expectedCapacity = getOpportunityExpectedCapacity(args.opportunity, args.count);
    expectedCapacitiesPerOpportunityId.set(opportunityId, expectedCapacity);
  }
  return expectedCapacitiesPerOpportunityId;
}

const DO_RUN_OPPORTUNITY_FEED_EXTRACT_ORDER_ITEM_PARITY_ASSERTIONS = true;

/**
 * @param {object} args
 * @param {GetOpportunityExpectedCapacity} args.getOpportunityExpectedCapacity
 * @param {FlowStageOutput['orderItems']} args.orderItems
 * @param {ChakramResponse[]} args.opportunityFeedExtractResponses
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
 */
async function runAssertOpportunityCapacity({
  getOpportunityExpectedCapacity,
  orderItems,
  opportunityFeedExtractResponses: initialOpportunityFeedExtractResponses,
  requestHelper,
}) {
  const expectedCapacitiesPerOpportunityId = getExpectedCapacitiesPerOpportunityId(getOpportunityExpectedCapacity, initialOpportunityFeedExtractResponses);
  const zippedWithOrderItems = zip(initialOpportunityFeedExtractResponses, orderItems);
  // PRE-CONDITION: opportunityFeedExtractResponses and orderItems are matched up so that they can be zipped together
  if (DO_RUN_OPPORTUNITY_FEED_EXTRACT_ORDER_ITEM_PARITY_ASSERTIONS) {
    expect(orderItems).to.have.lengthOf(initialOpportunityFeedExtractResponses.length);
    for (const [opportunityFeedExtractResponse, orderItem] of zippedWithOrderItems) {
      const opportunity = getAndAssertOpportunityFromOpportunityFeedExtractResponse(opportunityFeedExtractResponse);
      expect(orderItem.orderedItem['@id']).to.equal(opportunity['@id']);
    }
  }
  /* TODO could optimise to not have to duplicate getMatch requests for OrderItems that represent the same Opportunity
  - like in fetchOpportunityFeedExtractResponses(..) although it seems that that function could be improved to optimize
  more consistently */
  const opportunityFeedExtractResponses = await Promise.all(zippedWithOrderItems.map(async ([opportunityFeedExtractResponse, orderItem]) => {
    const opportunity = getAndAssertOpportunityFromOpportunityFeedExtractResponse(opportunityFeedExtractResponse);
    const opportunityId = opportunity['@id'];
    const expectedCapacity = expectedCapacitiesPerOpportunityId.get(opportunityId);
    assertIsNotNullish(expectedCapacity);
    return await requestHelper.getMatch(opportunityId, orderItem.position, true, { expectedCapacity });
  }));
  // const result = await Promise.all(orderItems.map(async (orderItem) => {
  //   const opportunityId = orderItem.orderedItem['@id'];
  //   const expectedCapacity = expectedCapacitiesPerOpportunityId.get(opportunityId);
  //   assertIsNotNullish(expectedCapacity);
  //   return await requestHelper.getMatch(orderItem.orderedItem['@id'], orderItem.position, true, { expectedCapacity });
  // }));
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
