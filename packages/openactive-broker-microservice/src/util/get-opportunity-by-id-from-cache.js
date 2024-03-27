const { jsonLdHasReferencedParent, getMergedJsonLdContext } = require('./jsonld-utils');

/**
 * For a given `childOpportunityId`, fetch the full opportunity from the cache.
 * If the opportunity has a parent, the full opportunity for the parent will be
 * fetched and merged into the `superEvent` or `facilityUse` property.
 *
 * @param {Pick<import('../state').State, 'opportunityCache'>} state
 * @param {string} childOpportunityId
 */
function getOpportunityMergedWithParentById(state, childOpportunityId) {
  const opportunity = state.opportunityCache.childMap.get(childOpportunityId);
  if (!opportunity) {
    return null;
  }
  if (!jsonLdHasReferencedParent(opportunity)) {
    return opportunity;
  }
  const superEvent = state.opportunityCache.parentMap.get(/** @type {string} */(opportunity.superEvent));
  const facilityUse = state.opportunityCache.parentMap.get(/** @type {string} */(opportunity.facilityUse));
  if (superEvent || facilityUse) {
    const mergedContexts = getMergedJsonLdContext(opportunity, superEvent, facilityUse);
    delete opportunity['@context'];
    const returnObj = {
      '@context': mergedContexts,
      ...opportunity,
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
