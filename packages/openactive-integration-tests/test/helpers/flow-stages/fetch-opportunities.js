const _ = require('lodash');
const config = require('config');
const { generateUuid } = require('../generate-uuid');
const { FlowStage } = require('./flow-stage');
const { OpportunityFeedUpdateFlowStage } = require('./opportunity-feed-update');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 */

/**
 * @typedef {{
 *   testInterfaceOpportunities: ChakramResponse[],
 *   opportunityFeedExtractResponses: ChakramResponse[],
 *   orderItems: OrderItem[],
 * }} FetchOpportunitiesResponse
 */

const USE_RANDOM_OPPORTUNITIES = config.get('useRandomOpportunities');
const SELLER_CONFIG = config.get('sellers');

/**
 * For each of the Opportunity Criteria, get or create (using https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities)
 * an opportunity that matches the criteria from the [test interface](https://openactive.io/test-interface/).
 *
 * The responses only contain minimal info like ID, so `runOpportunityFeedUpdate()`
 * needs to be called afterwards to actually get the full data of each opportunity.
 *
 * @param {object} args
 * @param {OpportunityCriteria[]} args.orderItemCriteriaList
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<ChakramResponse[]>}
 */
async function getOrCreateTestInterfaceOpportunities({ orderItemCriteriaList, requestHelper }) {
  // If an opportunityReuseKey is set, reuse the same opportunity for each OrderItem with that same opportunityReuseKey
  /**
   * Note that the reponses are stored wrapped in promises. This is because
   * opportunities are created/fetched concurrently.
   * If the responses were awaited before storing them in this cache, then
   * the same request may be made over and over.
   *
   * @type {Map<number, Promise<ChakramResponse>>}
   */
  const reusableOpportunityResponsePromises = new Map();

  /**
   * Test interface responses - one for each criteria. Only contains id
   */
  const testInterfaceOpportunities = await Promise.all(orderItemCriteriaList.map(async (orderItemCriteriaItem, i) => {
    // If an opportunity is available for reuse, return it
    const hasReuseKey = !_.isNil(orderItemCriteriaItem.opportunityReuseKey);
    if (hasReuseKey && reusableOpportunityResponsePromises.has(orderItemCriteriaItem.opportunityReuseKey)) {
      return await reusableOpportunityResponsePromises.get(orderItemCriteriaItem.opportunityReuseKey);
    }

    const sellerKey = orderItemCriteriaItem.seller || 'primary';
    const seller = SELLER_CONFIG[sellerKey];
    const opportunityResponsePromise = USE_RANDOM_OPPORTUNITIES
      ? requestHelper.getRandomOpportunity(
        orderItemCriteriaItem.opportunityType,
        orderItemCriteriaItem.opportunityCriteria,
        i,
        seller['@id'],
        seller['@type'],
      ) : requestHelper.createOpportunity(
        orderItemCriteriaItem.opportunityType,
        orderItemCriteriaItem.opportunityCriteria,
        i,
        seller['@id'],
        seller['@type'],
      );

    // If this opportunity can be reused, store it
    if (hasReuseKey) {
      reusableOpportunityResponsePromises.set(orderItemCriteriaItem.opportunityReuseKey, opportunityResponsePromise);
    }

    return await opportunityResponsePromise;
  }));
  return testInterfaceOpportunities;
}

const FetchOpportunitiesFlowStage = {
  /**
   * @param {object} args
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {string} [args.uuid] UUID to use for Order. If excluded, this will
   *   be generated.
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   */
  create({ orderItemCriteriaList, uuid, requestHelper, logger }) {
    return new FlowStage({
      testName: 'Fetch Opportunities',
      runFn: async () => await FetchOpportunitiesFlowStage.run({ orderItemCriteriaList, requestHelper }),
      itSuccessChecksFn(flowStage) {
        OpportunityFeedUpdateFlowStage.itSuccessChecks({
          orderItemCriteriaList,
          getterFn: () => flowStage.getResponse(),
        });
      },
      itValidationTestsFn(flowStage) {
        OpportunityFeedUpdateFlowStage.itValidationTests({
          logger,
          orderItemCriteriaList,
          getterFn: () => flowStage.getResponse(),
        });
      },
      initialState: {
        uuid: uuid || generateUuid(),
        sellerId: SELLER_CONFIG.primary['@id'],
        orderItemCriteriaList,
      },
    });
  },

  /**
   * For each of the Opportunity Criteria, fetch an opportunity that matches
   * the criteria from the [test interface](https://openactive.io/test-interface/).
   *
   * @param {object} args
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {RequestHelperType} args.requestHelper
   * @returns {Promise<import('./flow-stage').FlowStageOutput<FetchOpportunitiesResponse>>}
    */
  async run({ orderItemCriteriaList, requestHelper }) {
    // ## Get Test Interface Opportunities
    const testInterfaceOpportunities = await getOrCreateTestInterfaceOpportunities({ orderItemCriteriaList, requestHelper });

    // ## Get full Opportunity data for each
    //
    // Now that we have references to some opportunities that have been found or
    // created and match our criteria, let's get the full opportunities
    const opportunityFeedUpdateResult = await OpportunityFeedUpdateFlowStage.run({
      testInterfaceOpportunities,
      orderItemCriteriaList,
      requestHelper,
    });

    // ## Combine responses
    if (!('response' in opportunityFeedUpdateResult.result)) {
      // If the above condition is true, opportunityFeedUpdateResult doesn't have
      // a response, and therefore, FlowStageOutputs are interchangeable.
      // Therefore, we bypass TS
      return /** @type {any} */(opportunityFeedUpdateResult);
    }

    return {
      result: {
        status: 'response-received',
        response: {
          ...opportunityFeedUpdateResult.result.response,
          testInterfaceOpportunities,
        },
      },
      state: {
        ...(opportunityFeedUpdateResult.state || {}),
        testInterfaceOpportunities,
      },
    };
  },
};

module.exports = {
  FetchOpportunitiesFlowStage,
};
