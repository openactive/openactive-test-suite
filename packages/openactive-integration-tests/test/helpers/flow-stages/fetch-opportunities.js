const { getRelevantOffers } = require('@openactive/test-interface-criteria');
const _ = require('lodash');
const config = require('config');
const sharedValidationTests = require('../../shared-behaviours/validation');
const { isResponse20x } = require('../chakram-response-utils');
const { FlowStage } = require('./flow-stage');
const { fetchOpportunityFeedExtractResponses, itSuccessChecksOpportunityFeedUpdateCollector } = require('./opportunity-feed-update');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 */

/**
 * @typedef {{
 *   position: number;
 *   orderedItem: {
 *     '@type': string,
 *     '@id': string,
 *     [k: string]: any,
 *   };
 *   acceptedOffer: {
 *     '@id': string,
 *     [k: string]: any,
 *   };
 *   'test:primary': boolean;
 *   'test:control': boolean;
 * }} OrderItem
 */

/**
 * @typedef {{}} Input
 * @typedef {Required<Pick<FlowStageOutput, 'testInterfaceOpportunities' | 'opportunityFeedExtractResponses' | 'orderItems'>>} Output
 */

const USE_RANDOM_OPPORTUNITIES = config.get('useRandomOpportunities');
const { HARVEST_START_TIME } = global;

/**
 * @param {unknown} opportunity
 * @param {string} opportunityCriteria
 */
function getRandomRelevantOffer(opportunity, opportunityCriteria) {
  const relevantOffers = getRelevantOffers(opportunityCriteria, opportunity, { harvestStartTime: HARVEST_START_TIME });
  if (relevantOffers.length === 0) { return null; }

  return relevantOffers[Math.floor(Math.random() * relevantOffers.length)];
}

/**
 * For each of the Opportunity Criteria, get or create (using https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities)
 * an opportunity that matches the criteria from the [test interface](https://openactive.io/test-interface/).
 *
 * The responses only contain minimal info like ID, so `runOpportunityFeedUpdate()`
 * needs to be called afterwards to actually get the full data of each opportunity.
 *
 * @param {object} args
 * @param {OpportunityCriteria[]} args.orderItemCriteriaList
 * @param {SellerConfig} args.sellerConfig
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<ChakramResponse[]>}
 */
async function getOrCreateTestInterfaceOpportunities({ orderItemCriteriaList, sellerConfig, requestHelper }) {
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

    const opportunityResponsePromise = USE_RANDOM_OPPORTUNITIES
      ? requestHelper.getRandomOpportunity(
        orderItemCriteriaItem.opportunityType,
        orderItemCriteriaItem.opportunityCriteria,
        i,
        sellerConfig['@id'],
        sellerConfig['@type'],
      ) : requestHelper.createOpportunity(
        orderItemCriteriaItem.opportunityType,
        orderItemCriteriaItem.opportunityCriteria,
        i,
        sellerConfig['@id'],
        sellerConfig['@type'],
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
 * @param {SellerConfig} args.sellerConfig
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<Output>}
  */
async function runFetchOpportunities({ orderItemCriteriaList, sellerConfig, requestHelper }) {
  // ## Get Test Interface Opportunities
  const testInterfaceOpportunities = await getOrCreateTestInterfaceOpportunities({
    orderItemCriteriaList, sellerConfig, requestHelper,
  });

  // ## Get full Opportunity data for each
  //
  // Now that we have references to some opportunities that have been found or
  // created and match our criteria, let's get the full opportunities
  const opportunityFeedExtractResponses = await fetchOpportunityFeedExtractResponses({
    testInterfaceOpportunities,
    requestHelper,
    useCacheIfAvailable: true,
  });

  // ## Create OrderItem for each Opportunity
  const orderItems = opportunityFeedExtractResponses.map((opportunityFeedExtractResponse, i) => {
    if (opportunityFeedExtractResponse && isResponse20x(opportunityFeedExtractResponse)) {
      const acceptedOffer = getRandomRelevantOffer(opportunityFeedExtractResponse.body.data, orderItemCriteriaList[i].opportunityCriteria);
      if (acceptedOffer === null) {
        throw new Error(`Opportunity for OrderItem ${i} did not have a relevant offer for the specified testOpportunityCriteria: ${orderItemCriteriaList[i].opportunityCriteria}`);
      }
      return {
        position: i,
        orderedItem: opportunityFeedExtractResponse.body.data,
        acceptedOffer,
        'test:primary': orderItemCriteriaList[i].primary,
        'test:control': orderItemCriteriaList[i].control,
      };
    }
    return null;
  });

  // ## Combine responses
  return {
    testInterfaceOpportunities,
    opportunityFeedExtractResponses,
    orderItems,
  };
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
   * @param {SellerConfig} args.sellerConfig
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   */
  constructor({ orderItemCriteriaList, sellerConfig, requestHelper, logger }) {
    super({
      testName: 'Fetch Opportunities',
      getInput: FlowStageUtils.emptyGetInput,
      runFn: async () => await runFetchOpportunities({
        orderItemCriteriaList, requestHelper, sellerConfig,
      }),
      itSuccessChecksFn(flowStage) {
        itSuccessChecksOpportunityFeedUpdateCollector({
          orderItemCriteriaList,
          getterFn: () => flowStage.getOutput(),
        });
      },
      itValidationTestsFn(flowStage) {
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
}

/**
 * @typedef {InstanceType<typeof FetchOpportunitiesFlowStage>} FetchOpportunitiesFlowStageType
 */

module.exports = {
  FetchOpportunitiesFlowStage,
  runFetchOpportunities,
};
