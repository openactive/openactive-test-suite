const chai = require('chai');
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2 } = require('../../../../shared-behaviours');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {C1|C2} stage
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldReturn409Conflict(stage, responseAccessor) {
  it('should return 409', () => {
    stage.expectResponseReceived();
    chakram.expect(responseAccessor()).to.have.status(409);
  });
}

/**
 * @param {C1|C2} stage
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldReturnOpportunityOfferPairNotBookableError(stage, responseAccessor) {
  it('should return OpportunityOfferPairNotBookableError', () => {
    stage.expectResponseReceived();

    const response = responseAccessor();
    const errors = response.body.orderedItem.map(oi => oi.error && oi.error[0] && oi.error[0]['@type']).filter(e => !!e);

    chai.expect(errors.every(e => e === 'OpportunityOfferPairNotBookableError')).to.equal(true);
  });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'restrictions',
  testFeature: 'booking-window',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-outside-range-c1-c2',
  testName: 'Running C1 and C2 for opportunity outside range should fail',
  testDescription: 'Booking an opportunity outside the specified booking window',
  testOpportunityCriteria: 'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
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
    (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C2', () => {
    const c2 = (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    itShouldReturn409Conflict(c2, () => state.c2Response);
    itShouldReturnOpportunityOfferPairNotBookableError(c2, () => state.c2Response);
  });
});
