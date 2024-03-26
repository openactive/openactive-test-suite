const { expect } = require('chai');
const { getStatus } = require('../src/get-status');
const { CriteriaOrientedOpportunityIdCache } = require('../src/util/criteria-oriented-opportunity-id-cache');
const PauseResume = require('../src/util/pause-resume');

describe('user-facing endpoints', () => {
  describe('GET /status', () => {
    it('should work', () => {
      const cooiCache = CriteriaOrientedOpportunityIdCache.create();
      CriteriaOrientedOpportunityIdCache.getTypeBucket(cooiCache, {
        criteriaName: 'TestOpportunityBookable',
        bookingFlow: 'OpenBookingSimpleFlow',
        opportunityType: 'ScheduledSession',
      });
      const result = getStatus({
        DO_NOT_FILL_BUCKETS: false,
      }, {
        startTime: new Date(),
        opportunityItemRowCache: {
          store: new Map([
            // Has a parent
            ['id1', {
              id: 'id1',
              jsonLdId: 'id1',
              jsonLdParentId: 'parentId1',
              jsonLdType: 'ScheduledSession',
              jsonLd: {
                '@type': 'ScheduledSession',
              },
              feedModified: Date.now(),
              deleted: false,
              modified: 123,
              waitingForParentToBeIngested: false,
            }],
            // Has no parent but doesn't need one either
            ['id2', {
              id: 'id2',
              jsonLdId: 'id2',
              jsonLdParentId: null,
              jsonLdType: 'ScheduledSession',
              jsonLd: {
                '@type': 'ScheduledSession',
              },
              feedModified: Date.now(),
              deleted: false,
              modified: 123,
              waitingForParentToBeIngested: false,
            }],
            // Has no parent and should have one
            ['id3', {
              id: 'id3',
              jsonLdId: 'id3',
              jsonLdParentId: 'parentid3',
              jsonLdType: 'ScheduledSession',
              jsonLd: {
                '@type': 'ScheduledSession',
              },
              feedModified: Date.now(),
              deleted: false,
              modified: 123,
              waitingForParentToBeIngested: true,
            }],
          ]),
          parentIdIndex: new Map(),
        },
        criteriaOrientedOpportunityIdCache: CriteriaOrientedOpportunityIdCache.create(),
        feedContextMap: new Map(),
        pauseResume: new PauseResume(),
      });
      // Only two of the three opportunities are "child opportunities" i.e. have
      // a parent
      expect(result.orphans).to.equal('1 of 2 (50.00%)');
      // Only two of the three opportunities count as being harvested — those
      // that are not still waiting for parent
      expect(result.totalOpportunitiesHarvested).to.equal(2);
    });
  });
});
