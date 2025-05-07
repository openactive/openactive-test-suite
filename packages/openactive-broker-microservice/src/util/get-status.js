/**
 * @typedef {Object} OrphanStats
 * @property {number} childOrphans
 * @property {number} totalChildren
 * @property {string} percentageChildOrphans
 * @property {number} totalOpportunities
 */

const { mapToObjectSummary } = require('./map-to-object-summary');

/**
 * @param {Pick<import('../broker-config').BrokerConfig, 'DO_NOT_FILL_BUCKETS'>} config
 * @param {Pick<
 *   import('../state').State,
 *    | 'persistentStore'
 *    | 'startTime'
 *    | 'pauseResume'
 *    | 'feedContextMap'
 *    | 'orderUuidTracking'
 * >} state
 */
async function getStatus(config, state) {
  const { childOrphans, totalChildren, percentageChildOrphans, totalOpportunities } = await getOrphanStats(state);
  return {
    elapsedTime: millisToMinutesAndSeconds((new Date()).getTime() - state.startTime.getTime()),
    harvestingStatus: state.pauseResume.pauseHarvestingStatus,
    feeds: mapToObjectSummary(state.feedContextMap),
    orphans: {
      children: `${childOrphans} of ${totalChildren} (${percentageChildOrphans}%)`,
    },
    totalOpportunitiesHarvested: totalOpportunities,
    buckets: config.DO_NOT_FILL_BUCKETS ? null : (await state.persistentStore.getCriteriaOrientedOpportunityIdCacheSummary()),
    orderUuidTracking: {
      uuidsInOrderMap: mapToObjectSummary(state.orderUuidTracking.uuidsInOrderMap),
      hasReachedEndOfFeedMap: mapToObjectSummary(state.orderUuidTracking.hasReachedEndOfFeedMap),
      isPresentListeners: mapToObjectSummary(state.orderUuidTracking.isPresentListeners),
    },
  };
}

/**
 * @param {Pick<import('../state').State, 'persistentStore'>} state
 * @returns {Promise<OrphanStats>}
 */
async function getOrphanStats(state) {
  const { numChildOrphans, totalNumChildren, totalNumOpportunities } = await state.persistentStore.getOrphanStats();
  const percentageChildOrphans = totalNumChildren > 0 ? ((numChildOrphans / totalNumChildren) * 100).toFixed(2) : '0';
  return {
    childOrphans: numChildOrphans,
    totalChildren: totalNumChildren,
    percentageChildOrphans,
    totalOpportunities: totalNumOpportunities,
  };
}

/**
 * @param {number} millis
 */
function millisToMinutesAndSeconds(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds.toFixed(0)}`;
}

module.exports = {
  getOrphanStats,
  getStatus,
  millisToMinutesAndSeconds,
};
