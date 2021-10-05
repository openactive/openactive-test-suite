const { expect } = require('chai');
const moment = require('moment');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

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
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow2(orderItemCriteriaList, logger);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldReturnLeaseWithFutureExpiryDate(() => c2.getStage('c2').getOutput().httpResponse);
  });
});
