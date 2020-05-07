/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { C1 } = require('../../../../shared-behaviours/c1');
const { C2 } = require('../../../../shared-behaviours/c2');
const { B } = require('../../../../shared-behaviours/b');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature({
  testCategory: 'payment',
  testFeature: 'simple-book-with-payment',
  testFeatureImplemented: true,
  testName: 'with-payment-property',
  testDescription: 'A successful end to end booking with the `payment` property included.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.createOpportunity(orderItemCriteria);
    await flow.getMatch();

    return chakram.wait();
  });

  afterAll(async function () {
    await state.deleteOrder();
    return chakram.wait();
  });

  describe('C1', function () {
    (new C1({
      state, flow, logger, configuration,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C2', function () {
    (new C2({
      state, flow, logger, configuration,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('B', function () {
    (new B({
      state, flow, logger, configuration,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });
});
