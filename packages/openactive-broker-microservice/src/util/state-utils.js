/**
 * @param {Pick<import('../state').State, 'lockedOpportunityIdsByTestDataset'>} state
 */
function getAllLockedOpportunityIds(state) {
  return new Set(
    Array.from(state.lockedOpportunityIdsByTestDataset.values()).flatMap((x) => (
      Array.from(x.values())
    )),
  );
}

/**
 * All Opportunity IDs that are considered "locked" (because they have already
 * been used in a test) for the specified [Test Dataset](https://openactive.io/test-interface/#datasets-endpoints).
 *
 * @param {Pick<import('../state').State, 'lockedOpportunityIdsByTestDataset'>} state
 * @param {string} testDatasetIdentifier
 * @returns {Set<string>}
 */
function getLockedOpportunityIdsInTestDataset(state, testDatasetIdentifier) {
  if (!state.lockedOpportunityIdsByTestDataset.has(testDatasetIdentifier)) {
    state.lockedOpportunityIdsByTestDataset.set(testDatasetIdentifier, new Set());
  }
  return state.lockedOpportunityIdsByTestDataset.get(testDatasetIdentifier);
}

module.exports = {
  getAllLockedOpportunityIds,
  getLockedOpportunityIdsInTestDataset,
};
