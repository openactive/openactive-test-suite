/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B, Common } = require('../../../../shared-behaviours');
const sharedValidationTests = require('../../../../shared-behaviours/validation');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'cancellation-window',
  testFeatureImplemented: true,
  testIdentifier: 'cancellation-outside-window',
  testName: 'Successful cancellation on time window.',
  testDescription: 'A successful end to end booking including cancellation within window, including checking the Orders Feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableCancellableOutsideWindow',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipMultiple: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.fetchOpportunities(orderItemCriteria);
    return chakram.wait();
  });

  afterAll(async function () {
    await state.deleteOrder();
    return chakram.wait();
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
      await flow.getFeedUpdate();
    });

    it(`Orders feed result should have ${orderItemCriteria.length} orderedItem(s)`, function () {
      expect(state.ordersFeedUpdate).to.have.schema('data.orderedItem', {
        minItems: orderItemCriteria.length,
        maxItems: orderItemCriteria.length,
      });
    });

    it('Order Cancellation return 400 on success', function () {
      expect(state.uResponse).to.have.status(400);
    });

    it(`Orders feed result should have ${orderItemCriteria.length} orderedItem(s)`, function () {
      expect(state.ordersFeedUpdate).to.have.schema('data.orderedItem', {
        minItems: orderItemCriteria.length,
        maxItems: orderItemCriteria.length,
      });
    });

    sharedValidationTests.shouldBeValidResponse(() => state.ordersFeedUpdate, 'Orders feed', logger, {
      validationMode: 'OrdersFeed',
    });
  });
});
