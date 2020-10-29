const { expect } = require('chai');
const { FlowStageRecipes, FlowStageUtils } = require('../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../shared-behaviours/errors');

/**
 * @typedef {import('../../templates/b-req').BReqTemplateRef} BReqTemplateRef
 * @typedef {import('../../helpers/feature-helper').RunTestsFn} RunTestsFn
 * @typedef {import('../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

/**
 * @typedef {'https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable'} Prepayment
 */

/**
 * @param {string | null} expected
 * @param {() => unknown} getOrder
 */
function itShouldHavePrepayment(expected, getOrder) {
  it(expected == null ? 'should not return `totalPaymentDue.prepayment`' : `should return \`totalPaymentDue.prepayment\` '\`${expected}\`'`, () => {
    const order = getOrder();

    if (expected == null) {
      expect(order).to.have.property('totalPaymentDue');
      expect(order).to.not.have.nested.property('totalPaymentDue.prepayment');
    } else {
      expect(order).to.have.nested.property('totalPaymentDue.prepayment', expected);
    }
  });
}

function multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria(testOpportunityCriteria) {
  return opportunityType => [{
    opportunityType,
    opportunityCriteria: testOpportunityCriteria,
    primary: true,
    control: false,
  }];
}

/**
 * @param {string | null} expectedPrepayment
 * @param {FetchOpportunitiesFlowStageType} fetchOpportunities
 * @param {C1FlowStageType} c1
 * @param {C2FlowStageType} c2
 */
function commonTestsTestFetchOpportunitiesC1AndC2(expectedPrepayment, fetchOpportunities, c1, c2) {
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldHavePrepayment(expectedPrepayment, () => c1.getOutput().httpResponse.body);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldHavePrepayment(expectedPrepayment, () => c2.getOutput().httpResponse.body);
  });
}

/**
 * @param {Prepayment | null} expectedPrepayment
 * @param {BReqTemplateRef} bReqTemplateRef
 */
function successTests(expectedPrepayment, bReqTemplateRef) {
  /** @type {RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    // ## Initiate Flow Stages
    const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, { bReqTemplateRef });

    // ## Set up tests
    commonTestsTestFetchOpportunitiesC1AndC2(expectedPrepayment, fetchOpportunities, c1, c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b, () => {
      itShouldHavePrepayment(expectedPrepayment, () => b.getOutput().httpResponse.body);
    });
  };
  return runTestsFn;
}

/**
 * @param {Prepayment | null} expectedPrepayment
 * @param {'MissingPaymentDetailsError' | 'UnnecessaryPaymentDetailsError' | 'IncompletePaymentDetailsError' | 'TotalPaymentDueMismatchError'} expectedError
 * @param {BReqTemplateRef} bReqTemplateRef
 */
function errorTests(expectedPrepayment, expectedError, bReqTemplateRef) {
  const missingOrUnnecessary = expectedError === 'MissingPaymentDetailsError'
    ? 'Missing'
    : 'Unnecessary';

  /** @type {RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    describe(`${missingOrUnnecessary} payment property at B`, () => {
      // ## Initiate Flow Stages
      const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, { bReqTemplateRef });

      // ## Set up tests
      commonTestsTestFetchOpportunitiesC1AndC2(expectedPrepayment, fetchOpportunities, c1, c2);
      FlowStageUtils.describeRunAndCheckIsValid(b, () => {
        itShouldReturnAnOpenBookingError(expectedError, 400, () => b.getOutput().httpResponse);
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
