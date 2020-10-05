const { expect } = require('chai');
const moment = require('moment');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2 } = require('../../../../shared-behaviours');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} getChakramResponse This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldReturnLeaseWithFutureExpiryDate(getChakramResponse) {
  it('should return lease with future expiry date', () => {
    const chakramResponse = getChakramResponse();
    const leaseExpires = moment(chakramResponse.body.lease.leaseExpires);
    expect(leaseExpires.isAfter()).to.equal(true);
  });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'leasing',
  testFeature: 'named-leasing',
  testFeatureImplemented: true,
  testIdentifier: 'lease-response',
  testName: 'Response at C2 includes a "lease" with a "leaseExpires" in the future',
  testDescription: 'Named lease returned at C2 reserves the OrderItems for a specified length of time',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  beforeAll(async () => {
    await state.fetchOpportunities(orderItemCriteria);
  });

  describe('Get Opportunity Feed Items', () => {
    (new GetMatch({
      state, flow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C1', () => {
    (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C2', () => {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    itShouldReturnLeaseWithFutureExpiryDate(() => state.c2Response);
  });
});
