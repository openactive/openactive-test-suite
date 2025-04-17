const { expect } = require('chai');
const sinon = require('sinon');
const { getStatus } = require('../src/util/get-status');
const { CriteriaOrientedOpportunityIdCache } = require('../src/util/criteria-oriented-opportunity-id-cache');
const PauseResume = require('../src/util/pause-resume');
const { getOrphanJson } = require('../src/util/get-orphans');
const { getOpportunityMergedWithParentById } = require('../src/util/get-opportunity-by-id-from-cache');
const { getSampleOpportunities } = require('../src/util/sample-opportunities');
const { OrderUuidTracking } = require('../src/order-uuid-tracking/order-uuid-tracking');
const { PersistentStore } = require('../src/util/persistent-store');

const testDataGenerators = {
  opportunityItemRowCacheStoreItems: {
    /**
     * @param {string} id
     * @returns {[string, import('../src/models/core').OpportunityItemRow]}
     */
    parent: (id) => [
      id, {
        id,
        jsonLdId: id,
        jsonLdParentId: null,
        jsonLdType: 'SessionSeries',
        jsonLd: {
          '@type': 'SessionSeries',
        },
        feedModified: String(Date.now()),
        deleted: false,
        modified: '123',
        waitingForParentToBeIngested: false,
        isParent: true,
      },
    ],
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
        feedModified: String(Date.now()),
        deleted: false,
        modified: '123',
        waitingForParentToBeIngested: false,
        isParent: false,
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
        feedModified: String(Date.now()),
        deleted: false,
        modified: '123',
        waitingForParentToBeIngested: false,
        isParent: false,
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
        feedModified: String(Date.now()),
        deleted: false,
        modified: '123',
        waitingForParentToBeIngested: true,
        isParent: false,
      },
    ],
  },
};

