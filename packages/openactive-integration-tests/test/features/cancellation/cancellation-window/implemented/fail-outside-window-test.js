const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

const { expect } = chakram;

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'cancellation-window',
  testFeatureImplemented: true,
  testIdentifier: 'fail-outside-window',
  testName: 'Successful booking and failed cancellation outside window.',
  testDescription: 'A successful end to end booking, but cancellation fails outside the cancellation window.',
  testOpportunityCriteria: 'TestOpportunityBookableCancellableOutsideWindow',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.fetchOpportunities(orderItemCriteria);
  });

  afterAll(async function () {
    await state.cancelOrder();
  });

  describe('Get Opportunity Feed Items', function () {
    (new GetMatch({
      state, flow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C1', function () {
    (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C2', function () {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('B', function () {
    (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('Orders Feed', function () {
    beforeAll(async function () {
      await flow.U();
    });

    it('Order Cancellation return 400', function () {
      expect(state.uResponse).to.have.status(400);
    });

    it('should return a CancellationNotPermittedError', () => {
      const error = state.uResponse.body['@type'];
      expect(error).to.equal('CancellationNotPermittedError');
    });
  });
});
