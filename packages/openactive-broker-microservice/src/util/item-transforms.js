const { omit, isNil, isEmpty } = require('lodash');

/**
 * Inverts any FacilityUse items that have an `individualFacilityUse` property, so that the top-level `kind` is "IndividualFacilityUse"
 * @typedef {{'@id'?: string, id?: string}} IndividualFacilityUse
 * @param {{state: string, modified:any, kind: string, id: string, data: {id: string, individualFacilityUse?: IndividualFacilityUse[] }}} item
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
 * @param {{modified: any, data: Record<string, any>}} item
 */
function createItemFromSubEvent(subEvent, item) {
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
  createItemFromSubEvent,
  jsonLdHasReferencedParent,
  getMergedJsonLdContext,
};
