const { expect } = require('chai');
const { zip } = require('lodash');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { TestRecipes } = require('../../../../shared-behaviours/test-recipes');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-pass-update-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'access-pass-update-notifications',
  testName: 'Access pass updated after B request.',
  testDescription: 'Access pass updated after B request is reflected in Orders feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
TestRecipes.simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2B({ actionType: 'test:AccessPassUpdateSimulateAction' },
  ({ b, orderFeedUpdate, orderItemCriteriaList }) => {
    it('should have access passes with altered values', () => {
      // original = before the AccessPassUpdateSimulationAction was invoked
      const originalOrderItems = b.getOutput().httpResponse.body.orderedItem;
      // new = after the AccessPassUpdateSimulationAction was invoked
      const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(newOrderItems).to.be.an('array')
        .and.to.have.lengthOf.above(0)
        .and.to.have.lengthOf(orderItemCriteriaList.length);

      for (const [originalOrderItem, newOrderItem] of zip(originalOrderItems, newOrderItems)) {
        const originalAccessPass = originalOrderItem.accessPass;
        const newAccessPass = newOrderItem.accessPass;

        // we don't check that newAccessCodes has the same length as originalAccessCodes
        // as the length could feasibly have changed from the AccessCodeUpdateSimulateAction
        // All we need to do, therefore, is check that the codes, as a whole, are different.
        const sortedOriginalAccessPass = [...originalAccessPass].sort();
        const sortedNewAccessPass = [...newAccessPass].sort();
        expect(sortedNewAccessPass).to.not.deep.equal(sortedOriginalAccessPass);
      }
    });
  }));
