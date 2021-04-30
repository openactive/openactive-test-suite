const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation',
  testName: 'Payment reconciliation detail validation',
  testDescription: 'C1, C2 and B including globally configured accountId, paymentProviderId and name should succeed',
  testOpportunityCriteria: 'TestOpportunityBookableUsingPayment',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: true,
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const { paymentReconciliationDetails } = global.SELLER_CONFIG.primary;

  /**
   * @param {() => ChakramResponse} responseAccessor This is wrapped in a
   *   function because the actual response won't be available until the
   *   asynchronous before() block has completed.
   */
  function itShouldReturnCorrectReconciliationDetails(responseAccessor) {
    it('should return correct reconciliation details', () => {
      const { payment } = responseAccessor().body;
      // the payment will have other details like `identifier` - hence, `.include()`
      expect(payment).to.include(paymentReconciliationDetails);
    });
  }

  // The latter tests are rendered slightly pointless if the test config does not include paymentReconciliationDetails
  describe('the test config primary seller', () => {
    // https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#payment-reconciliation-detail-validation
    it('should have paymentReconciliationDetails, with at least one property', () => {
      expect(paymentReconciliationDetails).to.be.an('object');
      expect(paymentReconciliationDetails).to.satisfy(details => (
        details.name || details.accountId || details.paymentProviderId
      ), 'should have at least one property (name, accountId or paymentProviderId)');
    });
  });

  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldReturnCorrectReconciliationDetails(() => c1.getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldReturnCorrectReconciliationDetails(() => c2.getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    itShouldReturnCorrectReconciliationDetails(() => bookRecipe.b.getOutput().httpResponse);
  });
});
