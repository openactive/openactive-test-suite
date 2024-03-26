const { getStatus } = require('../src/core');
const { CriteriaOrientedOpportunityIdCache } = require('../src/util/criteria-oriented-opportunity-id-cache');
const PauseResume = require('../src/util/pause-resume');

describe('user-facing endpoints', () => {
  describe('GET /status', () => {
    it('should work', () => {
      const result = getStatus({
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
            ['id1', {
              id: 'id1',
              jsonLdId: 'id1',
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
            ['id1', {
              id: 'id1',
              jsonLdId: 'id1',
              jsonLdParentId: null,
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
      console.log('result:', result);
    });
  });
});
