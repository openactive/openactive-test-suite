const chai = require('chai');
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { Common } = require('../../../../shared-behaviours/common');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {C1|C2} stage
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(orderItemCriteria, state, stage, responseAccessor) {
  it('should return 409', () => {
    stage.expectResponseReceived();
    chakram.expect(responseAccessor()).to.have.status(409);
  });

  Common.itForOrderItemByControl(orderItemCriteria, state, stage, () => responseAccessor().body,
    'should include an OpportunityOfferPairNotBookableError',
    (feedOrderItem, responseOrderItem, responseOrderItemErrorTypes) => {
      chai.expect(responseOrderItemErrorTypes).to.include('OpportunityOfferPairNotBookableError');
    },
    'should not include an OpportunityOfferPairNotBookableError',
    (feedOrderItem, responseOrderItem, responseOrderItemErrorTypes) => {
      chai.expect(responseOrderItemErrorTypes).not.to.include('OpportunityOfferPairNotBookableError');
    });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'not-bookable',
  testName: 'Expect an OpportunityOfferPairNotBookableError when booking not bookable opportunity',
  testDescription: 'Runs C1, C2 and B for an opportunity that is not bookable, expecting an OpportunityOfferPairNotBookableError to be returned',
  // The primary opportunity criteria to use for the primary OrderItem under test
  // TODO Note:Should use opportunity criteria: TestOpportunityNotBookableViaAvailableChannel? but it didn't find anything there so I replicated similar to test: opportunity-outside-range-c1-c2 because they produce same error?
  testOpportunityCriteria: 'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  // The secondary opportunity criteria to use for multiple OrderItem tests
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
    const c1 = (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(orderItemCriteria, state, c1, () => state.c1Response);
  });

  describe('C2', () => {
    const c2 = (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    itShouldIncludeOpportunityOfferPairNotBookableErrorWhereRelevant(orderItemCriteria, state, c2, () => state.c2Response);
  });

  describe('B', () => {
    (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    itShouldReturnAnOpenBookingError('OpportunityOfferPairNotBookableError', 409, () => state.bResponse);
  });
});
