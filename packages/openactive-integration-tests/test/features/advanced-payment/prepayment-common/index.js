const { expect } = require('chai');
const { GetMatch, C1, C2, B } = require('../../../shared-behaviours');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import("../../../shared-behaviours/common").C1} C1
 * @typedef {import("../../../shared-behaviours/common").C1} C2
 * @typedef {import("../../../shared-behaviours/common").C1} B
 */

/**
 * @param {string} expected
 * @param {C1|C2|B} stage
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldHavePrepayment(expected, stage, responseAccessor) {
  it('should return prepayment', () => {
    stage.expectResponseReceived();
    const response = responseAccessor().body;

    expect(response.totalPaymentDue.prepayment).to.equal(expected);
  });
}

/**
 * @param {any} testOpportunityCriteria
 */
function multipleOpportunityCriteriaTemplate(testOpportunityCriteria) {
  return opportunityType => [{
    opportunityType,
    opportunityCriteria: testOpportunityCriteria,
    primary: true,
    control: false,
  }];
}

/**
 * @param {string} expectedPrepayment
 */
function successTests(expectedPrepayment) {
  return (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
    beforeAll(async () => {
      await state.fetchOpportunities(orderItemCriteria);
    });

    describe('Get Opportunity Feed Items', () => {
      (new GetMatch({
        state, flow, logger, orderItemCriteria,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe('C1', () => {
      const c1 = (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      itShouldHavePrepayment(expectedPrepayment, c1, () => state.c1Response);
    });

    describe('C2', () => {
      const c2 = (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      itShouldHavePrepayment(expectedPrepayment, c2, () => state.c2Response);
    });

    describe('B', () => {
      const b = (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      itShouldHavePrepayment(expectedPrepayment, b, () => state.bResponse);
    });
  };
}

module.exports = {
  multipleOpportunityCriteriaTemplate,
  successTests,
};
