const { partition, omit } = require('lodash');

/**
 * Inverts any items that have an `individualFacilityUse` property, so that the top-level `kind` is "IndividualFacilityUse"
 *
 * @param {{state: string, modified:any, kind: string, id: string, data: {id: string, individualFacilityUse?: Record<string, any>[], subEvent?:Record<string, any>[] }}[]} items
 */
function invertFacilityUseItems(items) {
  const [invertibleFacilityUseItems, otherItems] = partition(items, (item) => (item.data?.individualFacilityUse || []).length > 0);
  if (invertibleFacilityUseItems.length < 1) return items;

  // Invert "FacilityUse" items so the the top-level `kind` is "IndividualFacilityUse"
  const invertedItems = [];
  for (const facilityUseItem of invertibleFacilityUseItems) {
    for (const individualFacilityUse of facilityUseItem.data.individualFacilityUse) {
      invertedItems.push({
        ...facilityUseItem,
        kind: individualFacilityUse['@type'],
        id: individualFacilityUse['@id'],
        data: {
          ...individualFacilityUse,
          '@context': facilityUseItem.data['@context'],
          aggregateFacilityUse: omit(facilityUseItem.data, ['individualFacilityUse', '@context']),
        },
      });
    }
  }

  // @ts-ignore TS is unhappy with concatting two different types of items
  return invertedItems.concat(otherItems);
}

/**
 * Creates an opportunity item from a subEvent. This is used when a SessionSeries feed has ScheduledSessions,
 * and using this function splits the subEvents into items to simulate a ScheduledSessions feed.
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
  invertFacilityUseItems,
  createItemFromSubEvent,
  jsonLdHasReferencedParent,
  getMergedJsonLdContext,
};
