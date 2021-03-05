const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { TestRecipes } = require('../../../../shared-behaviours/test-recipes');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-channel-update-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'access-channel-update-notifications',
  testName: 'Access channel updated after B request.',
  testDescription: 'Access channel, when updated after B request, is reflected in Orders feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityOnlineBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
TestRecipes.simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2B({ actionType: 'test:AccessChannelUpdateSimulateAction' },
  ({ b, orderFeedUpdate }) => {
    it('should have a new access channel value', () => {
      // original = before the AccessChannelUpdateSimulationAction was invoked
      const originalOnlineOrderItem = b.getOutput().httpResponse.body.orderedItem.find(orderItem => (
        orderItem.position === 0));
      // new = after the AccessChannelUpdateSimulationAction was invoked
      const newOnlineOrderItem = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem.find(orderItem => (
        orderItem.position === 0));
      expect(newOnlineOrderItem.accessChannel).to.not.deep.equal(originalOnlineOrderItem.accessChannel);
    });
  }));
