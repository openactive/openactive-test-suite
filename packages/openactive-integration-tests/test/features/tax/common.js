const config = require('config')
const { expect } = require('chai');
const { FlowStageRecipes, FlowStageUtils } = require('../../helpers/flow-stages');
const SELLER_CONFIG = config.get('sellers');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldCalculateGrossTaxCorrectly(responseAccessor) {
  it('should calculate gross tax correctly', () => {
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
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldCalculateNetTaxCorrectly(responseAccessor) {
  it('should calculate net tax correctly', () => {
    const { body } = responseAccessor();

    // const totalPaymentTax = body.totalPaymentTax.map(t => t.price).reduce((a, b) => a + b);
    // const unitTaxSpecification = body.orderedItem.flatMap(o => o.unitTaxSpecification).map(t => t.price).reduce((a, b) => a + b);

    // const totalPaymentDue = body.totalPaymentDue.price;
    // const acceptedOfferPrice = body.orderedItem.flatMap(o => o.acceptedOffer).map(t => t.price).reduce((a, b) => a + b);

    expect(body.taxCalculationExcluded).to.equal(undefined);
    // expect(Math.abs(unitTaxSpecification - totalPaymentTax)).to.be.lessThan(1);
    // expect(Math.abs(totalPaymentDue - acceptedOfferPrice)).to.be.lessThan(1); // rounding errors
  });
}

function grossTest(options) {
  return (configuration, orderItemCriteria, featureIsImplemented, logger, state) => {
    // ## Init Flow Stages
    const { b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(
      orderItemCriteria,
      logger,
      { ...options, sellerId: SELLER_CONFIG.primary['@id'] },
    );

    beforeAll(async () => {
      await state.fetchOpportunities(orderItemCriteria, undefined, 'https://openactive.io/TaxGross');
    });

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b, () => {
      itShouldCalculateGrossTaxCorrectly(() => b.getOutput().httpResponse);
    });
  };
}

function netTest(options) {
  return (configuration, orderItemCriteria, featureIsImplemented, logger, state) => {
    // ## Init Flow Stages
    const { b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(
      orderItemCriteria,
      logger,
      { ...options, sellerId: SELLER_CONFIG.secondary['@id'] },
    );

    beforeAll(async () => {
      await state.fetchOpportunities(orderItemCriteria, undefined, 'https://openactive.io/TaxNet');
    });

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b, () => {
      itShouldCalculateNetTaxCorrectly(() => b.getOutput().httpResponse);
    });
  };
}

module.exports = {
  grossTest,
  netTest,
};
