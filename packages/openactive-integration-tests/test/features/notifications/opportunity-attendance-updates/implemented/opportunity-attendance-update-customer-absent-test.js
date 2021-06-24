const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { TestRecipes } = require('../../../../shared-behaviours/test-recipes');

FeatureHelper.describeFeature(module, {
  testCategory: 'notifications',
  testFeature: 'opportunity-attendance-updates',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-attendance-update-customer-absent',
  testName: "Changes to an opportunity's attendance (via AttendeeAbsentSimulateAction) should update the Order Feed.",
  testDescription: "After B, invoke an `AttendeeAbsentSimulateAction`. This should create an update in the Order Feed with the OrderItem's orderItemStatus changed to `https://openactive.io/CustomerAttended`",
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
TestRecipes.simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2Book({ actionType: 'test:AttendeeAbsentSimulateAction' },
  ({ orderFeedUpdate, orderItemCriteriaList }) => {
    it('OrderItems should have CustomerAttended statuses', () => {
      // new = after the AttendeeAbsentSimulateAction was invoked
      const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(newOrderItems).to.be.an('array');
      expect(newOrderItems).to.have.lengthOf.above(0);
      expect(newOrderItems).to.have.lengthOf(orderItemCriteriaList.length);

      for (const newOrderItem of newOrderItems) {
        const { orderItemStatus } = newOrderItem;

        expect(orderItemStatus).to.be.a('string');
        expect(orderItemStatus).to.be.equal('https://openactive.io/AttendeeAbsent');
      }
    });
  }));
