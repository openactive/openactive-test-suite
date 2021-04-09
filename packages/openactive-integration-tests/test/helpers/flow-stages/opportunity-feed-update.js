/**
 * This actually contains 2 Flow Stages - a Listener and a Collector.
 *
 * The Test Suite is not constantly checking for Opportunity Feed updates. It only
 * starts checking when instructed. Therefore, if, say, an opportunity is updated and
 * then the Test Suite is instructed to check for the associated Opportunity Feed update,
 * it is possible that the Booking System's opportunity feed (if it was really quick!)
 * processes the update and releases an update to their feed before the Test
 * Suite starts checking. Therefore, the Test Suite would miss the update and the
 * request would timeout.
 *
 * So, the fix is to have, when expecting Opportunity Feed updates, the following stages
 * in sequence:
 *
 * 1. Opportunity Feed Update Listener
 * 2. {A FlowStage which instructs the Booking System to update its Opportunity Feed e.g.
 *   Change of Logistics}
 * 3. Opportunity Feed Update Collector
 *
 * A `wrap` function has also been provided, to reduce the boilerplate of setting
 * up a listener and collector each time.
 */
const chakram = require('chakram');
const _ = require('lodash');
const { o } = require('ramda');
const sharedValidationTests = require('../../shared-behaviours/validation');
const { isResponse20x } = require('../chakram-response-utils');
const { FlowStage } = require('./flow-stage');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 */

/**
 * @typedef {Required<Pick<FlowStageOutput, 'testInterfaceOpportunities'>>} ListenerInput
 * @typedef {Required<Pick<FlowStageOutput, 'testInterfaceOpportunities'>>} ListenerOutput
 *
 * @typedef {ListenerOutput} CollectorInput
 * @typedef {Required<Pick<FlowStageOutput, 'opportunityFeedExtractResponses'>>} CollectorOutput
 */

/**
 * @typedef {'wait-for-one' | 'wait-for-all'} WaitMode
 */

/**
 * @param {object} args
 * @param {ChakramResponse[]} args.testInterfaceOpportunities
 * @param {RequestHelperType} args.requestHelper
 * @param {boolean} [args.useCacheIfAvailable]
 */
async function fetchOpportunityFeedExtractResponses({ testInterfaceOpportunities, requestHelper, useCacheIfAvailable }) {
  // TODO Note that waitMode is not yet used in this function. It should be. But, since
  // waitMode=wait-for-one only supports one opportunity, wait-for-one & wait-for-all
  // are exactly equivalent until waitMode=wait-for-one can support multiple opportunities.
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

      const matchPromise = requestHelper.getMatch(opportunityId, i, useCacheIfAvailable);
      reusableMatchPromises.set(opportunityId, matchPromise);
      return await matchPromise;
    }
    return null;
  }));
  return opportunityFeedExtractResponses;
}

/**
 * @param {object} args
 * @param {ChakramResponse[]} args.testInterfaceOpportunities 
 * @param {RequestHelperType} args.requestHelper
 */
async function runOpportunityFeedUpdateCollector({testInterfaceOpportunities, requestHelper}) {
  const opportunityFeedExtractResponses = await Promise.all(testInterfaceOpportunities.map(async (testInterfaceOpportunity, i) => {
    // Only attempt getMatch if test interface response was successful
    if (isResponse20x(testInterfaceOpportunity) && testInterfaceOpportunity.body['@id']) {
      return await requestHelper.getFeedChangeCollection(testInterfaceOpportunity.body['@id'], i);
    }
  }))

  return {opportunityFeedExtractResponses};
}


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
function itSuccessChecksOpportunityFeedUpdateCollector({ orderItemCriteriaList, getterFn }) {
  orderItemCriteriaList.forEach((x, i) => {
    it(`should return 200 on success for request relevant to OrderItem ${i}`, () => {
      const opportunityFeedExtractResponse = getterFn().opportunityFeedExtractResponses[i];
      if (!opportunityFeedExtractResponse) throw Error('Pre-requisite step failed: test interface request failed');

      chakram.expect(opportunityFeedExtractResponse).to.have.status(200);
    });
  });
}

/**
 * @param {object} args
 * @param {ChakramResponse[]} args.testInterfaceOpportunities 
 * @param {RequestHelperType} args.requestHelper
 * @returns {Promise<{areFeedChangeListenerSetup:boolean}>}
 */
async function setupListenersForOpportunities({testInterfaceOpportunities, requestHelper}) {
  for (const [i, testInterfaceOpportunity] of testInterfaceOpportunities.entries()) {
    // Only attempt getMatch if test interface response was successful
    if (isResponse20x(testInterfaceOpportunity) && testInterfaceOpportunity.body['@id']) {
      await requestHelper.postFeedChangeListener(testInterfaceOpportunity.body['@id'], i);
    }
  }

  return { areFeedChangeListenerSetup: true };
}

