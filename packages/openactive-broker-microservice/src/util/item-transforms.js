const { FatalError } = require('@openactive/openactive-openid-client');
const { omit, isNil, isEmpty } = require('lodash');

/**
 * Inverts any FacilityUse items that have an `individualFacilityUse` property, so that the top-level `kind` is "IndividualFacilityUse"
 *
 * @typedef {{
 *   '@id'?: string;
 *   id?: string;
 *   '@type'?: string;
 * }} IndividualFacilityUse
 * @param {{
 *   state: string;
 *   modified:string;
 *   kind: string;
 *   id: string;
 *   data: {
 *     '@context'?: string | string[];
 *     individualFacilityUse?: IndividualFacilityUse[];
 *   }}} item
 */
function invertFacilityUseItem(item) {
  if (!isNil(item.data?.individualFacilityUse) && !isEmpty(item.data.individualFacilityUse)) {
    return item.data.individualFacilityUse.map((individualFacilityUse) => ({
      ...item,
      kind: individualFacilityUse['@type'],
      id: individualFacilityUse['@id'] || individualFacilityUse.id,
      data: {
        ...individualFacilityUse,
        '@context': item.data['@context'],
        aggregateFacilityUse: omit(item.data, ['individualFacilityUse', '@context']),
      },
    }));
  }
  return [item];
}

/**
 * Creates an opportunity item from a subEvent. This is used when a SessionSeries feed has embedded ScheduledSessions,
 * and using this function splits the subEvent into items to simulate a separate ScheduledSessions feed.
 *
 * @param {Record<string, any>} subEvent
 * @param {{modified: string, data: Record<string, any>}} item
 */
function createRpdeItemFromSubEvent(subEvent, item) {
  const opportunityItemData = {
    ...subEvent,
  };
  opportunityItemData['@context'] = item.data['@context'];
  opportunityItemData.superEvent = item.data['@id'] || item.data.id;

  const opportunityItem = {
    id: subEvent['@id'] || subEvent.id,
    modified: item.modified,
    kind: subEvent['@type'] || subEvent.type,
    state: 'updated',
    data: opportunityItemData,
  };

  return opportunityItem;
}

/**
 * @param {import('../models/core').RpdeItem} rpdeItem
 * @param {boolean} isChildOpportunity
 * @param {boolean} [waitingForParentToBeIngested]
 *   Required if `isChildOpportunity` is true.
 *   If `isChildOpportunity` is false, then this will be ignored and set to false.
 */
function createUpdatedOpportunityItemRow(rpdeItem, isChildOpportunity, waitingForParentToBeIngested) {
  const hasParent = isChildOpportunity && jsonLdHasReferencedParent(rpdeItem.data);
  /** @type {import('../models/core').OpportunityItemRow} */
  const row = {
    id: rpdeItem.id,
    modified: rpdeItem.modified,
    deleted: false,
    feedModified: `${Date.now() + 1000}`, // 1 second in the future,
    jsonLdId: rpdeItem.data['@id'] || rpdeItem.data.id || null,
    jsonLd: rpdeItem.data,
    jsonLdType: rpdeItem.data['@type'] || rpdeItem.data.type,
    isParent: !isChildOpportunity,
    jsonLdParentId: hasParent
      ? rpdeItem.data.superEvent || rpdeItem.data.facilityUse
      : null,
    waitingForParentToBeIngested: isChildOpportunity
      ? waitingForParentToBeIngested
      : false,
  };
  if (row.jsonLdId == null) {
    throw new FatalError(`RPDE item '${rpdeItem.id}' of kind '${rpdeItem.kind}' does not have an @id. All items in the feeds must have an @id within the "data" property.`);
  }
  return row;
}

/**
 * @param {{superEvent?: any, facilityUse?: any}} data
 */
function jsonLdHasReferencedParent(data) {
  return typeof data?.superEvent === 'string' || typeof data?.facilityUse === 'string';
}

/**
 * Sorts the JSON-LD context array, with https://openactive.io/ and https://schema.org/ at the top.
 *
 * @param {string[]} arr
 */
function sortWithOpenActiveOnTop(arr) {
  const firstList = [];
  if (arr.includes('https://openactive.io/')) firstList.push('https://openactive.io/');
  if (arr.includes('https://schema.org/')) firstList.push('https://schema.org/');
  const remainingList = arr.filter((x) => x !== 'https://openactive.io/' && x !== 'https://schema.org/');
  return firstList.concat(remainingList.sort());
}

/**
 * Merges and sorts contexts
 *
 * @param  {Record<string, any>[]} opportunities
 */
function getMergedJsonLdContext(...opportunities) {
  return sortWithOpenActiveOnTop([...new Set(opportunities.flatMap((x) => x && x['@context']).filter((x) => x))]);
}

module.exports = {
  invertFacilityUseItem,
  createRpdeItemFromSubEvent,
  jsonLdHasReferencedParent,
  getMergedJsonLdContext,
  createUpdatedOpportunityItemRow,
};
