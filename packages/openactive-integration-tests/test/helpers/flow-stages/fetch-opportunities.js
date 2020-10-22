const _ = require('lodash');
const config = require('config');
// const { generateUuid } = require('../generate-uuid');
const { FlowStage } = require('./flow-stage');
const { OpportunityFeedUpdateFlowStage } = require('./opportunity-feed-update');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {{}} Input
 * @typedef {Required<Pick<FlowStageOutput, 'testInterfaceOpportunities' | 'opportunityFeedExtractResponses' | 'orderItems'>>} Output
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

/**
 * For each of the Opportunity Criteria, fetch an opportunity that matches
 * the criteria from the [test interface](https://openactive.io/test-interface/).
 *
 * @param {object} args
 * @param {OpportunityCriteria[]} args.orderItemCriteriaList
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
  */
async function runFetchOpportunities({ orderItemCriteriaList, requestHelper }) {
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
  // if (!('response' in opportunityFeedUpdateResult.result)) {
  //   // If the above condition is true, opportunityFeedUpdateResult doesn't have
  //   // a response, and therefore, FlowStageOutputs are interchangeable.
  //   // Therefore, we bypass TS
  //   return /** @type {any} */(opportunityFeedUpdateResult);
  // }
  return {
    ...opportunityFeedUpdateResult,
    testInterfaceOpportunities,
  };

  // return {
  //   result: {
  //     status: 'response-received',
  //     response: {
  //       ...opportunityFeedUpdateResult.result.response,
  //       testInterfaceOpportunities,
  //     },
  //   },
  //   state: {
  //     ...(opportunityFeedUpdateResult.state || {}),
  //     testInterfaceOpportunities,
  //   },
  // };
}

/**
 * Generally the first FlowStage which is run in a test.
 * It gets/creates some opportunities from the BookingSystem's opportunity feed.
 * These opportunities will then be used by subsequent stages.
 * It makes use of the OpportunityFeedUpdate FlowStage as both stages fetch opportunities
 * from the opportunities feed.
 *
 * @extends {FlowStage<Input, Output>}
 */
class FetchOpportunitiesFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {string} [args.uuid] UUID to use for Order. If excluded, this will
   *   be generated.
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   */
  constructor({ orderItemCriteriaList, requestHelper, logger }) {
    super({
      testName: 'Fetch Opportunities',
      getInput: FlowStageUtils.emptyGetInput,
      runFn: async () => await runFetchOpportunities({ orderItemCriteriaList, requestHelper }),
      itSuccessChecksFn(flowStage) {
        OpportunityFeedUpdateFlowStage.itSuccessChecks({
          orderItemCriteriaList,
          getterFn: () => flowStage.getOutput(),
        });
      },
      itValidationTestsFn(flowStage) {
        OpportunityFeedUpdateFlowStage.itValidationTests({
          logger,
          orderItemCriteriaList,
          getterFn: () => flowStage.getOutput(),
        });
      },
      // initialState: {
      //   uuid: uuid || generateUuid(),
      //   sellerId: SELLER_CONFIG.primary['@id'],
      //   orderItemCriteriaList,
      // },
    });
  }
}

module.exports = {
  FetchOpportunitiesFlowStage,
};
