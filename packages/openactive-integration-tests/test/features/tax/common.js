const { expect } = require('chai');
const { GetMatch, C1, C2, B } = require('../../shared-behaviours');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldCalculateTaxCorrectly(responseAccessor) {
  it('should calculate tax correctly', () => {
    const { body } = responseAccessor();

    const totalPaymentTax = body.totalPaymentTax.map(t => t.price).reduce((a, b) => a + b);
    const unitTaxSpecification = body.orderedItem.flatMap(o => o.unitTaxSpecification).map(t => t.price).reduce((a, b) => a + b);

    const totalPaymentDue = body.totalPaymentDue.price;
    const acceptedOfferPrice = body.orderedItem.flatMap(o => o.acceptedOffer).map(t => t.price).reduce((a, b) => a + b);

    expect(body.taxCalculationExcluded).to.equal(undefined);
    expect(Math.abs(unitTaxSpecification - totalPaymentTax)).to.be.lessThan(1); // rounding errors
    expect(Math.abs(totalPaymentDue - acceptedOfferPrice)).to.be.lessThan(1); // rounding errors
  });
}

function grossTest(stateFn = null, flowFn = null) {
  return (configuration, orderItemCriteria, featureIsImplemented, logger, parentState, parentFlow) => {
    const state = stateFn ? stateFn(logger) : parentState;
    const flow = flowFn ? flowFn(state) : parentFlow;

    beforeAll(async () => {
      await state.fetchOpportunities(orderItemCriteria, undefined, 'https://openactive.io/TaxGross');
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
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      itShouldCalculateTaxCorrectly(() => state.c1Response);
    });

    describe('C2', () => {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      itShouldCalculateTaxCorrectly(() => state.c2Response);
    });

    describe('B', () => {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      itShouldCalculateTaxCorrectly(() => state.bResponse);
    });
  };
}

module.exports = {
  grossTest,
};
