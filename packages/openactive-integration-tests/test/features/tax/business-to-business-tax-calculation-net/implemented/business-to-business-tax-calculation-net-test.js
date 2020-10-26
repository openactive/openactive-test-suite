const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1 } = require('../../../../shared-behaviours');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldCalculateTaxCorrectly(responseAccessor) {
  it('should return lease with future expiry date', () => {
    const { body } = responseAccessor();
    const unitTaxSpecification = body.orderedItem.flatMap(o => o.unitTaxSpecification).map(t => t.price).reduce((a, b) => a + b);
    const totalPaymentTax = body.totalPaymentTax.map(t => t.price).reduce((a, b) => a + b);
    expect(Math.abs(unitTaxSpecification - totalPaymentTax)).to.be.lessThan(1);
  });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-business-tax-calculation-net',
  testFeatureImplemented: true,
  testIdentifier: 'tax-calculations',
  testName: 'Tax calculations',
  testDescription: 'The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price.',
  testOpportunityCriteria: 'TestOpportunityBookablePaidTaxNet',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  beforeAll(async () => {
    await state.fetchOpportunities(orderItemCriteria, undefined, 'https://openactive.io/TaxNet');
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
});
