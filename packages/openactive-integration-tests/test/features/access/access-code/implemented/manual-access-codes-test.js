/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai'); // The latest version for new features than chakram includes
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-code',
  testFeatureImplemented: true,
  testIdentifier: 'manual-access-codes',
  testName: 'Successful booking with access codes.',
  testDescription: 'Access codes returned for B request.',
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

    it('Response should include accessCode with description and name', () => {
      chakram.expect(state.bResponse).to.have.schema('orderedItem[0].accessCode[0].description', {
        type: 'string',
      });
      chakram.expect(state.bResponse).to.have.schema('orderedItem[0].accessCode[0].name', {
        type: 'string',
      });
    });
  });
});
