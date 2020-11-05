const { expect } = require('chai');
const { FlowStageRecipes, FlowStageUtils } = require('../../helpers/flow-stages');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../helpers/flow-stages/flow-stage-recipes').InitialiseSimpleC1C2BFlowOptions} InitialiseSimpleC1C2BFlowOptions
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

/**
 * @param {Omit<InitialiseSimpleC1C2BFlowOptions, 'taxMode'>} [options]
 */
function grossTest(options) {
  /** @type {import('../../helpers/feature-helper').RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    // ## Init Flow Stages
    const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(
      orderItemCriteriaList,
      logger,
      { ...options, taxMode: 'https://openactive.io/TaxGross' },
    );

    // ## Run Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
      itShouldCalculateTaxCorrectly(() => c1.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      itShouldCalculateTaxCorrectly(() => c2.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b, () => {
      itShouldCalculateTaxCorrectly(() => b.getOutput().httpResponse);
    });
  };
  return runTestsFn;
}

module.exports = {
  grossTest,
};
