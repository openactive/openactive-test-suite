const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'order-deletion',
  testFeatureImplemented: true,
  testIdentifier: 'unknown-order',
  testName: 'Expect a UnknownOrderError for an Order that does not exist',
  testDescription: 'Runs Order Deletion for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state) => {
  beforeAll(async () => {
    await state.deleteOrder();
  });

  describe('Delete Order', () => {
    itShouldReturnAnOpenBookingError('UnknownOrderError', 404, () => state.deletionResponse);
  });
});
