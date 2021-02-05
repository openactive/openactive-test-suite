/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-url'));

const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-pass-image',
  testFeatureImplemented: true,
  testIdentifier: 'access-pass-image',
  testName: 'Successful booking with access pass image.',
  testDescription: 'Access pass image returned for B request.',
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

    // TODO: refactor to check every element.
    it('Response should include accessPass array with url field that includes the `https` protocol', () => {
      // @ts-expect-error chai-arrays doesn't have a types package
      chai.expect(state.bResponse.body.orderedItem).to.be.array();

      state.bResponse.body.orderedItem.forEach((orderItem, orderItemIndex) => {
        // @ts-expect-error chai-arrays doesn't have a types package
        chai.expect(orderItem.accessPass).to.be.array();

        orderItem.accessPass.forEach((accessPass, accessPassIndex) => {
          // @ts-expect-error chai-url doesn't have a types package
          chai.expect(state.bResponse.body).to.have.nested.property(`orderedItem[${orderItemIndex}].accessPass[${accessPassIndex}].url`).that.has.protocol('https');
        });
      });
    });
  });
});
