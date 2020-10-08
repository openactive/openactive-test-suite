/* eslint-disable no-unused-vars */
const chai = require('chai');
const chakram = require('chakram');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'simple-book-with-payment',
  testFeatureImplemented: true,
  testIdentifier: 'b-without-payment-property',
  testName: 'Unsuccessful booking without payment property',
  testDescription: 'An unsuccessful end to end booking for a non-free opportunity, failing due to missing `payment` property.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  describe('Missing payment property at B', () => {
    const state = new RequestState(logger, { bReqTemplateRef: 'incorrectOrderDueToMissingPaymentProperty' });
    const flow = new FlowHelper(state);

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

      itShouldReturnAnOpenBookingError('MissingPaymentDetailsError', 400, () => state.bResponse);
    });
  });
});