/**
 * FlowStage which initiates the checking for updates to the Opportunity Feed.
 *
 * Note that this is to check for an opportunity feed update in response to a previous
 * test action. e.g. use this FlowStage to ensure that a Change of Logistics action
 * causes an update to the Opportunity Feed.
 *
 * This is not to get opportunities from the feed at the beginning of a test - for that,
 * use the FetchOpportunitiesFlowStage.
 *
 * @extends {FlowStage<ListenerInput, ListenerOutput>}
 */
class OpportunityFeedUpdateListenerFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {FlowStage<unknown, unknown>} [args.prerequisite]
   * @param {() => ListenerInput} args.getInput
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {WaitMode} args.waitMode Are we checking that all
   *   opportunities get updated in the Opportunity Feed or are we checking that just
   *   one does.
   *
   *   WARN: wait-for-one is currently not supported for multiple OrderItem tests.
   *   In order to support this, we'd have to implement (https://github.com/openactive/openactive-test-suite/issues/312),
   *   so that opportunity feed checking can be cancelled for other opportunities
   *   when one of the opportunities is found (and JS Promises are not cancellable
   *   without specific measures).
   *
   *   e.g. if having just invoked a Change of Logistics (TestInterface action),
   *   we only need to check that one of the opportunities in an Order has been changed
   *   in the feed, as this is enough to require the Broker to inform the Customer
   *   that a change has been made. Therefore, for this use case, we use
   *   `waitMode='wait-for-one'`.
   *
   *   If waitMode = wait-for-one, the opportunityFeedExtractResponses (outputted
   *   by the collector stage) will have exactly one item - the item that was updated.
   * @param {RequestHelperType} args.requestHelper
   */
  constructor({ prerequisite, getInput, orderItemCriteriaList, waitMode, requestHelper }) {
    if (waitMode === 'wait-for-one' && orderItemCriteriaList.length > 1) {
      throw new Error('OpportunityFeedUpdateListenerFlowStage: waitMode = wait-for-one is currently not supported for multiple OrderItem tests');
    }
    super({
      prerequisite,
      getInput,
      testName: '_Opportunity Feed Update Listener',
      shouldDescribeFlowStage: false,
      async runFn(input) {
        const { testInterfaceOpportunities } = input;
        await setupListenersForOpportunities({testInterfaceOpportunities, requestHelper});
        return { testInterfaceOpportunities };
        // // Note that we don't await this. The Collector resolves this Promise.
        // const getOpportunitiesFromOpportunityFeedPromise = fetchOpportunityFeedExtractResponses({
        //   testInterfaceOpportunities,
        //   requestHelper,
        //   // because we're waiting for an update to appear at the end of the feed, we don't use the cache.
        //   useCacheIfAvailable: false,
        // });
        // return {
        //   getOpportunitiesFromOpportunityFeedPromise,
        // };
      },
      itSuccessChecksFn() { /* there are no success checks - these happen at the OpportunityFeedUpdateCollectorFlowStage */ },
      itValidationTestsFn() { /* there are no validation tests - validation happens at the OpportunityFeedUpdateCollectorFlowStage */ },
    });
  }
}

/**
 * FlowStage which collects the results from an initiated Opportunity Feed Update.
 *
 * This stage must come after (but not necessarily directly after) a Opportunity Feed Update
 * Listener stage (@see OpportunityFeedUpdateListener).
 *
 * @extends {FlowStage<CollectorInput, CollectorOutput>}
 */
class OpportunityFeedUpdateCollectorFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {string} args.testName
   * @param {FlowStage<unknown>} args.prerequisite
   * @param {() => CollectorInput} args.getInput
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList
   * @param {WaitMode} args.waitMode
   * @param {BaseLoggerType} args.logger
   * @param {RequestHelperType} args.requestHelper
   */
  constructor({ testName, prerequisite, getInput, orderItemCriteriaList, waitMode, logger, requestHelper }) {
    super({
      prerequisite,
      getInput,
      testName,
      async runFn(input) {
        const { testInterfaceOpportunities } = input;
        return await runOpportunityFeedUpdateCollector({testInterfaceOpportunities, requestHelper});
      },
      itSuccessChecksFn: (flowStage) => {
        itSuccessChecksOpportunityFeedUpdateCollector({
          orderItemCriteriaList,
          getterFn: () => flowStage.getOutput(),
        });
      },
      itValidationTestsFn(flowStage) {
        if (waitMode === 'wait-for-one') {
          sharedValidationTests.shouldBeValidResponse(
            () => flowStage.getOutput().opportunityFeedExtractResponses[0],
            'Opportunity Feed Extract for the 1st updated OrderItem',
            logger,
            { validationMode: 'BookableRPDEFeed' },
          );
        } else {
          orderItemCriteriaList.forEach((orderItemCriteriaItem, i) => {
            sharedValidationTests.shouldBeValidResponse(
              () => flowStage.getOutput().opportunityFeedExtractResponses[i],
              `Opportunity Feed extract for OrderItem bl;aj ${i}`,
              logger,
              { validationMode: 'BookableRPDEFeed' },
            );
          });
        }
      },
    });
  }
}

