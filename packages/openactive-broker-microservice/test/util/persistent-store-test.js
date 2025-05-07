const { createUpdatedOpportunityItemRow, createRpdeItemFromSubEvent } = require('../../src/util/item-transforms');
const { PersistentStore } = require('../../src/util/persistent-store');

describe('test/util/persistent-store-test', () => {
  const store = new PersistentStore();

  afterEach(async () => {
    await store.clearCaches();
  });

  it('should store/retrieve child and parent opportunities, and support marking them as related', async () => {
    // First, children without a parent
    await store.storeOpportunityItemRow({
      ...getChildOpportunityItemRowDefaults('child1'),
      jsonLdParentId: '//parent1',
      jsonLdType: 'Slot',
      waitingForParentToBeIngested: true,
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'Slot',
        startDate: '2021-01-01T00:00:00Z',
      },
    }, 'Slot---child1');
    await store.storeOpportunityItemRow({
      ...getChildOpportunityItemRowDefaults('child2'),
      jsonLdParentId: '//parent2',
      jsonLdType: 'Slot',
      waitingForParentToBeIngested: true,
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'Slot',
        startDate: '2021-01-01T00:00:00Z',
      },
    }, 'Slot---child2');
    await store.storeOpportunityItemRow({
      ...getChildOpportunityItemRowDefaults('child3'),
      jsonLdParentId: '//parent1',
      jsonLdType: 'Slot',
      waitingForParentToBeIngested: true,
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'Slot',
        startDate: '2021-01-02T00:00:00Z',
      },
    }, 'Slot---child3');

    // Now a parent to child1
    await store.storeOpportunityItemRow({
      ...getParentOpportunityItemRowDefaults('parent1'),
      jsonLdType: 'FacilityUse',
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'FacilityUse',
        name: 'Parent1',
      },
    }, 'FacilityUse---parent1');

    // Get parent1's child IDs
    {
      const parent1ChildIds = await store.getOpportunityNonSubEventChildIdsFromParent('//parent1');
      expect([...parent1ChildIds].join(',')).toEqual('//child1,//child3');
    }

    // Mark as found
    await store.markOpportunityItemRowChildAsFoundParent('//child1', '123');
    await store.markOpportunityItemRowChildAsFoundParent('//child3', '123');

    // Check that marked children are no longer waiting for parent
    {
      const child1Now = await store.getOpportunityItemRow('//child1');
      const child2Now = await store.getOpportunityItemRow('//child2');
      const child3Now = await store.getOpportunityItemRow('//child3');
      expect(child1Now.waitingForParentToBeIngested).toEqual(false);
      expect(child2Now.waitingForParentToBeIngested).toEqual(true);
      expect(child3Now.waitingForParentToBeIngested).toEqual(false);
    }

    // Delete some child opps and check that the parent-relations are updated
    await store.deleteChildOpportunityItemRow('Slot---child1');
    await store.deleteChildOpportunityItemRow('Slot---child2');
    {
      const parent1ChildIdsNow = await store.getOpportunityNonSubEventChildIdsFromParent('//parent1');
      expect([...parent1ChildIdsNow].join(',')).toEqual('//child3');
      const child1Now = await store.getOpportunityItemRow('//child1');
      const child2Now = await store.getOpportunityItemRow('//child2');
      const child3Now = await store.getOpportunityItemRow('//child3');
      expect(child1Now).toBeUndefined();
      expect(child2Now).toBeUndefined();
      expect(child3Now).not.toBeUndefined();
    }

    // Delete the parent and check that the child remains (I'm not totally sure
    // why this is the intended behaviour. Perhaps it may be possible for a
    // parent to become un-deleted or for a child to switch to a different
    // parent?)
    await store.deleteParentOpportunityItemRow('FacilityUse---parent1');
    {
      const parent1ChildIdsNow = await store.getOpportunityNonSubEventChildIdsFromParent('//parent1');
      expect([...parent1ChildIdsNow].join(',')).toEqual('//child3');
      const parent1Now = await store.getOpportunityItemRow('//parent1');
      const child3Now = await store.getOpportunityItemRow('//child3');
      expect(parent1Now).toBeUndefined();
      expect(child3Now).not.toBeUndefined();
    }
  });

  it('should support managing .subEvent-derived child opportunities', async () => {
    /**
     * @param {import('../../src/models/core').RpdeItem} parentRpdeItem
     * @param {string} feedItemIdentifier
     * @param {string} jsonLdId
     */
    const storeSessionSeriesAndSubEvents = async (parentRpdeItem, feedItemIdentifier, jsonLdId) => {
      const parentRow = createUpdatedOpportunityItemRow(parentRpdeItem, false);
      // Store a parent with .subEvent
      await store.storeOpportunityItemRow(parentRow, feedItemIdentifier);
      // Add subEvents separately
      for (const subEvent of parentRpdeItem.data.subEvent) {
        const childRpdeItem = createRpdeItemFromSubEvent(subEvent, /** @type {any} */(parentRpdeItem));
        const childRow = createUpdatedOpportunityItemRow(childRpdeItem, true, false);
        await store.storeOpportunityItemRow(childRow, undefined);
      }
      await store.reconcileParentSubEventChanges(parentRpdeItem.data.subEvent, jsonLdId);
    };
    /** @type {import('../../src/models/core').RpdeItem} */
    const parent1RpdeItem = {
      state: 'updated',
      kind: 'SessionSeries',
      id: 'parent1',
      modified: '123',
      data: {
        '@context': ['https://openactive.io/'],
        '@id': '//parent1',
        '@type': 'SessionSeries',
        name: 'Parent1',
        subEvent: [
          {
            '@type': 'ScheduledSession',
            '@id': '//child1',
            startDate: '2021-01-01T00:00:00Z',
          },
          {
            '@type': 'ScheduledSession',
            '@id': '//child2',
            startDate: '2021-01-02T00:00:00Z',
          },
        ],
      },
    };
    await storeSessionSeriesAndSubEvents(parent1RpdeItem, 'SessionSeries---parent1', '//parent1');

    // Check that all are present
    {
      const parent1 = await store.getOpportunityItemRow('//parent1');
      const child1 = await store.getOpportunityItemRow('//child1');
      const child2 = await store.getOpportunityItemRow('//child2');
      expect(parent1).not.toBeUndefined();
      expect(child1).not.toBeUndefined();
      expect(child2).not.toBeUndefined();
    }

    // Update the parent, implicitly removing child2 and adding child3
    const parent1RpdeItem2 = {
      ...parent1RpdeItem,
      data: {
        ...parent1RpdeItem.data,
        subEvent: [
          parent1RpdeItem.data.subEvent[0],
          {
            '@type': 'ScheduledSession',
            '@id': '//child3',
            startDate: '2021-01-03T00:00:00Z',
          },
        ],
      },
    };
    await storeSessionSeriesAndSubEvents(parent1RpdeItem2, 'SessionSeries---parent1', '//parent1');

    // Checks
    {
      const parent1 = await store.getOpportunityItemRow('//parent1');
      const child1 = await store.getOpportunityItemRow('//child1');
      const child2 = await store.getOpportunityItemRow('//child2');
      const child3 = await store.getOpportunityItemRow('//child3');
      expect(parent1).not.toBeUndefined();
      expect(child1).not.toBeUndefined();
      expect(child2).toBeUndefined();
      expect(child3).not.toBeUndefined();
    }

    // Delete parent
    await store.deleteParentOpportunityItemRow('SessionSeries---parent1');

    // Parent and children should all be deleted
    {
      const parent1 = await store.getOpportunityItemRow('//parent1');
      const child1 = await store.getOpportunityItemRow('//child1');
      const child2 = await store.getOpportunityItemRow('//child2');
      const child3 = await store.getOpportunityItemRow('//child3');
      expect(parent1).toBeUndefined();
      expect(child1).toBeUndefined();
      expect(child2).toBeUndefined();
      expect(child3).toBeUndefined();
    }
  });
});

/**
 * @param {string} id
 */
function getChildOpportunityItemRowDefaults(id) {
  /** @satisfies {Partial<import('../../src/models/core').OpportunityItemRow>} */
  const defaults = {
    id,
    // JSON-LD ID is made different to ensure that RPDE ID and data ID are
    // handled separately.
    jsonLdId: `//${id}`,
    deleted: false,
    feedModified: '123',
    modified: '123',
    isParent: false,
    /** @type {string | null} */
    jsonLdParentId: null,
    waitingForParentToBeIngested: false,
  };
  return defaults;
}

/**
 * @param {string} id
 */
function getParentOpportunityItemRowDefaults(id) {
  /** @satisfies {Partial<import('../../src/models/core').OpportunityItemRow>} */
  const defaults = {
    id,
    // JSON-LD ID is made different to ensure that RPDE ID and data ID are
    // handled separately.
    jsonLdId: `//${id}`,
    deleted: false,
    feedModified: '123',
    modified: '123',
    isParent: true,
    /** @type {string | null} */
    jsonLdParentId: null,
    waitingForParentToBeIngested: false,
  };
  return defaults;
}
