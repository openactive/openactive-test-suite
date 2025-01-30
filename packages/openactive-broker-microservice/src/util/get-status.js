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
 *   'opportunityItemRowCache'
  *    | 'startTime'
  *    | 'pauseResume'
  *    | 'feedContextMap'
  *    | 'criteriaOrientedOpportunityIdCache'
  *    | 'orderUuidTracking'
  * >} state
 */
function getStatus(config, state) {
  const { childOrphans, totalChildren, percentageChildOrphans, totalOpportunities } = getOrphanStats(state);
  return {
    elapsedTime: millisToMinutesAndSeconds((new Date()).getTime() - state.startTime.getTime()),
    harvestingStatus: state.pauseResume.pauseHarvestingStatus,
    feeds: mapToObjectSummary(state.feedContextMap),
    orphans: {
      children: `${childOrphans} of ${totalChildren} (${percentageChildOrphans}%)`,
    },
    totalOpportunitiesHarvested: totalOpportunities,
    buckets: config.DO_NOT_FILL_BUCKETS ? null : mapToObjectSummary(state.criteriaOrientedOpportunityIdCache),
    orderUuidTracking: {
      uuidsInOrderMap: mapToObjectSummary(state.orderUuidTracking.uuidsInOrderMap),
      hasReachedEndOfFeedMap: mapToObjectSummary(state.orderUuidTracking.hasReachedEndOfFeedMap),
      isPresentListeners: mapToObjectSummary(state.orderUuidTracking.isPresentListeners),
    },
  };
}

/**
 * @param {Pick<import('../state').State, 'opportunityItemRowCache'>} state
 * @returns {OrphanStats}
 */
function getOrphanStats(state) {
  const childRows = Array.from(state.opportunityItemRowCache.store.values()).filter((x) => x.jsonLdParentId !== null);
  const childOrphans = childRows.filter((x) => x.waitingForParentToBeIngested).length;
  const totalChildren = childRows.length;
  const totalOpportunities = Array.from(state.opportunityItemRowCache.store.values()).filter((x) => !x.waitingForParentToBeIngested).length;
  const percentageChildOrphans = totalChildren > 0 ? ((childOrphans / totalChildren) * 100).toFixed(2) : '0';
  return {
    childOrphans,
    totalChildren,
    percentageChildOrphans,
    totalOpportunities,
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
