const { expect } = require('chai');
const { FlowStageRecipes, FlowStageUtils } = require('../../helpers/flow-stages');
const { GetMatch, C1, C2, B } = require('../../shared-behaviours');

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
 * @param {Omit<InitialiseSimpleC1C2BFlowOptions, 'taxMode'>} options
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

    // const state = stateFn ? stateFn(logger) : parentState;
    // const flow = flowFn ? flowFn(state) : parentFlow;

    // beforeAll(async () => {
    //   await state.fetchOpportunities(orderItemCriteria, undefined, 'https://openactive.io/TaxGross');
    // });

    // describe('Get Opportunity Feed Items', () => {
    //   (new GetMatch({
    //     state, flow, logger, orderItemCriteria,
    //   }))
    //     .beforeSetup()
    //     .successChecks()
    //     .validationTests();
    // });

    // describe('C1', () => {
    //   (new C1({
    //     state, flow, logger,
    //   }))
    //     .beforeSetup()
    //     .successChecks()
    //     .validationTests();

    //   itShouldCalculateTaxCorrectly(() => state.c1Response);
    // });

    // describe('C2', () => {
    //   (new C2({
    //     state, flow, logger,
    //   }))
    //     .beforeSetup()
    //     .successChecks()
    //     .validationTests();

    //   itShouldCalculateTaxCorrectly(() => state.c2Response);
    // });

    // describe('B', () => {
    //   (new B({
    //     state, flow, logger,
    //   }))
    //     .beforeSetup()
    //     .successChecks()
    //     .validationTests();

    //   itShouldCalculateTaxCorrectly(() => state.bResponse);
    // });
  };
  return runTestsFn;
}

module.exports = {
  grossTest,
};
