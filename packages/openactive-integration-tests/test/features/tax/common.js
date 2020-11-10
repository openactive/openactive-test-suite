const { expect } = require('chai');
const { map, pipe, prop, sum } = require('ramda');
const { FlowStageRecipes, FlowStageUtils } = require('../../helpers/flow-stages');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../helpers/flow-stages/flow-stage-recipes').InitialiseSimpleC1C2BFlowOptions} InitialiseSimpleC1C2BFlowOptions
 */

/**
 * @param {number} x
 * @param {number} y
 * @param {number} [range] The amount by which two numbers can differ.
 *   Included to account for rounding issues.
 */
function expectNumbersToBeSimilar(x, y, range = 1) {
  expect(Math.abs(x - y)).to.be.lessThan(range);
}

/**
 * @param {{
 *   price: number,
 *   [k: string]: unknown,
 * }[]} objsWithPriceProperty
 */
function sumPrices(objsWithPriceProperty) {
  return sum(objsWithPriceProperty.map(o => o.price));
}

/**
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldCalculateGrossTaxCorrectly(responseAccessor) {
  it('should calculate gross tax correctly', () => {
    const { body } = responseAccessor();

    const totalPaymentTax = sumPrices(body.totalPaymentTax);
    const totalUnitTaxSpecification = sumPrices(body.orderedItem.flatMap(o => o.unitTaxSpecification));

    const totalPaymentDue = body.totalPaymentDue.price;
    const totalAcceptedOfferPrice = sumPrices(body.orderedItem.flatMap(o => o.acceptedOffer));

    // taxCalculationExcluded cannot be true as brokerRole is not ResellerBroker
    // (check the assertions in netTest() and grossTest())
    expect(body.taxCalculationExcluded).to.not.equal(true);
    // Does the total tax match the sum of taxes for each item?
    expectNumbersToBeSimilar(totalUnitTaxSpecification, totalPaymentTax);
    // Does the total price match the sum of prices of each item?
    // Note: In gross taxMode, we cannot check that the tax amount was included in the
    // calculation because the tax amount is included in the individual offer prices
    // (https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#tax-mode)
    expectNumbersToBeSimilar(totalPaymentDue, totalAcceptedOfferPrice);
  });
}

/**
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldCalculateNetTaxCorrectly(responseAccessor) {
  it('should calculate net tax correctly', () => {
    const { body } = responseAccessor();

    const totalPaymentTax = sumPrices(body.totalPaymentTax);
    const totalUnitTaxSpecification = sumPrices(body.orderedItem.flatMap(o => o.unitTaxSpecification));

    const totalPaymentDue = body.totalPaymentDue.price;
    const totalAcceptedOfferPrice = sumPrices(body.orderedItem.flatMap(o => o.acceptedOffer));

    // taxCalculationExcluded cannot be true as brokerRole is not ResellerBroker
    // (check the assertions in netTest() and grossTest())
    expect(body.taxCalculationExcluded).to.not.equal(true);
    // Does the total tax match the sum of taxes for each item?
    expectNumbersToBeSimilar(totalUnitTaxSpecification, totalPaymentTax);
    // Does the total payment due include the prices and the taxes combined?
    expectNumbersToBeSimilar(totalPaymentDue, totalAcceptedOfferPrice + totalUnitTaxSpecification);
  });
}

/**
 * Note: This only works for brokerRole =/= ResellerBroker. This is because if
 * brokerRole = ResellerBroker, tax calculations can be excluded by the broker
 * (https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#business-to-business-tax-calculation-by-booking-system-is-optional).
 *
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
      itShouldCalculateGrossTaxCorrectly(() => c1.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      itShouldCalculateGrossTaxCorrectly(() => c2.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b, () => {
      itShouldCalculateGrossTaxCorrectly(() => b.getOutput().httpResponse);
    });
  };
  return runTestsFn;
}

/**
 * Note: This only works for brokerRole =/= ResellerBroker. This is because if
 * brokerRole = ResellerBroker, tax calculations can be excluded by the broker
 * (https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#business-to-business-tax-calculation-by-booking-system-is-optional).
 *
 * @param {Omit<InitialiseSimpleC1C2BFlowOptions, 'taxMode'>} [options]
 */
function netTest(options) {
  /** @type {import('../../helpers/feature-helper').RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    // ## Init Flow Stages
    const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(
      orderItemCriteriaList,
      logger,
      { ...options, taxMode: 'https://openactive.io/TaxNet' },
    );

    // ## Run Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
      itShouldCalculateNetTaxCorrectly(() => c1.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      itShouldCalculateNetTaxCorrectly(() => c2.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b, () => {
      itShouldCalculateNetTaxCorrectly(() => b.getOutput().httpResponse);
    });
  };
  return runTestsFn;
}

module.exports = {
  grossTest,
  netTest,
};
