const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'not-found',
  testName: 'Expect a NotFoundError for Orders that do not exist',
  testDescription: 'Runs Order Cancellation for an non-existent Order (with a fictional UUID), expecting an NotFoundError error to be returned',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state) => {
  describe('Delete Order', () => {
    it('should return a NotFoundError', async () => {
      const deleteOrderResponse = await state.deleteOrder();
      expect(deleteOrderResponse.response).to.have.property('statusCode', 404);
      expect(deleteOrderResponse.body).to.have.property('@type', 'NotFoundError');
      expect(deleteOrderResponse.body).to.have.property('@context');
    });
  });
  // OrderStatus is a recommended - but not required endpoint. So, we do not test this in core.
});
