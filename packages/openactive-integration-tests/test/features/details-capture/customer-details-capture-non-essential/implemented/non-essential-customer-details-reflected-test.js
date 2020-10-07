/* eslint-disable no-unused-vars */
const chai = require('chai');
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'customer-details-capture-non-essential',
  testFeatureImplemented: true,
  testIdentifier: 'non-essential-customer-details-reflected',
  testName: 'C1, C2 and B givenName, familyName, and telephone number are reflected back',
  testDescription: 'Forename, surname, and telephone number from the Customer supplied by Broker should be reflected back by booking system.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  describe('Non Essential Customer details reflected back at B', () => {
    beforeAll(async function () {
      await state.fetchOpportunities(orderItemCriteria);
      return chakram.wait();
    });

    afterAll(async function () {
      await state.deleteOrder();
      return chakram.wait();
    });

    describe('Get Opportunity Feed Items', () => {
      (new GetMatch({
        state, flow, logger, orderItemCriteria,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe('C1', () => {
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
        .itResponseReceived()
        .validationTests();

      it('should return 200, with an Expected customer details', () => {
        chai.expect(state.bResponse.response.statusCode).to.equal(200);
        chai.expect(state.bResponse.body.customer.telephone).to.equal('020 811 8055');
        chai.expect(state.bResponse.body.customer.givenName).to.equal('Geoff');
        chai.expect(state.bResponse.body.customer.familyName).to.equal('Capes');
      });
    });
  });
});
