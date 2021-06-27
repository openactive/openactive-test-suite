/* eslint-disable no-shadow */
const { expect } = require('chai');
const { TestRecipes } = require('../../../shared-behaviours/test-recipes');

/**
 * Loops through the three different Change of Logistics Actions and ensures the expectations of only one is met
 * @param {{
 *   actionType: import('../../../helpers/flow-stages/test-interface-action').TestInterfaceActionType,
 * }} runChangeOfLogisticsTestsParams
 */
function runChangeOfLogisticsTests({ actionType }) {
  return TestRecipes.simulateActionAndExpectOrderFeedUpdateAfterSimpleC1C2Book(
    { actionType },
    ({ b, orderFeedUpdate, orderItemCriteriaList }) => {
      const opportunityInheritanceAccessor = (opportunity, accessor) => accessor(opportunity)
          || accessor(opportunity?.superEvent)
          || accessor(opportunity?.superEvent?.superEvent)
          || accessor(opportunity?.facilityUse);

      const accessorAggregator = (obj, inheritanceAccessor, accessors) => accessors.map(accessor => inheritanceAccessor(obj, accessor)).join('||');

      const orderItemAccessorAggregator = (orderItem, accessors) => accessorAggregator(orderItem?.orderedItem, opportunityInheritanceAccessor, accessors);

      // These comparators ensure that we ignore other properties within each JSON object,
      // and also ignore the ordering of the properties within each JSON object
      const comparatorItemAccessors = [
        {
          actionType: 'test:ChangeOfLogisticsNameSimulateAction',
          propertyDescription: '`name`',
          comparatorItemAccessor: orderItem => orderItemAccessorAggregator(orderItem, [
            x => x?.name,
          ]),
        },
        {
          actionType: 'test:ChangeOfLogisticsTimeSimulateAction',
          propertyDescription: '`startDate`, `endDate`, or `duration`',
          comparatorItemAccessor: orderItem => orderItemAccessorAggregator(orderItem, [
            x => x?.startDate,
            x => x?.endDate,
            x => x?.duration,
          ]),
        },
        {
          actionType: 'test:ChangeOfLogisticsLocationSimulateAction',
          propertyDescription: '`name`, `address` or `geo` properties within location, or `meetingPoint`',
          comparatorItemAccessor: orderItem => orderItemAccessorAggregator(orderItem, [
            x => x?.meetingPoint,
            x => accessorAggregator(x, x => opportunityInheritanceAccessor(x, x => x?.location), [
              x => x?.name,
              x => accessorAggregator(x, x => x?.geo, [
                x => x?.latitude,
                x => x?.longitude,
              ]),
              x => accessorAggregator(x, x => x?.address, [
                x => x?.streetAddress,
                x => x?.addressLocality,
                x => x?.addressRegion,
                x => x?.postalCode,
                x => x?.addressCountry,
              ]),
            ]),
          ]),
        },
      ];

      for (const item of comparatorItemAccessors) {
        const expectedChanges = item.actionType === actionType;

        it(`should ${expectedChanges ? '' : 'not '}have updated (at least one) ${item.propertyDescription} of the OrderItems`, () => {
          // original = before the ${actionType} was invoked
          const originalOrderItems = b.getOutput().httpResponse.body.orderedItem;

          // new = after the ${actionType} was invoked
          const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;

          // As we'll be setting out expectations in an iteration, this test would
          // give a false positive if there were no items in `orderedItem`, so we
          // explicitly test that the OrderItems are present.
          expect(newOrderItems).to.be.an('array')
            .and.to.have.lengthOf.above(0)
            .and.to.have.lengthOf(orderItemCriteriaList.length);

          // At least one orderedItem with the OrderItems should be updated
          // Opportunities within orderedItem are sorted so that they can be directly compared with one another.
          const originalOpportunityIdsSorted = originalOrderItems.map(item.comparatorItemAccessor).sort();
          const newOpportunityIdsSorted = newOrderItems.map(item.comparatorItemAccessor).sort();

          if (expectedChanges) {
            expect(originalOpportunityIdsSorted).to.not.deep.equal(newOpportunityIdsSorted);
          } else {
            expect(originalOpportunityIdsSorted).to.deep.equal(newOpportunityIdsSorted);
          }
        });
      }
    },
  );
}

module.exports = {
  runChangeOfLogisticsTests,
};
