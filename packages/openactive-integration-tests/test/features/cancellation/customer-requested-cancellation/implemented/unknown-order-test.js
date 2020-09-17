const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');
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
  describe('UnknownOrderError for Customer Requested Cancellation', () => {
    const state = new RequestState(logger, { uReqTemplateRef: 'nonExistantOrder' });
    beforeAll(async () => {
      await state.cancelOrder();
    });

    itShouldReturnAnOpenBookingError('UnknownOrderError', 404, () => state.uResponse);
  });
});
