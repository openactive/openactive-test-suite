/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai'); // The latest version for new features than chakram includes
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, B, Common } = require('../../../../shared-behaviours');
const { FlowStageRecipes, FlowStageUtils, OrderFeedUpdateFlowStageUtils, OrderDeletionFlowStage, CancelOrderFlowStage } = require('../../../../helpers/flow-stages');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'book-and-cancel',
  testName: 'Successful booking and cancellation.',
  testDescription: 'A successful end to end booking including cancellation, including checking the Orders Feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableCancellable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteria, logger);
  
  // ### Cancel 1st Order Item
  const [cancelOrderItem, orderFeedUpdateAfter1stCancel] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      getOrderItemId: CancelOrderFlowStage.getFirstOrderItemIdFromB(b),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after OrderCancellation)',
    },
  });

  // ### Cancel 1st Order Item again test idempotency
  const [cancelOrderItemAgain, orderFeedUpdateAfter2ndCancel] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      getOrderItemId: CancelOrderFlowStage.getFirstOrderItemIdFromB(b),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after OrderCancellation)',
    },
  });


  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrderItem);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateAfter1stCancel, () => {
    it('should have orderItemStatus: CustomerCancelled', () => {
      const orderItems = orderFeedUpdateAfter1stCancel.getOutput().httpResponse.body.data.orderedItem;
      expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteria.length);
      expect(orderItems[0]).to.have.property('orderItemStatus', 'https://openactive.io/CustomerCancelled');
      for (const orderItem of orderItems.slice(1)) {
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/OrderItemConfirmed');
      }
    });
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrderItemAgain);
});
