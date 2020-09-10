const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'unknown-order',
  testName: 'Expect a UnknownOrderError for an Order that does not exist',
  testDescription: 'Runs Order Cancellation for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  describe('Cancel Order', () => {
    it('should return a UnknownOrderError', async () => {
      // Get Opportunity Feed Items that match criteria specified in describeFeature()
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

      const statePostCancellation = await state.cancelOrder();
      const cancelOrderResponse = statePostCancellation.uResponse;
      expect(cancelOrderResponse.response).to.have.property('statusCode', 404);
      expect(cancelOrderResponse.body).to.have.property('@type', 'UnknownOrderError');
      expect(cancelOrderResponse.body).to.have.property('@context');
    });
  });
});
