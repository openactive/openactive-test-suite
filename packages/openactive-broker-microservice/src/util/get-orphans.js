/**
 * @param {Pick<import('../state').State, 'persistentStore'>} state
 */
function getOrphanJson(state) {
  const {
    numMatched: matched,
    numOrphaned: orphaned,
    total,
    orphanedList,
  } = state.persistentStore.getOrphanData();
  return {
    children: {
      matched,
      orphaned,
      total,
      orphanedList,
    },
  };
}

module.exports = {
  getOrphanJson,
};
