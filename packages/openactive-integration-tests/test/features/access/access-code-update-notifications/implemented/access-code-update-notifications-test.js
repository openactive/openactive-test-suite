const { expect } = require('chai');
const { zip } = require('lodash');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { TestRecipes } = require('../../../../shared-behaviours/test-recipes');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-code-update-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'access-code-update-notifications',
  testName: 'Access code updated after B request.',
  testDescription: 'Access code updated after B request is reflected in Orders feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityOfflineBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: false, // https://github.com/openactive/OpenActive.Server.NET/issues/120
},
TestRecipes.simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2Book({ actionType: 'test:AccessCodeUpdateSimulateAction' },
  ({ b, orderFeedUpdate }) => {
    it('should have access codes with altered values', () => {
      // Virtual sessions do not have accessPasses so need to be filtered out

      // original = before the AccessCodeUpdateSimulationAction was invoked
      const originalPhysicalOrderItems = b.getOutput().httpResponse.body.orderedItem.filter(orderItem => !orderItem.accessChannel || orderItem.accessChannel['@type'] !== 'VirtualLocation');
      // new = after the AccessCodeUpdateSimulationAction was invoked
      const newPhysicalOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem.filter(orderItem => !orderItem.accessChannel || orderItem.accessChannel['@type'] !== 'VirtualLocation');
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(newPhysicalOrderItems).to.be.an('array')
        .and.to.have.lengthOf.above(0)
        .and.to.have.lengthOf(originalPhysicalOrderItems.length);

      for (const [originalOrderItem, newOrderItem] of zip(originalPhysicalOrderItems, newPhysicalOrderItems)) {
        const originalAccessCodes = originalOrderItem.accessCode;
        const newAccessCodes = newOrderItem.accessCode;

        // we don't check that newAccessCodes has the same length as originalAccessCodes
        // as the length could feasibly have changed from the AccessCodeUpdateSimulateAction
        // All we need to do, therefore, is check that the codes, as a whole, are different.
        const sortedOriginalAccessCodes = [...originalAccessCodes].sort();
        const sortedNewAccessCodes = [...newAccessCodes].sort();
        expect(sortedNewAccessCodes).to.not.deep.equal(sortedOriginalAccessCodes);
      }
    });
  }));
