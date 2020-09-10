const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'order-deletion',
  testFeatureImplemented: true,
  testIdentifier: 'unknown-order',
  testName: 'Expect a UnknownOrderError for an Order that does not exist',
  testDescription: 'Runs Order Deletion for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state) => {
  describe('Delete Order', () => {
    it('should return a UnknownOrderError', async () => {
      const statePostDeletion = await state.deleteOrder();
      const deleteOrderResponse = statePostDeletion.deletionResponse;
      expect(deleteOrderResponse.response).to.have.property('statusCode', 404);
      expect(deleteOrderResponse.body).to.have.property('@type', 'UnknownOrderError');
      expect(deleteOrderResponse.body).to.have.property('@context');
    });
  });
});
