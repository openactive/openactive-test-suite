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
      },
    ],
  },
};

describe('user-facing endpoints', () => {
  describe('GET /status', () => {
    it('should include stats about orphans and criteria matches', () => {
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

      const result = getStatus({
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
    it('should return stats about which opportunities are orphans i.e. have no parents', () => {
      const persistentStore = new PersistentStore();
      persistentStore._opportunityItemRowCache = {
        store: new Map([
          testDataGenerators.opportunityItemRowCacheStoreItems.hasAParent('id1', 'parentid1'),
          testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentButDoesntNeedOne('id2'),
          testDataGenerators.opportunityItemRowCacheStoreItems.hasNoParentAndShouldHaveOne('id3', 'parentid3'),
        ]),
        parentIdIndex: new Map(),
      };
      const result = getOrphanJson({
        persistentStore,
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
    it('should get an opportunity from the cache, merged with its parent', () => {
      /** @type {import('../src/util/persistent-store').PersistentStore['_opportunityCache']} */
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
      const persistentStore = new PersistentStore();
      persistentStore._opportunityCache = opportunityCache;
      const slotResult = getOpportunityMergedWithParentById({
        persistentStore,
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
        persistentStore,
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
    it('should get a random opportunity matching a criteria, and then lock it', () => {
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
      /** @type {import('../src/util/persistent-store').PersistentStore['_opportunityCache']} */
      const opportunityCache = {
        parentMap: new Map([
          ['parentid1', {
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
          }],
          ['parentid2', {
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
          }],
        ]),
        childMap: new Map([
          ['id1', {
            '@context': ['https://openactive.io/'],
            '@type': 'ScheduledSession',
            '@id': 'id1',
            superEvent: 'parentid1',
            startDate: '2001-01-02T00:00:00Z',
          }],
          ['id2', {
            '@context': ['https://openactive.io/'],
            '@type': 'ScheduledSession',
            '@id': 'id2',
            superEvent: 'parentid2',
            name: 'ScheduledSession 2',
            startDate: '2001-01-02T00:00:00Z',
          }],
        ]),
      };
      const lockedOpportunityIdsByTestDataset = new Map();
      const brokerConfig = {
        HARVEST_START_TIME: '2001-01-01T00:00:00Z',
      };
      const persistentStore = new PersistentStore();
      persistentStore._criteriaOrientedOpportunityIdCache = cooiCache;
      persistentStore._opportunityCache = opportunityCache;
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
      const result1 = getSampleOpportunities(
        brokerConfig,
        state,
        makeReqBody('https://openactive.io/test-interface#TestOpportunityBookable'),
      );
      testResult(result1, ['id1', 'id2'], ['parentid1', 'parentid2'], ['offer1', 'offer2']);
      // That item should now have been locked. So another call should get the other item
      const result2 = getSampleOpportunities(
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
      const result3 = getSampleOpportunities(
        brokerConfig,
        state,
        makeReqBody('https://openactive.io/test-interface#TestOpportunityBookable'),
      );
      expect(result3).to.have.nested.property('error.suggestion');
      // We reset by clearing the locks
      lockedOpportunityIdsByTestDataset.clear();
      const result4 = getSampleOpportunities(
        brokerConfig,
        state,
        makeReqBody('https://openactive.io/test-interface#TestOpportunityBookableFree'),
      );
      // Only this combo supports free bookings
      testResult(result4, ['id1'], ['parentid1'], ['offer2']);
    });
  });
});
