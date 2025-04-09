/**
 * @param {Pick<import('../state').State, 'persistentStore'>} state
 */
async function getOrphanJson(state) {
  const {
    numMatched: matched,
    numOrphaned: orphaned,
    total,
    orphanedList,
  } = await state.persistentStore.getOrphanData();
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
