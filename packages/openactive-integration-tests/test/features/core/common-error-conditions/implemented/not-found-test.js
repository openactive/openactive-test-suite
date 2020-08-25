const { expect } = require('chai');
const _ = require('lodash');
const { FeatureHelper } = require('../../../../helpers/feature-helper');

/**
 * Normalize an OpenActive object's @id/id and @type/type fields.
 *
 * The response will only have @id and @type fields.
 *
 * @param {unknown} oaObject
 */
function normalizeAtFields(oaObject) {
  if (Array.isArray(oaObject)) {
    return oaObject.map(item => normalizeAtFields(item));
  }
  if (_.isPlainObject(oaObject)) {
    const newObject = {};
    for (const [key, value] of Object.entries(oaObject)) {
      const normalizedKey = (key === 'id' || key === 'type')
        ? `@${key}`
        : key;
      const normalizedValue = normalizeAtFields(value);
      newObject[normalizedKey] = normalizedValue;
    }
    return newObject;
  }
  return oaObject;
}

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
      const normalizedBody = normalizeAtFields(deleteOrderResponse.body);
      expect(normalizedBody).to.have.property('@type', 'NotFoundError');
      expect(normalizedBody).to.have.property('@context');
    });
  });
  // OrderStatus is a recommended - but not required endpoint. So, we do not test this in core.
});
