const { expect } = require('chai');
const { FlowStageRecipes, FlowStageUtils } = require('../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../shared-behaviours/errors');

/**
 * @typedef {import('../../templates/b-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('../../helpers/feature-helper').RunTestsFn} RunTestsFn
 * @typedef {import('../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../helpers/flow-stages/flow-stage').Prepayment} Prepayment
 * @typedef {import('../../helpers/flow-stages/flow-stage-recipes').C1AssertCapacityRun} C1AssertCapacityRun
 * @typedef {import('../../helpers/flow-stages/flow-stage-recipes').C2AssertCapacityRun} C2AssertCapacityRun
 */

/**
 * @param {string | null} expected
 * @param {() => unknown} getOrder
 */
function itShouldHavePrepayment(expected, getOrder) {
  it(expected == null ? 'should not return `totalPaymentDue.openBookingPrepayment`' : `should return \`totalPaymentDue.openBookingPrepayment\` '\`${expected}\`'`, () => {
    const order = getOrder();

    if (expected == null) {
      expect(order).to.have.property('totalPaymentDue');
      expect(order).to.not.have.nested.property('totalPaymentDue.openBookingPrepayment');
    } else {
      expect(order).to.have.nested.property('totalPaymentDue.openBookingPrepayment', expected);
    }
  });
}

/**
 * @param {string} testOpportunityCriteria
 * @returns {import('../../helpers/feature-helper').CreateMultipleOportunityCriteriaTemplateFn}
 */
function multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria(testOpportunityCriteria) {
  return (opportunityType, bookingFlow) => [{
    opportunityType,
    opportunityCriteria: testOpportunityCriteria,
    primary: true,
    control: false,
    bookingFlow,
  }];
}

/**
 * @param {string | null} expectedPrepayment
 * @param {FetchOpportunitiesFlowStageType} fetchOpportunities
 * @param {C1AssertCapacityRun} c1
 * @param {C2AssertCapacityRun} c2
 */
function commonTestsTestFetchOpportunitiesC1AndC2(expectedPrepayment, fetchOpportunities, c1, c2) {
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldHavePrepayment(expectedPrepayment, () => c1.getStage('c1').getOutput().httpResponse.body);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldHavePrepayment(expectedPrepayment, () => c2.getStage('c2').getOutput().httpResponse.body);
  });
}

/**
 * @param {Prepayment | null} expectedPrepayment
 * @param {PReqTemplateRef} bookReqTemplateRef
 */
function successTests(expectedPrepayment, bookReqTemplateRef) {
  /** @type {RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, { bookReqTemplateRef });

    // ## Set up tests
    commonTestsTestFetchOpportunitiesC1AndC2(expectedPrepayment, fetchOpportunities, c1, c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
      if (bookRecipe.isApproval()) {
        itShouldHavePrepayment(expectedPrepayment, () => bookRecipe.p.getOutput().httpResponse.body);
      }
      itShouldHavePrepayment(expectedPrepayment, () => bookRecipe.b.getOutput().httpResponse.body);
    });
  };
  return runTestsFn;
}

/**
 * @param {Prepayment | null} expectedPrepayment
 * @param {'MissingPaymentDetailsError' | 'UnnecessaryPaymentDetailsError' | 'IncompletePaymentDetailsError' | 'TotalPaymentDueMismatchError'} expectedError
 * @param {PReqTemplateRef} bookReqTemplateRef
 */
function errorTests(expectedPrepayment, expectedError, bookReqTemplateRef) {
  const missingOrUnnecessary = expectedError === 'MissingPaymentDetailsError'
    ? 'Missing'
    : 'Unnecessary';

  /** @type {RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    describe(`${missingOrUnnecessary} payment property at B`, () => {
      // ## Initiate Flow Stages
      const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
        bookReqTemplateRef,
        bookExpectToFail: true,
      });

      // ## Set up tests
      commonTestsTestFetchOpportunitiesC1AndC2(expectedPrepayment, fetchOpportunities, c1, c2);
      FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
        itShouldReturnAnOpenBookingError(expectedError, 400, () => bookRecipe.firstStage.getOutput().httpResponse);
      });
    });
  };
  return runTestsFn;
}

module.exports = {
  itShouldHavePrepayment,
  multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria,
  successTests,
  errorTests,
};
