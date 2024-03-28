/**
 * @param {Pick<import('../state').State, 'opportunityItemRowCache'>} state
 */
function getOrphanJson(state) {
  const rows = Array.from(state.opportunityItemRowCache.store.values()).filter((x) => x.jsonLdParentId !== null);
  return {
    children: {
      matched: rows.filter((x) => !x.waitingForParentToBeIngested).length,
      orphaned: rows.filter((x) => x.waitingForParentToBeIngested).length,
      total: rows.length,
      orphanedList: rows.filter((x) => x.waitingForParentToBeIngested).slice(0, 1000).map((({ jsonLdType, id, modified, jsonLd, jsonLdId, jsonLdParentId }) => ({
        jsonLdType,
        id,
        modified,
        jsonLd,
        jsonLdId,
        jsonLdParentId,
      }))),
    },
  };
}

module.exports = {
  getOrphanJson,
};
