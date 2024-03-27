const { expect } = require('chai');
const { getStatus } = require('../src/util/get-status');
const { CriteriaOrientedOpportunityIdCache } = require('../src/util/criteria-oriented-opportunity-id-cache');
const PauseResume = require('../src/util/pause-resume');
const { getOrphanJson } = require('../src/util/get-orphans');
const { getOpportunityMergedWithParentById } = require('../src/util/get-opportunity-by-id-from-cache');

// /**
//  * @template {Map<TKey, TValue>} TMap
//  * @template TKey
//  * @template TValue
//  * @typedef {[key: TKey, value: TValue]} MapEntry
//  */

const testDataGenerators = {
  opportunityItemRowCacheStoreItems: {
    /**
     * @param {string} id
     * @param {string} parentId
     * @returns {[string, import('../src/models/core').OpportunityItemRow]}
     */
    hasAParent: (id, parentId) => [
      id, {
        id,
        jsonLdId: id,
        jsonLdParentId: parentId,
        jsonLdType: 'ScheduledSession',
        jsonLd: {
          '@type': 'ScheduledSession',
        },
        feedModified: Date.now(),
        deleted: false,
        modified: 123,
        waitingForParentToBeIngested: false,
      },
    ],
    /**
     * @param {string} id
     * @returns {[string, import('../src/models/core').OpportunityItemRow]}
     */
    hasNoParentButDoesntNeedOne: (id) => [
      id, {
        id,
        jsonLdId: id,
        jsonLdParentId: null,
        jsonLdType: 'ScheduledSession',
        jsonLd: {
          '@type': 'ScheduledSession',
        },
        feedModified: Date.now(),
        deleted: false,
        modified: 123,
        waitingForParentToBeIngested: false,
      },
    ],
    /**
     * @param {string} id
     * @param {string} parentId
     * @returns {[string, import('../src/models/core').OpportunityItemRow]}
     */
    hasNoParentAndShouldHaveOne: (id, parentId) => [
      id, {
        id,
        jsonLdId: id,
        jsonLdParentId: parentId,
        jsonLdType: 'ScheduledSession',
        jsonLd: {
          '@type': 'ScheduledSession',
        },
        feedModified: Date.now(),
        deleted: false,
        modified: 123,
        waitingForParentToBeIngested: true,
      },
    ],
  },
};

