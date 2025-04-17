const { createUpdatedOpportunityItemRow, createRpdeItemFromSubEvent } = require('../../src/util/item-transforms');
const { PersistentStore } = require('../../src/util/persistent-store');

describe('test/util/persistent-store-test', () => {
  const store = new PersistentStore();

  beforeEach(async () => {
    await store.init();
  });

  afterEach(async () => {
    await store.clearCaches(false);
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
  it('should support caching opportunities by the criteria they do or do not satisfy', async () => {
    await store.storeOpportunityItemRow({
      ...getParentOpportunityItemRowDefaults('parent1'),
      jsonLdType: 'FacilityUse',
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'FacilityUse',
      },
    }, 'FacilityUse---parent1');
    await store.storeOpportunityItemRow({
      ...getChildOpportunityItemRowDefaults('child1'),
      jsonLdParentId: '//parent1',
      jsonLdType: 'Slot',
      waitingForParentToBeIngested: false,
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'Slot',
      },
    }, 'Slot---child1');
    await store.storeOpportunityItemRow({
      ...getChildOpportunityItemRowDefaults('child2'),
      jsonLdParentId: '//parent1',
      jsonLdType: 'Slot',
      waitingForParentToBeIngested: false,
      jsonLd: {
        '@context': ['https://openactive.io/'],
        '@type': 'Slot',
      },
    }, 'Slot---child2');

    await store.setOpportunityMatchesCriteria2('//child1', {
      criteriaName: 'TestOpportunityBookableFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'IndividualFacilityUseSlot',
      sellerId: 'https://example.com/seller1',
    });
    await store.setOpportunityMatchesCriteria2('//child1', {
      criteriaName: 'TestOpportunityBookableFree',
      bookingFlow: 'OpenBookingApprovalFlow',
      opportunityType: 'IndividualFacilityUseSlot',
      sellerId: 'https://example.com/seller1',
    });
    await store.setOpportunityMatchesCriteria2('//child1', {
      criteriaName: 'TestOpportunityBookableNonFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'ScheduledSession',
      sellerId: 'https://example.com/seller2',
    });
    await store.setOpportunityMatchesCriteria2('//child2', {
      criteriaName: 'TestOpportunityBookableFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'IndividualFacilityUseSlot',
      sellerId: 'https://example.com/seller1',
    });
    // Override an earlier match with a new failure
    await store.setOpportunityDoesNotMatchCriteria2('//child1', ['reason1', 'reason2'], {
      criteriaName: 'TestOpportunityBookableNonFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'ScheduledSession',
      sellerId: 'https://example.com/seller2',
    });
    await store.setOpportunityDoesNotMatchCriteria2('//child2', ['reason2'], {
      criteriaName: 'TestOpportunityBookableNonFree',
      bookingFlow: 'OpenBookingSimpleFlow',
      opportunityType: 'ScheduledSession',
      sellerId: 'https://example.com/seller2',
    });
    await store.setOpportunityDoesNotMatchCriteria2('//child2', ['reason3'], {
      criteriaName: 'TestOpportunityBookableFree',
      bookingFlow: 'OpenBookingApprovalFlow',
      opportunityType: 'IndividualFacilityUseSlot',
      sellerId: 'https://example.com/seller1',
    });

    // getCriteriaMatches
    {
      const freeSimpleSlotSeller1Matches = await store.getCriteriaMatches('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot', 'https://example.com/seller1');
      const freeSimpleSlotSeller2Matches = await store.getCriteriaMatches('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot', 'https://example.com/seller2');
      const freeSimpleSesSeller1Matches = await store.getCriteriaMatches('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'ScheduledSession', 'https://example.com/seller1');
      const freeSimpleSesSeller2Matches = await store.getCriteriaMatches('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'ScheduledSession', 'https://example.com/seller2');

      expect(freeSimpleSlotSeller1Matches).toEqual(['//child1', '//child2']);
      expect(freeSimpleSlotSeller2Matches).toEqual([]);
      expect(freeSimpleSesSeller1Matches).toEqual([]);
      expect(freeSimpleSesSeller2Matches).toEqual([]);
    }

    // hasCriteriaAnyMatches
    {
      const hasFreeApprovSlotAnyMatches = await store.hasCriteriaAnyMatches('TestOpportunityBookableFree', 'OpenBookingApprovalFlow', 'IndividualFacilityUseSlot');
      const hasPaidApprovSlotAnyMatches = await store.hasCriteriaAnyMatches('TestOpportunityBookableNonFree', 'OpenBookingApprovalFlow', 'IndividualFacilityUseSlot');

      expect(hasFreeApprovSlotAnyMatches).toEqual(true);
      expect(hasPaidApprovSlotAnyMatches).toEqual(false);
    }

    // getCriteriaAllSellerMatchAmounts
    {
      const freeSimpleSlot = await store.getCriteriaAllSellerMatchAmounts('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot');
      const freeSimpleSes = await store.getCriteriaAllSellerMatchAmounts('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'ScheduledSession');
      const freeApprovSlot = await store.getCriteriaAllSellerMatchAmounts('TestOpportunityBookableFree', 'OpenBookingApprovalFlow', 'IndividualFacilityUseSlot');
      const freeApprovSes = await store.getCriteriaAllSellerMatchAmounts('TestOpportunityBookableFree', 'OpenBookingApprovalFlow', 'ScheduledSession');
      const nonFreeSimpleSlot = await store.getCriteriaAllSellerMatchAmounts('TestOpportunityBookableNonFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot');
      const nonFreeSimpleSes = await store.getCriteriaAllSellerMatchAmounts('TestOpportunityBookableNonFree', 'OpenBookingSimpleFlow', 'ScheduledSession');

      expect(freeSimpleSlot).toEqual({
        'https://example.com/seller1': 2,
      });
      expect(freeSimpleSes).toEqual({});
      expect(freeApprovSlot).toEqual({
        'https://example.com/seller1': 1,
      });
      expect(freeApprovSes).toEqual({});
      expect(nonFreeSimpleSlot).toEqual({});
      expect(nonFreeSimpleSes).toEqual({});
    }

    // getCriteriaErrors
    {
      const freeSimpleSlot = await store.getCriteriaErrors('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot');
      const freeSimpleSes = await store.getCriteriaErrors('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'ScheduledSession');
      const freeApprovSlot = await store.getCriteriaErrors('TestOpportunityBookableFree', 'OpenBookingApprovalFlow', 'IndividualFacilityUseSlot');
      const freeApprovSes = await store.getCriteriaErrors('TestOpportunityBookableFree', 'OpenBookingApprovalFlow', 'ScheduledSession');
      const nonFreeSimpleSlot = await store.getCriteriaErrors('TestOpportunityBookableNonFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot');
      const nonFreeSimpleSes = await store.getCriteriaErrors('TestOpportunityBookableNonFree', 'OpenBookingSimpleFlow', 'ScheduledSession');

      expect(freeSimpleSlot).toEqual({});
      expect(freeSimpleSes).toEqual({});
      expect(freeApprovSlot).toEqual({
        reason3: 1,
      });
      expect(freeApprovSes).toEqual({});
      expect(nonFreeSimpleSlot).toEqual({});
      expect(nonFreeSimpleSes).toEqual({
        reason1: 1,
        reason2: 2,
      });
    }

    // Delete one of the opps
    await store.deleteChildOpportunityItemRow('Slot---child1');
    {
      const freeSimpleSlotMatches = await store.getCriteriaMatches('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot', 'https://example.com/seller1');
      const paidSimpleSesMatches = await store.getCriteriaMatches('TestOpportunityBookableNonFree', 'OpenBookingSimpleFlow', 'ScheduledSession', 'https://example.com/seller1');
      const freeSimpleSlotErrors = await store.getCriteriaErrors('TestOpportunityBookableFree', 'OpenBookingSimpleFlow', 'IndividualFacilityUseSlot');
      const paidSimpleSesErrors = await store.getCriteriaErrors('TestOpportunityBookableNonFree', 'OpenBookingSimpleFlow', 'ScheduledSession');

      expect(freeSimpleSlotMatches).toEqual(['//child2']);
      expect(paidSimpleSesMatches).toEqual([]);
      expect(freeSimpleSlotErrors).toEqual({});
      // This count is the same as before because this count does not track
      // individual items. It just increments with each matching RPDE update.
      expect(paidSimpleSesErrors).toEqual({
        reason1: 1,
        reason2: 2,
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
