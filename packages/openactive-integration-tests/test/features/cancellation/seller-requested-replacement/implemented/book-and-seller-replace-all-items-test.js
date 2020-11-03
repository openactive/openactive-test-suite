const { expect } = require('chai');
const { prop } = require('ramda');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { TestRecipes } = require('../../../../shared-behaviours/test-recipes');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'seller-requested-replacement',
  testFeatureImplemented: true,
  testIdentifier: 'book-and-seller-replace-all-items',
  testName: 'Bookm seller replaces order items.',
  testDescription: 'A successful replacement of order items by seller.',
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
TestRecipes.simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2B({ actionType: 'test:ReplacementSimulateAction' },
  ({ b, orderFeedUpdate, orderItemCriteriaList }) => {
    it('should have replaced (at least one) OrderItems with a new one', () => {
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

      // At least one OrderItem should be replaced with a new one.
      // OrderItem IDs are sorted so that they can be directly compared with one another.
      const originalOrderItemIdsSorted = originalOrderItems.map(prop('@id')).sort();
      const newOrderItemIdsSorted = newOrderItems.map(prop('@id')).sort();
      expect(originalOrderItemIdsSorted).to.not.deep.equal(newOrderItemIdsSorted);
    });
  }));