const OpportunityFeedUpdateFlowStageUtils = {
  /**
   * Helper function to reduce the boilerplate of checking for Opportunity Feed updates
   * in a flow. As mentioned in the doc at the top of this module, you need a listener
   * and collector flow stages.
   *
   * This function simplifies this for the most common use case:
   *
   * 1. Listen for changes to Opportunity Feed
   * 2. Do some action that will cause the Booking System to put something into the Opportunity feed
   * 3. Collect that item from the Opportunity feed
   *
   * To avoid doubt, when using this function, the following flow is created:
   *
   * 1. `opportunityFeedUpdateParams.prerequisite` (if supplied)
   * 2. An internal OpportunityFeedUpdateListenerFlowStage
   * 3. `wrappedStageFn(prerequisite)` (**as long as the wrapped stage
   *   sets, as its prerequisite, the argument supplied to it by function call**)
   * 4. `opportunityFeedUpdateCollector`
   * 5. Whatever FlowStage is set up to take `opportunityFeedUpdateCollector` as its prerequisite
   *
   * @template {import('./flow-stage').FlowStageType<any, any>} TWrappedFlowStage
   * @param {object} args
   * @param {(prerequisite: OpportunityFeedUpdateListenerFlowStage) => TWrappedFlowStage} args.wrappedStageFn
   *   Returns a Stage that will cause the Booking System to put something into the
   *   Order Feed.
   *   This stage must have its prerequisite set as the OpportunityFeedUpdateListenerFlowStage which
   *   is supplied to it in this function.
   * @param {object} args.opportunityFeedUpdateParams Params which will be fed into the
   *   OrderFeed update flow stages.
   * @param {FlowStage<unknown, unknown>} [args.opportunityFeedUpdateParams.prerequisite]
   *   Prerequisite for the OpportunityFeedUpdateListenerFlowStage.
   * @param {string} args.opportunityFeedUpdateParams.testName Name for the OpportunityFeedUpdateCollectorFlowStage
   *   flow stage. A flow can have multiple OpportunityFeedUpdateCollectors, so its helpful
   *   to give them individual names, to make the test logs clearer.
   * @param {() => ListenerInput} args.opportunityFeedUpdateParams.getInput getInput for the listener
   * @param {OpportunityCriteria[]} args.opportunityFeedUpdateParams.orderItemCriteriaList
   * @param {WaitMode} args.opportunityFeedUpdateParams.waitMode `waitMode` for the listener. See the
   *   OpportunityFeedUpdateListenerFlowStage's docs for more info.
   * @param {RequestHelperType} args.opportunityFeedUpdateParams.requestHelper
   * @param {BaseLoggerType} args.opportunityFeedUpdateParams.logger
   * @param {string} args.opportunityFeedUpdateParams.uuid
   * @returns {[TWrappedFlowStage, OpportunityFeedUpdateCollectorFlowStage]}
   *   TODO update return signature to `{[wrappedStage: TWrappedFlowStage, opportunityFeedUpdateCollector: OpportunityFeedUpdateCollectorFlowStage]}`
   *   when project upgrades TypeScript to v4
   */
  wrap({ wrappedStageFn, opportunityFeedUpdateParams }) {
    const listenForOpportunityFeedUpdate = new OpportunityFeedUpdateListenerFlowStage({
      prerequisite: opportunityFeedUpdateParams.prerequisite,
      getInput: opportunityFeedUpdateParams.getInput,
      orderItemCriteriaList: opportunityFeedUpdateParams.orderItemCriteriaList,
      waitMode: opportunityFeedUpdateParams.waitMode,
      requestHelper: opportunityFeedUpdateParams.requestHelper,
    });
    const wrappedStage = wrappedStageFn(listenForOpportunityFeedUpdate);
    const collectOpportunityFeedUpdate = new OpportunityFeedUpdateCollectorFlowStage({
      testName: opportunityFeedUpdateParams.testName,
      prerequisite: wrappedStage,
      getInput: () => ({
        testInterfaceOpportunities: listenForOpportunityFeedUpdate.getOutput().testInterfaceOpportunities,
      }),
      orderItemCriteriaList: opportunityFeedUpdateParams.orderItemCriteriaList,
      waitMode: opportunityFeedUpdateParams.waitMode,
      logger: opportunityFeedUpdateParams.logger,
      requestHelper: opportunityFeedUpdateParams.requestHelper,
    });
    return [wrappedStage, collectOpportunityFeedUpdate];
  },
};

module.exports = {
  OpportunityFeedUpdateListenerFlowStage,
  OpportunityFeedUpdateCollectorFlowStage,
  OpportunityFeedUpdateFlowStageUtils,
  fetchOpportunityFeedExtractResponses,
  itSuccessChecksOpportunityFeedUpdateCollector,
};
