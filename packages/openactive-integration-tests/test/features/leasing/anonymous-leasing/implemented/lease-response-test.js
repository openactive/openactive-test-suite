const { expect } = require('chai');
const moment = require('moment');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageUtils, FlowStageRecipes } = require('../../../../helpers/flow-stages');

const { IMPLEMENTED_FEATURES } = global;

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
  testFeature: 'anonymous-leasing',
  testFeatureImplemented: true,
  testIdentifier: 'lease-response',
  testName: 'Response at C2 includes a "lease" with a "leaseExpires" in the future',
  testDescription: 'Named lease returned at C2 reserves the OrderItems for a specified length of time',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
  const { fetchOpportunities, c1 } = FlowStageRecipes.initialiseSimpleC1Flow(orderItemCriteriaList, logger, describeFeatureRecord);

  it('should implement named leasing as well', () => {
    // eslint-disable-next-line no-unused-expressions
    expect(IMPLEMENTED_FEATURES['named-leasing']).to.be.true;
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldReturnLeaseWithFutureExpiryDate(() => c1.getStage('c1').getOutput().httpResponse);
  });
});
