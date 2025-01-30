const chai = require('chai');
const chaiUrl = require('chai-url');

chai.use(chaiUrl);
const { expect } = chai;

/**
 * @param {unknown} termsOfService
 */
function expectTermsOfServiceToExistAndBeValid(termsOfService) {
  expect(termsOfService).to.be.an('array')
    .that.has.lengthOf.at.least(1);
  for (const termsOfServiceItem of /** @type {unknown[]} */(termsOfService)) {
    // The validator will ensure that the correct types are used in this array,
    // and that the correct required properties exist.
    // Hence we only need to sanity check for the existence of a single property.
    // @ts-expect-error chai-url doesn't have a types package
    expect(termsOfServiceItem).to.have.property('url').that.has.protocol('https');
  }
}

module.exports = {
  expectTermsOfServiceToExistAndBeValid,
};