describe('user-facing endpoints', () => {
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

  describe('GET /status', () => {
    it('should include stats about orphans and criteria matches', async () => {
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
      // const [parentId, parentOpportunityItemRow] = testDataGenerators.opportunityItemRowCacheStoreItems.parent('parent1');
      // await store.storeOpportunityItemRow(parentOpportunityItemRow, 'SessionSeries---parent1');

      const createExpressResStub = () => ({
        json: sinon.stub(),
      });
      const res1ExpectTrue = createExpressResStub();
      const res2ExpectFalse = createExpressResStub();
      const res3ExpectTrue = createExpressResStub();
      const res4ExpectNoCall = createExpressResStub();

      const orderUuidTracking = OrderUuidTracking.createState();
      // We'll then check for this
      OrderUuidTracking.doTrackOrderUuidAndUpdateListeners(orderUuidTracking, 'orders', 'primary', 'uuid1');
      // We'll never check for this
      OrderUuidTracking.doTrackOrderUuidAndUpdateListeners(orderUuidTracking, 'orders', 'primary', 'uuid2');
      // should immediately return true
      OrderUuidTracking.checkIfOrderUuidIsPresentAndPotentiallyListenForIt(orderUuidTracking, {
        orderFeedType: 'orders',
        bookingPartnerIdentifier: 'primary',
        uuid: 'uuid1',
        // @ts-expect-error
        res: res1ExpectTrue,
      });
      // should return false at the end of the feed
      OrderUuidTracking.checkIfOrderUuidIsPresentAndPotentiallyListenForIt(orderUuidTracking, {
        orderFeedType: 'orders',
        bookingPartnerIdentifier: 'primary',
        uuid: 'uuid3',
        // @ts-expect-error
        res: res2ExpectFalse,
      });
      // should return true later
      OrderUuidTracking.checkIfOrderUuidIsPresentAndPotentiallyListenForIt(orderUuidTracking, {
        orderFeedType: 'orders',
        bookingPartnerIdentifier: 'primary',
        uuid: 'uuid4',
        // @ts-expect-error
        res: res3ExpectTrue,
      });
      // should remain as an as-yet-unresolved listener
      OrderUuidTracking.checkIfOrderUuidIsPresentAndPotentiallyListenForIt(orderUuidTracking, {
        orderFeedType: 'orders',
        bookingPartnerIdentifier: 'secondary',
        uuid: 'uuidB1',
        // @ts-expect-error
        res: res4ExpectNoCall,
      });
      OrderUuidTracking.doTrackOrderUuidAndUpdateListeners(orderUuidTracking, 'orders', 'primary', 'uuid4');
      OrderUuidTracking.doTrackEndOfFeed(orderUuidTracking, 'orders', 'primary');
      OrderUuidTracking.doTrackOrderUuidAndUpdateListeners(orderUuidTracking, 'orders', 'secondary', 'uuidB2');
      const persistentStore = new PersistentStore();
      persistentStore._opportunityItemRowCache = {
        store: new Map([
          // Has a parent
          testDataGenerators.opportunityItemRowCacheStoreItems.hasAParent('id1', 'parentid1'),
          // Has no parent but doesn't need one either
          testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentButDoesntNeedOne('id2'),
          // Has no parent and should have one
          testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentAndShouldHaveOne('id3', 'parentid3'),
        ]),
        parentIdIndex: new Map(),
      };
      persistentStore._criteriaOrientedOpportunityIdCache = cooiCache;

      const result = await getStatus({
        DO_NOT_FILL_BUCKETS: false,
      }, {
        startTime: new Date(),
        persistentStore,
        feedContextMap: new Map(),
        pauseResume: new PauseResume(),
        orderUuidTracking,
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
      expect(result.orderUuidTracking.uuidsInOrderMap).to.deep.equal({
        'OrdersFeed (auth:primary)': 3,
        'OrdersFeed (auth:secondary)': 1,
      });
      expect(result.orderUuidTracking.hasReachedEndOfFeedMap).to.deep.equal({
        'OrdersFeed (auth:primary)': true,
        'OrdersFeed (auth:secondary)': false,
      });
      expect(result.orderUuidTracking.isPresentListeners).to.have.property('orders::secondary::uuidB1');
      expect(res1ExpectTrue.json.args).to.deep.equal([[true]]);
      expect(res2ExpectFalse.json.args).to.deep.equal([[false]]);
      expect(res3ExpectTrue.json.args).to.deep.equal([[true]]);
      expect(res4ExpectNoCall.json.args).to.deep.equal([]);
    });
  });
  describe('GET /orphans', () => {
    it('should return stats about which opportunities are orphans i.e. have no parents', async () => {
      const [, parent1OpportunityItemRow] = testDataGenerators.opportunityItemRowCacheStoreItems.parent('parent1');
      const [, parent3OpportunityItemRow] = testDataGenerators.opportunityItemRowCacheStoreItems.parent('parent3');
      const [, child1OpportunityItemRow] = testDataGenerators.opportunityItemRowCacheStoreItems.hasAParent('id1', 'parentid1');
      const [, child2OpportunityItemRow] = testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentButDoesntNeedOne('id2');
      const [, child3OpportunityItemRow] = testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentAndShouldHaveOne('id3', 'parentid3');
      await store.storeOpportunityItemRow(parent1OpportunityItemRow, 'SessionSeries---parent1');
      await store.storeOpportunityItemRow(parent3OpportunityItemRow, 'SessionSeries---parent3');
      await store.storeOpportunityItemRow(child1OpportunityItemRow, 'ScheduledSession---id1');
      await store.storeOpportunityItemRow(child2OpportunityItemRow, 'ScheduledSession---id2');
      await store.storeOpportunityItemRow(child3OpportunityItemRow, 'ScheduledSession---id3');
      const result = await getOrphanJson({
        persistentStore: store,
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
            modified: '123',
          }],
        },
      });
    });
  });
  describe('GET /opportunity-cache/:id', () => {
    it('should get an opportunity from the cache, merged with its parent', async () => {
      await store.storeOpportunityItemRow({
        id: 'parentid1',
        modified: '123',
        deleted: false,
        feedModified: '123',
        jsonLdId: 'parentid1',
        jsonLd: {
          '@context': ['https://openactive.io/', 'https://openactive.io/ns-beta'],
          '@type': 'FacilityUse',
          name: 'Facility 1',
        },
        jsonLdType: 'FacilityUse',
        isParent: true,
        jsonLdParentId: null,
        waitingForParentToBeIngested: false,
      }, 'SessionSeries---parentid1');
      await store.storeOpportunityItemRow({
        id: 'parentid2',
        modified: '123',
        deleted: false,
        feedModified: '123',
        jsonLdId: 'parentid2',
        jsonLd: {
          '@context': ['https://openactive.io/', 'https://openactive.io/ns-beta'],
          '@type': 'SessionSeries',
          description: 'come have fun besties <3',
        },
        jsonLdType: 'SessionSeries',
        isParent: true,
        jsonLdParentId: null,
        waitingForParentToBeIngested: false,
      }, 'SessionSeries---parentid2');
      await store.storeOpportunityItemRow({
        id: 'id1',
        modified: '123',
        deleted: false,
        feedModified: '123',
        jsonLdId: 'id1',
        jsonLd: {
          '@context': ['https://openactive.io/'],
          '@type': 'Slot',
          facilityUse: 'parentid1',
          startDate: '2001-01-01T00:00:00Z',
        },
        jsonLdType: 'Slot',
        isParent: false,
        jsonLdParentId: 'parentid1',
        waitingForParentToBeIngested: false,
      }, 'ScheduledSession---id1');
      await store.storeOpportunityItemRow({
        id: 'id2',
        modified: '123',
        deleted: false,
        feedModified: '123',
        jsonLdId: 'id2',
        jsonLd: {
          '@context': ['https://openactive.io/'],
          '@type': 'ScheduledSession',
          superEvent: 'parentid2',
          name: 'ScheduledSession 1',
        },
        jsonLdType: 'ScheduledSession',
        isParent: false,
        jsonLdParentId: 'parentid2',
        waitingForParentToBeIngested: false,
      }, 'ScheduledSession---id2');

      const slotResult = await getOpportunityMergedWithParentById({
        persistentStore: store,
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
      const scsResult = await getOpportunityMergedWithParentById({
        persistentStore: store,
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
  describe('GET /sample-opportunities', () => {
    it('should get a random opportunity matching a criteria, and then lock it', async () => {
      /**
       * @param {any} result
       * @param {string[]} idAllowlist
       * @param {string[]} parentIdAllowlist
       * @param {string[]} offerIdAllowlist
       */
      const testResult = (result, idAllowlist, parentIdAllowlist, offerIdAllowlist) => {
        expect(result).to.have.property('sampleOpportunities').that.has.lengthOf(1);
        const [sampleOpportunity] = result.sampleOpportunities;
        expect(sampleOpportunity).to.have.property('@type', 'ScheduledSession');
        expect(sampleOpportunity).to.have.property('@id').which.is.oneOf(idAllowlist);
        expect(sampleOpportunity).to.have.nested.property('superEvent.@type', 'SessionSeries');
        expect(sampleOpportunity).to.have.nested.property('superEvent.@id').which.is.oneOf(parentIdAllowlist);
        expect(result).to.have.property('exampleOrderItems').that.has.lengthOf(1);
        const [exampleOrderItem] = result.exampleOrderItems;
        expect(exampleOrderItem).to.include({
          '@type': 'OrderItem',
          position: 0,
        });
        expect(exampleOrderItem).to.have.property('acceptedOffer').which.is.oneOf(offerIdAllowlist);
        expect(exampleOrderItem).to.have.property('orderedItem', sampleOpportunity['@id']);
      };

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
      /** @type {import('../src/util/persistent-store').PersistentStore['_opportunityItemRowCache']} */
      const opportunityCache = {
        parentIdIndex: new Map([
          ['parentid1', new Set(['id1'])],
          ['parentid2', new Set(['id2'])],
        ]),
        store: new Map([
          ['parentid1', {
            id: 'parentid1',
            modified: '123',
            deleted: false,
            feedModified: '123',
            jsonLdId: 'parentid1',
            jsonLdType: 'SessionSeries',
            isParent: true,
            jsonLdParentId: null,
            waitingForParentToBeIngested: false,
            jsonLd: {
              '@context': ['https://openactive.io/', 'https://openactive.io/ns-beta'],
              '@type': 'SessionSeries',
              '@id': 'parentid1',
              name: 'Session 1',
              organizer: {
                '@type': 'Organization',
                isOpenBookingAllowed: true,
              },
              offers: [{
                '@type': 'Offer',
                '@id': 'offer1',
                name: 'offer1',
                price: 10,
              }, {
                '@type': 'Offer',
                '@id': 'offer2',
                name: 'offer2',
                price: 0,
              }, {
                '@type': 'Offer',
                '@id': 'offer3',
                name: 'offer3',
                // This one should not be bookable as "now" is Jan 1st 2001 and the
                // session starts Jan 2nd.
                validFromBeforeStartDate: 'PT1S',
                price: 20,
              }],
            },
          }],
          ['parentid2', {
            id: 'parentid2',
            modified: '123',
            deleted: false,
            feedModified: '123',
            jsonLdId: 'parentid2',
            jsonLdType: 'SessionSeries',
            isParent: true,
            jsonLdParentId: null,
            waitingForParentToBeIngested: false,
            jsonLd: {
              '@context': ['https://openactive.io/', 'https://openactive.io/ns-beta'],
              '@type': 'SessionSeries',
              '@id': 'parentid2',
              description: 'Session 2',
              organizer: {
                '@type': 'Organization',
                isOpenBookingAllowed: true,
              },
              offers: [{
                '@type': 'Offer',
                '@id': 'offer1',
                name: 'offer1',
                price: 10,
              }, {
                '@type': 'Offer',
                '@id': 'offer2',
                name: 'offer2',
                price: 0,
              }, {
                '@type': 'Offer',
                '@id': 'offer3',
                name: 'offer3',
                // This one should not be bookable as "now" is Jan 1st 2001 and the
                // session starts Jan 2nd.
                validThroughBeforeStartDate: 'P100D',
                price: 20,
              }],
            },
          }],
          ['id1', {
            id: 'id1',
            modified: '123',
            deleted: false,
            feedModified: '123',
            jsonLdId: 'id1',
            jsonLdType: 'ScheduledSession',
            isParent: false,
            jsonLdParentId: 'parentid1',
            waitingForParentToBeIngested: false,
            jsonLd: {
              '@context': ['https://openactive.io/'],
              '@type': 'ScheduledSession',
              '@id': 'id1',
              superEvent: 'parentid1',
              startDate: '2001-01-02T00:00:00Z',
            },
          }],
          ['id2', {
            id: 'id2',
            modified: '123',
            deleted: false,
            feedModified: '123',
            jsonLdId: 'id2',
            jsonLdType: 'ScheduledSession',
            isParent: false,
            jsonLdParentId: 'parentid2',
            waitingForParentToBeIngested: false,
            jsonLd: {
              '@context': ['https://openactive.io/'],
              '@type': 'ScheduledSession',
              '@id': 'id2',
              superEvent: 'parentid2',
              name: 'ScheduledSession 2',
              startDate: '2001-01-02T00:00:00Z',
            },
          }],
        ]),
      };
      const lockedOpportunityIdsByTestDataset = new Map();
      const brokerConfig = {
        HARVEST_START_TIME: '2001-01-01T00:00:00Z',
      };
      const persistentStore = new PersistentStore();
      persistentStore._criteriaOrientedOpportunityIdCache = cooiCache;
      persistentStore._opportunityItemRowCache = opportunityCache;
      const state = {
        persistentStore,
        lockedOpportunityIdsByTestDataset,
      };
      /**
       * @param {string} criteria
       */
      const makeReqBody = (criteria) => ({
        '@context': [
          'https://openactive.io/',
          'https://openactive.io/test-interface',
        ],
        '@type': 'ScheduledSession',
        superEvent: {
          '@type': 'SessionSeries',
          organizer: {
            '@type': 'Organization',
            '@id': 'seller1',
          },
        },
        'test:testOpportunityCriteria': criteria,
        'test:testOpenBookingFlow': 'https://openactive.io/test-interface#OpenBookingSimpleFlow',
      });
      const result1 = await getSampleOpportunities(
        brokerConfig,
        state,
        makeReqBody('https://openactive.io/test-interface#TestOpportunityBookable'),
      );
      testResult(result1, ['id1', 'id2'], ['parentid1', 'parentid2'], ['offer1', 'offer2']);
      // That item should now have been locked. So another call should get the other item
      const result2 = await getSampleOpportunities(
        brokerConfig,
        state,
        makeReqBody('https://openactive.io/test-interface#TestOpportunityBookable'),
      );
      const isResult1Id1 = /** @type {any} */(result1).sampleOpportunities[0]['@id'] === 'id1';
      testResult(
        result2,
        isResult1Id1 ? ['id2'] : ['id1'],
        isResult1Id1 ? ['parentid2'] : ['parentid1'],
        ['offer1', 'offer2'],
      );
      // And then another call should get nothing
      const result3 = await getSampleOpportunities(
        brokerConfig,
        state,
        makeReqBody('https://openactive.io/test-interface#TestOpportunityBookable'),
      );
      expect(result3).to.have.nested.property('error.suggestion');
      // We reset by clearing the locks
      lockedOpportunityIdsByTestDataset.clear();
      const result4 = await getSampleOpportunities(
        brokerConfig,
        state,
        makeReqBody('https://openactive.io/test-interface#TestOpportunityBookableFree'),
      );
      // Only this combo supports free bookings
      testResult(result4, ['id1'], ['parentid1'], ['offer2']);
    });
  });
});
