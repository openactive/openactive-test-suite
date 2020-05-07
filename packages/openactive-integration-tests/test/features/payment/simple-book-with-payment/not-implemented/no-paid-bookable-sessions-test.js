/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { C1 } = require('../../../../shared-behaviours/c1');
const { C2 } = require('../../../../shared-behaviours/c2');
const { B } = require('../../../../shared-behaviours/b');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature({
  testCategory: 'payment',
  testFeature: 'simple-book-with-payment',
  testFeatureImplemented: false,
  testName: 'no-paid-bookable-sessions',
  testDescription: 'Check that the feed does not include any bookable sessions with a non-zero price.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookablePaid',
},
// eslint-disable-next-line no-unused-vars
function (_configuration, orderItemCriteria, _featureIsImplemented, _logger, state, _flow) {
  beforeAll(async function () {
    await state.createOpportunity(orderItemCriteria);

    return chakram.wait();
  });

  describe('Opportunity feed', function () {
    it('does not include any bookable sessions with a non-zero price', () => {
      // eslint-disable-next-line no-unused-expressions
      expect(state.eventId).to.be.undefined;
    });
  });
});
