/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
chai.use(require('chai-arrays'));

const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-pass-barcode-broker-provided',
  testFeatureImplemented: true,
  testIdentifier: 'access-barcode-broker',
  testName: 'Successful booking with access barcode from broker.',
  testDescription: 'Barcode access pass provided by broker returned in B response.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  // TODO: create B requeust with access pass, so that we don't include access pass in rest of the B requests.
  // const state = new RequestState(logger, { bReqTemplateRef: 'withBarcodeAccessCode' });
  // const flow = new FlowHelper(state);

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

    // TODO: refactor to check every element.
    it('Response should include Barcode accessPass with url and text sent by the broker', () => {
      // @ts-expect-error chai-arrays doesn't have a types package
      chai.expect(state.bResponse.body.orderedItem).to.be.array();

      state.bResponse.body.orderedItem.forEach((orderItem, orderItemIndex) => {
        // @ts-expect-error chai-arrays doesn't have a types package
        chai.expect(orderItem.accessPass).to.be.array();

        orderItem.accessPass.forEach((accessPass, accessPassIndex) => {
          // Both Image and Barcode contain url, but Barcode contains 2 more field.
          chai.expect(state.bResponse.body).to.have.nested.property(`orderedItem[${orderItemIndex}].accessPass[${accessPassIndex}].url`).that.is.a('string');

          if (accessPass['@type'] === 'Barcode') {
            chai.expect(state.bResponse.body).to.have.nested.property(`orderedItem[${orderItemIndex}].accessPass[${accessPassIndex}].text`).that.is.a('string');
            chai.expect(state.bResponse.body).to.have.nested.property(`orderedItem[${orderItemIndex}].accessPass[${accessPassIndex}].beta:codeType`).that.is.a('string');

            chai.expect(state.bResponse.body.orderedItem[orderItemIndex].accessPass[accessPassIndex].text).to.equal('https://urlFromBroker.com');

            // Currently unable to pass text field in request, so for now just checking url.
            // chai.expect(state.bResponse.body.orderedItem[orderItemIndex].accessPass[accessPassIndex].url).to.equal('0123456789');
          }
        });
      });
    });
  });
});
