const { getRelevantOffers } = require('@openactive/test-interface-criteria');
const { isResponse20x } = require('../chakram-response-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */

/**
 * @typedef {{
 *   position: number;
 *   orderedItem: {[k: string]: any};
 *   acceptedOffer: {[k: string]: any};
 *   'test:primary': boolean;
 *   'test:control': boolean;
 * }} OrderItem
 */

/**
 * @param {unknown} opportunity
 * @param {string} opportunityCriteria
 */
function getRandomRelevantOffer(opportunity, opportunityCriteria) {
  const relevantOffers = getRelevantOffers(opportunityCriteria, opportunity);
  if (relevantOffers.length === 0) { return null; }

  return relevantOffers[Math.floor(Math.random() * relevantOffers.length)];
}

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
async function runOpportunityFeedUpdate({ testInterfaceOpportunities, orderItemCriteriaList, requestHelper }) {
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
}

module.exports = {
  runOpportunityFeedUpdate,
};
