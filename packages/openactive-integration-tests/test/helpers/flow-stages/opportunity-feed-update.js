const { getRelevantOffers } = require('@openactive/test-interface-criteria');
const chakram = require('chakram');
const sharedValidationTests = require('../../shared-behaviours/validation');
const { isResponse20x } = require('../chakram-response-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */

const { HARVEST_START_TIME } = global;

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
 * @param {unknown} opportunity
 * @param {string} opportunityCriteria
 */
function getRandomRelevantOffer(opportunity, opportunityCriteria) {
  const relevantOffers = getRelevantOffers(opportunityCriteria, opportunity, { harvestStartTime: HARVEST_START_TIME });
  if (relevantOffers.length === 0) { return null; }

  return relevantOffers[Math.floor(Math.random() * relevantOffers.length)];
}

/**
 * Wait for an opportunity to appear in the Booking System's Opportunity Feed.
 */
const OpportunityFeedUpdateFlowStage = {
  /**
   * @param {object} args
   * @param {ChakramResponse[]} args.testInterfaceOpportunities
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {RequestHelperType} args.requestHelper
   * @returns {Promise<import('./flow-stage').FlowStageOutput<{
   *   opportunityFeedExtractResponses: ChakramResponse[],
   *   orderItems: OrderItem[]
   * }>>}
   */
  async run({ testInterfaceOpportunities, orderItemCriteriaList, requestHelper }) {
    /**
     * Note that the reponses are stored wrapped in promises. This is because
     * opportunities are created/fetched concurrently.
     * If the responses were awaited before storing them in this cache, then
     * the same request may be made over and over.
     *
     * @type {Map<string, Promise<ChakramResponse>>}
     */
    const reusableMatchPromises = new Map();

    /**
     * Full opportunity data for each opportunity fetched by fetchOpportunities() - one for each criteria.
     *
     * Each is an RPDE item.
     */
    const opportunityFeedExtractResponses = await Promise.all(testInterfaceOpportunities.map(async (testInterfaceOpportunity, i) => {
      // Only attempt getMatch if test interface response was successful
      if (isResponse20x(testInterfaceOpportunity) && testInterfaceOpportunity.body['@id']) {
        const opportunityId = testInterfaceOpportunity.body['@id'];
        // If a match for this @id is already being requested, just reuse the same response
        if (reusableMatchPromises.has(opportunityId)) {
          return await reusableMatchPromises.get(opportunityId);
        }

        const matchPromise = requestHelper.getMatch(opportunityId, i);
        reusableMatchPromises.set(opportunityId, matchPromise);
        return await matchPromise;
      }
      return null;
    }));

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

    return {
      result: {
        status: 'response-received',
        response: {
          opportunityFeedExtractResponses,
          orderItems,
        },
      },
      state: {
        opportunityFeedExtractResponses,
        orderItems,
      },
    };
  },

  /**
   * @param {object} args
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {() => {
   *   opportunityFeedExtractResponses: ChakramResponse[],
   * }} args.getterFn Function which gets the state needed for this function.
   *
   *   opportunityFeedExtractResponses is supposed to have length equal to the
   *   length of orderItemCriteriaList.
   */
  itSuccessChecks({ orderItemCriteriaList, getterFn }) {
    // There will be an opportunity
    orderItemCriteriaList.forEach((x, i) => {
      it(`should return 200 on success for request relevant to OrderItem ${i}`, () => {
        const opportunityFeedExtractResponse = getterFn().opportunityFeedExtractResponses[i];
        if (!opportunityFeedExtractResponse) throw Error('Pre-requisite step failed: test interface request failed');

        chakram.expect(opportunityFeedExtractResponse).to.have.status(200);
      });
    });
  },

  /**
   * @param {object} args
   * @param {BaseLoggerType} args.logger
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {() => {
   *   opportunityFeedExtractResponses: ChakramResponse[],
   * }} args.getterFn Function which gets the state needed for this function.
   *
   *   opportunityFeedExtractResponses is supposed to have length equal to the
   *   length of orderItemCriteriaList.
   */
  itValidationTests({ logger, orderItemCriteriaList, getterFn }) {
    orderItemCriteriaList.forEach((orderItemCriteriaItem, i) => {
      sharedValidationTests.shouldBeValidResponse(
        () => getterFn().opportunityFeedExtractResponses[i],
        `Opportunity Feed extract for OrderItem ${i}`,
        logger,
        {
          validationMode: 'BookableRPDEFeed',
        },
        orderItemCriteriaItem.opportunityCriteria,
      );
    });
  },
};

module.exports = {
  OpportunityFeedUpdateFlowStage,
};
