const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2 } = require('../../../../shared-behaviours');
const { RequestState } = require('../../../../helpers/request-state');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'unknown-order',
  testName: 'Expect a UnknownOrderError for an Order that does not exist',
  testDescription: 'Runs Order Cancellation for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  describe('Cancel Order', () => {
    it('should return a UnknownOrderError', async () => {
      const state = new RequestState(logger, { uReqTemplateRef: 'nonExistantOrder' });
      const statePostCancellation = await state.cancelOrder();
      const cancelOrderResponse = statePostCancellation.uResponse;
      expect(cancelOrderResponse.response).to.have.property('statusCode', 404);
      expect(cancelOrderResponse.body).to.have.property('@type', 'UnknownOrderError');
      expect(cancelOrderResponse.body).to.have.property('@context');
    });
  });
});
