const chakram = require('chakram');
const { expect } = require('chai');
const { FlowHelper } = require('../../../helpers/flow-helper');
const { RequestState } = require('../../../helpers/request-state');
const { GetMatch, C1, C2, B } = require('../../../shared-behaviours');

function notImplementedTest(stateFn = null, flowFn = null) {
  return (configuration, orderItemCriteria, featureIsImplemented, logger, parentState, parentFlow) => {
    const state = stateFn ? stateFn(logger) : parentState;
    const flow = flowFn ? flowFn(state) : parentFlow;

    beforeAll(async () => {
      await state.fetchOpportunities(orderItemCriteria);
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

    describe('C2', () => {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe('B', () => {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });
  };
}

function invalidDetailsTest(bReqTemplateRef) {
  return (configuration, orderItemCriteria, featureIsImplemented, logger) => {
    const state = new RequestState(logger, { bReqTemplateRef });
    const flow = new FlowHelper(state);

    beforeAll(async () => {
      await state.fetchOpportunities(orderItemCriteria);
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

    describe('C2', () => {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe('B', () => {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();

      it('should return 400', () => {
        chakram.expect(state.bResponse).to.have.status(400);
      });

      it('should return an InvalidPaymentDetailsError', () => {
        expect(state.bResponse.body['@type']).to.equal('InvalidPaymentDetailsError');
      });
    });
  };
}

module.exports = {
  invalidDetailsTest,
  notImplementedTest,
};
