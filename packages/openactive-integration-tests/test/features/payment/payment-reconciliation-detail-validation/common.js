const { expect } = require('chai');
const { FlowStageRecipes, FlowStageUtils } = require('../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../helpers/logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../../../templates/b-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('../../../helpers/flow-stages/flow-stage-recipes').InitialiseSimpleC1C2BookFlowOptions} InitialiseSimpleC1C2BookFlowOptions
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {InitialiseSimpleC1C2BookFlowOptions} [reqTemplateRefs]
 */
function notImplementedTest(reqTemplateRefs) {
  /** @type {import('../../../helpers/feature-helper').RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow2(orderItemCriteriaList, logger, reqTemplateRefs);

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  };
  return runTestsFn;
}

/**
 * Test that runs C1 -> C2 -> B and expects B to fail with an InvalidPaymentDetailsError.
 *
 * @param {'incorrectReconciliationDetails' | 'missingPaymentReconciliationDetails'} templateRef
 */
function invalidDetailsTest(templateRef) {
  /** @type {import('../../../helpers/feature-helper').RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow2(orderItemCriteriaList, logger,
      {
        c1ReqTemplateRef: templateRef,
        c2ReqTemplateRef: templateRef,
        c1ExpectToFail: true,
        c2ExpectToFail: true,
      });

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
      itShouldReturnAnOpenBookingError('InvalidPaymentDetailsError', 400, () => c1.getStage('c1').getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
      itShouldReturnAnOpenBookingError('InvalidPaymentDetailsError', 400, () => c2.getStage('c2').getOutput().httpResponse);
    });
    // Note B/P is not called, as the totalPaymentDue is not known, so is difficult to test this
  };
  return runTestsFn;
}

function paymentReconciliationSuccessTest(freeOpportunities) {
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    const { paymentReconciliationDetails } = global.SELLER_CONFIG.primary;

    /**
     * @param {() => ChakramResponse} responseAccessor This is wrapped in a
     *   function because the actual response won't be available until the
     *   asynchronous before() block has completed.
     */
    function itShouldReturnCorrectReconciliationDetails(responseAccessor) {
      if (freeOpportunities) {
        it('should return reflect back payment, as the opportunity does not require payment', () => {
          const { payment } = responseAccessor().body;
          // eslint-disable-next-line no-unused-expressions
          expect(payment).to.be.undefined;
        });
      } else {
        it('should return correct reconciliation details', () => {
          const { payment } = responseAccessor().body;
          // the payment will have other details like `identifier` - hence, `.include()`
          expect(payment).to.include(paymentReconciliationDetails);
        });
      }
    }

    // The latter tests are rendered slightly pointless if the test config does not include paymentReconciliationDetails
    describe('the test suite config primary seller', () => {
      // https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#payment-reconciliation-detail-validation
      it('should have paymentReconciliationDetails, with at least one property', () => {
        expect(paymentReconciliationDetails).to.be.an('object');
        expect(paymentReconciliationDetails).to.satisfy(details => (
          details.name || details.accountId || details.paymentProviderId
        ), 'should have at least one property (name, accountId or paymentProviderId)');
      });
    });

    const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow2(orderItemCriteriaList, logger);

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
      itShouldReturnCorrectReconciliationDetails(() => c1.getStage('c1').getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      itShouldReturnCorrectReconciliationDetails(() => c2.getStage('c2').getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
      itShouldReturnCorrectReconciliationDetails(() => bookRecipe.b.getOutput().httpResponse);
    });
  };
  return runTestsFn;
}

module.exports = {
  paymentReconciliationSuccessTest,
  invalidDetailsTest,
  notImplementedTest,
};
