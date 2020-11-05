const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { TestRecipes } = require('../../../../shared-behaviours/test-recipes');

FeatureHelper.describeFeature(module, {
  testCategory: 'notifications',
  testFeature: 'customer-notice-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'customer-notice-notification',
  testName: "Changes to an OrderItem's customerNotice (via CustomerNoticeSimulateAction) should update the Order Feed.",
  testDescription: "After B, invoke a CustomerNoticeSimulateAction. This should create an update in the Order Feed with the OrderItem's customerNotice changed.",
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipTest: true, // until https://github.com/openactive/OpenActive.Server.NET/pull/80 is merged
},
TestRecipes.simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2B({ actionType: 'test:CustomerNoticeSimulateAction' },
  ({ orderFeedUpdate, orderItemCriteriaList }) => {
    it('should have customer notices with non empty string values', () => {
      // new = after the CustomerNoticeSimulateAction was invoked
      const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(newOrderItems).to.be.an('array')
        .and.to.have.lengthOf.above(0)
        .and.to.have.lengthOf(orderItemCriteriaList.length);

      for (const newOrderItem of newOrderItems) {
        const newCustomerNotice = newOrderItem.customerNotice;

        // Checking that customerNotice now has a non-empty value
        expect(newCustomerNotice).to.be.a('string')
          .and.to.have.lengthOf.at.least(1);
      }
    });
  }));
