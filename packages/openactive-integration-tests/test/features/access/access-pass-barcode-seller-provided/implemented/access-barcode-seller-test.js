/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { expect } = require('chai');

const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-pass-barcode-seller-provided',
  testFeatureImplemented: true,
  testIdentifier: 'access-barcode-seller',
  testName: 'Successful booking with access barcode from seller.',
  testDescription: 'Access pass contains barcode returned for B request from seller.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
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

    it('Response should include Barcode accessPass with url, text and codeType field', () => {
      expect(state.bResponse.body.orderedItem).to.be.an('array')
        .that.has.lengthOf.above(0)
        .and.has.lengthOf(orderItemCriteria.length);

      for (const orderItem of state.bResponse.body.orderedItem) {
        // Virtual sessions do not have accessPasses so need to be filtered out
        if (!orderItem.accessChannel || orderItem.accessChannel['@type'] !== 'VirtualLocation') {
          expect(orderItem.accessPass).to.be.an('array');

          for (const anAccessPass of orderItem.accessPass) {
            // Both Image and Barcode contain url, but Barcode contains 2 more field.
            if (anAccessPass['@type'] === 'Barcode') {
              expect(anAccessPass.text).to.be.a('string');
              expect(anAccessPass['beta:codeType']).to.be.a('string');
            }
          }
        }
      }
    });
  });
});
