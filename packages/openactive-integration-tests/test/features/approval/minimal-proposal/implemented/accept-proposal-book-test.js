const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FetchOpportunitiesFlowStage } = require('../../../../helpers/flow-stages/fetch-opportunities');
const { C1FlowStage } = require('../../../../helpers/flow-stages/c1');
const { C2FlowStage } = require('../../../../helpers/flow-stages/c2');
const { FlowStageUtils } = require('../../../../helpers/flow-stages/flow-stage-utils');
const RequestHelper = require('../../../../helpers/request-helper');
const { PFlowStage } = require('../../../../helpers/flow-stages/p');
const { TestInterfaceActionFlowStage } = require('../../../../helpers/flow-stages/test-interface-action');
const { OrderFeedUpdateFlowStage } = require('../../../../helpers/flow-stages/order-feed-update');
const { BFlowStage } = require('../../../../helpers/flow-stages/b');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} getChakramResponse This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldReturnOrderRequiresApprovalTrue(getChakramResponse) {
  it('should return orderRequiresApproval: true', () => {
    const chakramResponse = getChakramResponse();
    expect(chakramResponse.body).to.have.property('orderRequiresApproval', true);
  });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'approval',
  testFeature: 'minimal-proposal',
  testFeatureImplemented: true,
  testIdentifier: 'accept-proposal-book',
  testName: 'Successful booking using the Booking Flow with Approval',
  testDescription: 'A successful end to end booking, via Booking Flow with Approval, of an opportunity.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  // testOpportunityCriteria: 'TestOpportunityBookable',
  testOpportunityCriteria: 'TestOpportunityBookableFlowRequirementOnlyApproval',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const requestHelper = new RequestHelper(logger);

  // ## Initiate Flow Stages
  const fetchOpportunities = FetchOpportunitiesFlowStage.create({
    orderItemCriteriaList,
    logger,
    requestHelper,
  });
  const c1 = C1FlowStage.create({
    prerequisite: fetchOpportunities,
    logger,
    requestHelper,
  });
  const c2 = C2FlowStage.create({
    prerequisite: c1,
    logger,
    requestHelper,
  });
  const p = PFlowStage.create({
    prerequisite: c2,
    logger,
    requestHelper,
  });
  const initiateOrderFeedUpdate = OrderFeedUpdateFlowStage.createInitiator({
    prerequisite: p,
    requestHelper,
  });
  const simulateSellerApproval = TestInterfaceActionFlowStage.create({
    testName: 'Simulate Seller Approval (Test Interface Action)',
    prerequisite: initiateOrderFeedUpdate,
    createActionFn: () => ({
      type: 'test:SellerAcceptOrderProposalSimulateAction',
      objectType: 'OrderProposal',
      objectId: p.getResponse().body['@id'],
    }),
    requestHelper,
  });
  const collectOrderFeedUpdate = OrderFeedUpdateFlowStage.createCollector({
    testName: 'Order Feed Update (after Simulate Seller Approval)',
    prerequisite: simulateSellerApproval,
    logger,
  });
  const b = BFlowStage.create({
    prerequisite: collectOrderFeedUpdate,
    logger,
    requestHelper,
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, {
    itExtraTests() {
      itShouldReturnOrderRequiresApprovalTrue(() => c1.getResponse());
    },
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, {
    itExtraTests() {
      itShouldReturnOrderRequiresApprovalTrue(() => c2.getResponse());
    },
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(p, {
    itExtraTests() {
      // TODO does validator already check that orderProposalVersion is of form {orderId}/versions/{versionUuid}?
      it('should include an orderProposalVersion, of the form {orderId}/versions/{versionUuid}', () => {
        const { uuid } = p.getCombinedStateAfterRun();
        expect(p.getResponse().body).to.have.property('orderProposalVersion')
          .which.matches(RegExp(`${uuid}/versions/.+`));
      });
      // TODO does validator check that orderItemStatus is https://openactive.io/OrderItemProposed?
      // TODO does validator check that full Seller details are included in the seller response?
    },
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerApproval);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(collectOrderFeedUpdate, {
    itExtraTests() {
      it('should have orderProposalStatus: SellerAccepted', () => {
        expect(collectOrderFeedUpdate.getResponse().body).to.have.nested.property('data.orderProposalStatus', 'https://openactive.io/SellerAccepted');
      });
      it('should have orderProposalVersion same as that returned by P (i.e. an amendment hasn\'t occurred)', () => {
        expect(collectOrderFeedUpdate.getResponse().body).to.have.nested.property('data.orderProposalVersion', p.getResponse().body.orderProposalVersion);
      });
    },
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
});
