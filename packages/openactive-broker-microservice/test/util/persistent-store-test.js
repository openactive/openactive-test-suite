const { createUpdatedOpportunityItemRow, createRpdeItemFromSubEvent } = require('../../src/util/item-transforms');
const { PersistentStore } = require('../../src/util/persistent-store');

describe.only('test/util/persistent-store-test', () => {
  const store = new PersistentStore();

  beforeEach(async () => {
    await store.init();
  });

  afterEach(async () => {
    await store.clearCaches();
  });

  afterAll(async () => {
    await store.stop();
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
  it.only('should support caching opportunities by the criteria they do or do not satisfy', async () => {
    await store.storeOpportunityItemRow({
      ...getChildOpportunityItemRowDefaults('opp1'),
      jsonLdParentId: '//parent1',
      jsonLdType: 'Slot',
      waitingForParentToBeIngested: false,
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'Slot',
      },
    }, 'Slot---opp1');
    await store.storeOpportunityItemRow({
      ...getChildOpportunityItemRowDefaults('opp2'),
      jsonLdParentId: '//parent1',
      jsonLdType: 'Slot',
      waitingForParentToBeIngested: false,
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'Slot',
      },
    }, 'Slot---opp2');

    await store.setCriteriaOrientedOpportunityIdCacheOpportunityMatchesCriteria('//opp1', {
      criteriaName: 'TestOpportunityBookableFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'IndividualFacilityUseSlot',
      sellerId: 'https://example.com/seller1',
    });
    await store.setCriteriaOrientedOpportunityIdCacheOpportunityMatchesCriteria('//opp1', {
      criteriaName: 'TestOpportunityBookableFree',
      bookingFlow: 'OpenBookingApprovalFlow',
      opportunityType: 'IndividualFacilityUseSlot',
      sellerId: 'https://example.com/seller1',
    });
    await store.setCriteriaOrientedOpportunityIdCacheOpportunityMatchesCriteria('//opp1', {
      criteriaName: 'TestOpportunityBookableNonFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'ScheduledSession',
      sellerId: 'https://example.com/seller2',
    });
    await store.setCriteriaOrientedOpportunityIdCacheOpportunityMatchesCriteria('//opp2', {
      criteriaName: 'TestOpportunityBookableFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'IndividualFacilityUseSlot',
      sellerId: 'https://example.com/seller1',
    });
    // Override an earlier match with a new failure
    await store.setOpportunityDoesNotMatchCriteria('//opp1', ['reason1', 'reason2'], {
      criteriaName: 'TestOpportunityBookableNonFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'ScheduledSession',
      sellerId: 'https://example.com/seller2',
    });
    await store.setOpportunityDoesNotMatchCriteria('//opp2', ['reason2'], {
      criteriaName: 'TestOpportunityBookableNonFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'ScheduledSession',
      sellerId: 'https://example.com/seller2',
    });
    await store.setOpportunityDoesNotMatchCriteria('//opp2', ['reason3'], {
      criteriaName: 'TestOpportunityBookableFree',
      bookingFlow: 'OpenBookingApprovalFlow',
      opportunityType: 'IndividualFacilityUseSlot',
      sellerId: 'https://example.com/seller1',
    });

    // Check each "bucket"
    {
      const freeSimpleSlot = await store.getCriteriaOrientedOpportunityIdCacheTypeBucket('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot');
      const freeSimpleSes = await store.getCriteriaOrientedOpportunityIdCacheTypeBucket('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'ScheduledSession');
      const freeApprovSlot = await store.getCriteriaOrientedOpportunityIdCacheTypeBucket('TestOpportunityBookableFree', 'OpenBookingApprovalFlow', 'IndividualFacilityUseSlot');
      const freeApprovSes = await store.getCriteriaOrientedOpportunityIdCacheTypeBucket('TestOpportunityBookableFree', 'OpenBookingApprovalFlow', 'ScheduledSession');
      const nonFreeSimpleSlot = await store.getCriteriaOrientedOpportunityIdCacheTypeBucket('TestOpportunityBookableNonFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot');
      const nonFreeSimpleSes = await store.getCriteriaOrientedOpportunityIdCacheTypeBucket('TestOpportunityBookableNonFree', 'OpenBookingSimpleFlow', 'ScheduledSession');

      expect(freeSimpleSlot).toEqual({
        contents: new Map([
          ['https://example.com/seller1', new Set(['//opp1', '//opp2'])],
        ]),
        // undefined because there is at least one match
        criteriaErrors: undefined,
      });
      expect(freeSimpleSes).toEqual({
        contents: new Map(),
        criteriaErrors: new Map(),
        // criteriaErrors: new Map([
        //   ['reason1', 1],
        //   ['reason2', 2],
        // ]),
      });
      expect(freeApprovSlot).toEqual({
        contents: new Map([
          ['https://example.com/seller1', new Set(['//opp1'])],
        ]),
        // Even though there was a failure, there is at least one match, so this is undefined
        criteriaErrors: undefined,
      });
      expect(freeApprovSes).toEqual({
        contents: new Map(),
        criteriaErrors: new Map(),
      });
      expect(nonFreeSimpleSlot).toEqual({
        contents: new Map(),
        criteriaErrors: new Map(),
      });
      expect(nonFreeSimpleSes).toEqual({
        contents: new Map(),
        criteriaErrors: new Map([
          ['reason1', 1],
          ['reason2', 2],
        ]),
      });
    }

    // Delete one of the opps
    await store.deleteChildOpportunityItemRow('Slot---opp1');
    {
      const freeSimpleSlot = await store.getCriteriaOrientedOpportunityIdCacheTypeBucket('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot');
      const freeSimpleSes = await store.getCriteriaOrientedOpportunityIdCacheTypeBucket('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'ScheduledSession');

      expect(freeSimpleSlot).toEqual({
        contents: new Map([
          ['https://example.com/seller1', new Set(['//opp2'])],
        ]),
        criteriaErrors: undefined,
      });
      expect(freeSimpleSes).toEqual({
        contents: new Map(),
        criteriaErrors: new Map([
          ['reason2', 1],
        ]),
      });
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