describe('user-facing endpoints', () => {
  describe('GET /status', () => {
    it('should work', () => {
      const cooiCache = CriteriaOrientedOpportunityIdCache.create();
      CriteriaOrientedOpportunityIdCache.setOpportunityMatchesCriteria(cooiCache, 'id1', {
        criteriaName: 'TestOpportunityBookable',
        bookingFlow: 'OpenBookingSimpleFlow',
        opportunityType: 'ScheduledSession',
        sellerId: 'seller1',
      });
      CriteriaOrientedOpportunityIdCache.setOpportunityMatchesCriteria(cooiCache, 'id1', {
        criteriaName: 'TestOpportunityBookableFree',
        bookingFlow: 'OpenBookingSimpleFlow',
        opportunityType: 'ScheduledSession',
        sellerId: 'seller1',
      });
      CriteriaOrientedOpportunityIdCache.setOpportunityDoesNotMatchCriteria(cooiCache, 'id1', ['does not have one space'], {
        criteriaName: 'TestOpportunityBookableOneSpace',
        bookingFlow: 'OpenBookingSimpleFlow',
        opportunityType: 'ScheduledSession',
        sellerId: 'seller1',
      });
      CriteriaOrientedOpportunityIdCache.setOpportunityMatchesCriteria(cooiCache, 'id2', {
        criteriaName: 'TestOpportunityBookable',
        bookingFlow: 'OpenBookingSimpleFlow',
        opportunityType: 'ScheduledSession',
        sellerId: 'seller1',
      });
      CriteriaOrientedOpportunityIdCache.setOpportunityDoesNotMatchCriteria(cooiCache, 'id2', ['is not free'], {
        criteriaName: 'TestOpportunityBookableFree',
        bookingFlow: 'OpenBookingSimpleFlow',
        opportunityType: 'ScheduledSession',
        sellerId: 'seller1',
      });
      CriteriaOrientedOpportunityIdCache.setOpportunityDoesNotMatchCriteria(cooiCache, 'id1', ['does not have one space'], {
        criteriaName: 'TestOpportunityBookableOneSpace',
        bookingFlow: 'OpenBookingSimpleFlow',
        opportunityType: 'ScheduledSession',
        sellerId: 'seller1',
      });
      const result = getStatus({
        DO_NOT_FILL_BUCKETS: false,
      }, {
        startTime: new Date(),
        opportunityItemRowCache: {
          store: new Map([
            // Has a parent
            testDataGenerators.opportunityItemRowCacheStoreItems.hasAParent('id1', 'parentid1'),
            // Has no parent but doesn't need one either
            testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentButDoesntNeedOne('id2'),
            // Has no parent and should have one
            testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentAndShouldHaveOne('id3', 'parentid3'),
          ]),
          parentIdIndex: new Map(),
        },
        criteriaOrientedOpportunityIdCache: cooiCache,
        feedContextMap: new Map(),
        pauseResume: new PauseResume(),
      });
      // Only two of the three opportunities are "child opportunities" i.e. have
      // a parent
      expect(result.orphans.children).to.equal('1 of 2 (50.00%)');
      // Only two of the three opportunities count as being harvested — those
      // that are not still waiting for parent
      expect(result.totalOpportunitiesHarvested).to.equal(2);
      expect(/** @type {any} */(result.buckets).TestOpportunityBookable.OpenBookingSimpleFlow.ScheduledSession).to.deep.equal({
        seller1: 2,
      });
      expect(/** @type {any} */(result.buckets).TestOpportunityBookableFree.OpenBookingSimpleFlow.ScheduledSession).to.deep.equal({
        seller1: 1,
      });
      expect(/** @type {any} */(result.buckets).TestOpportunityBookableOneSpace.OpenBookingSimpleFlow.ScheduledSession).to.deep.equal({
        criteriaErrors: {
          'does not have one space': 2,
        },
      });
    });
  });
  describe('GET /orphans', () => {
    it('should work', () => {
      const result = getOrphanJson({
        opportunityItemRowCache: {
          store: new Map([
            testDataGenerators.opportunityItemRowCacheStoreItems.hasAParent('id1', 'parentid1'),
            testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentButDoesntNeedOne('id2'),
            testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentAndShouldHaveOne('id3', 'parentid3'),
          ]),
          parentIdIndex: new Map(),
        },
      });
      expect(result).to.deep.equal({
        children: {
          // id1
          matched: 1,
          // id3
          orphaned: 1,
          // id2 is discounted because it doesn't need a parent
          total: 2,
          orphanedList: [{
            id: 'id3',
            jsonLdId: 'id3',
            jsonLdParentId: 'parentid3',
            jsonLdType: 'ScheduledSession',
            jsonLd: {
              '@type': 'ScheduledSession',
            },
            modified: 123,
          }],
        },
      });
    });
  });
  describe('GET /opportunity-cache/:id', () => {
    it('should work', () => {
      /** @type {import('../src/state').State['opportunityCache']} */
      const opportunityCache = {
        parentMap: new Map([
          ['parentid1', {
            '@context': ['https://openactive.io/', 'https://openactive.io/ns-beta'],
            '@type': 'FacilityUse',
            name: 'Facility 1',
          }],
          ['parentid2', {
            '@context': ['https://openactive.io/', 'https://openactive.io/ns-beta'],
            '@type': 'SessionSeries',
            description: 'come have fun besties <3',
          }],
        ]),
        childMap: new Map([
          ['id1', {
            '@context': ['https://openactive.io/'],
            '@type': 'Slot',
            facilityUse: 'parentid1',
            startDate: '2001-01-01T00:00:00Z',
          }],
          ['id2', {
            '@context': ['https://openactive.io/'],
            '@type': 'ScheduledSession',
            superEvent: 'parentid2',
            name: 'ScheduledSession 1',
          }],
        ]),
      };
      const slotResult = getOpportunityMergedWithParentById({
        opportunityCache,
      }, 'id1');
      expect(slotResult).to.deep.equal({
        '@context': ['https://openactive.io/', 'https://openactive.io/ns-beta'],
        '@type': 'Slot',
        facilityUse: {
          '@type': 'FacilityUse',
          name: 'Facility 1',
        },
        startDate: '2001-01-01T00:00:00Z',
      });
      const scsResult = getOpportunityMergedWithParentById({
        opportunityCache,
      }, 'id2');
      expect(scsResult).to.deep.equal({
        '@context': ['https://openactive.io/', 'https://openactive.io/ns-beta'],
        '@type': 'ScheduledSession',
        superEvent: {
          '@type': 'SessionSeries',
          description: 'come have fun besties <3',
        },
        name: 'ScheduledSession 1',
      });
    });
  });
});
