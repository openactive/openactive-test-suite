const { jsonLdHasReferencedParent, getMergedJsonLdContext } = require('./jsonld-utils');

/**
 * For a given `childOpportunityId`, fetch the full opportunity from the cache.
 * If the opportunity has a parent, the full opportunity for the parent will be
 * fetched and merged into the `superEvent` or `facilityUse` property.
 *
 * @param {Pick<import('../state').State, 'persistentStore'>} state
 * @param {string} childOpportunityId
 */
async function getOpportunityMergedWithParentById(state, childOpportunityId) {
  const opportunityItemRow = await state.persistentStore.getOpportunityItemRow(childOpportunityId);
  if (!opportunityItemRow) {
    return null;
  }
  const opportunity = opportunityItemRow.jsonLd;
  if (!jsonLdHasReferencedParent(opportunity)) {
    return opportunity;
  }
  const superEvent = opportunity.superEvent && (await state.persistentStore.getOpportunityItemRow(/** @type {string} */(opportunity.superEvent)))?.jsonLd;
  const facilityUse = opportunity.facilityUse && (await state.persistentStore.getOpportunityItemRow(/** @type {string} */(opportunity.facilityUse)))?.jsonLd;
  if (superEvent || facilityUse) {
    const mergedContexts = getMergedJsonLdContext(opportunity, superEvent, facilityUse);
    const returnObj = {
      ...opportunity,
      '@context': mergedContexts,
    };
    if (superEvent) {
      const superEventWithoutContext = {
        ...superEvent,
      };
      delete superEventWithoutContext['@context'];
      return {
        ...returnObj,
        superEvent: superEventWithoutContext,
      };
    }
    if (facilityUse) {
      const facilityUseWithoutContext = {
        ...facilityUse,
      };
      delete facilityUseWithoutContext['@context'];
      return {
        ...returnObj,
        facilityUse: facilityUseWithoutContext,
      };
    }
  }
  return null;
}

module.exports = {
  getOpportunityMergedWithParentById,
};
