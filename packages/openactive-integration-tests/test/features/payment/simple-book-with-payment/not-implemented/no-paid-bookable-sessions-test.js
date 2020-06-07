/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'simple-book-with-payment',
  testFeatureImplemented: false,
  testIdentifier: 'no-paid-bookable-sessions',
  testName: 'No paid bookable session',
  testDescription: 'Check that the feed does not include any bookable sessions with a non-zero price.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  skipMultiple: true,
},
// eslint-disable-next-line no-unused-vars
function (configuration, orderItemCriteria, _featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.fetchOpportunities(orderItemCriteria, true);

    return chakram.wait();
  });

  describe('Opportunity feed', function () {
    it('response not successful as feed does not include any bookable sessions with a non-zero price', () => {
      // eslint-disable-next-line no-unused-expressions
      expect(state.fetchOpportunitiesSucceeded).to.be.false;
    });
  });
});
