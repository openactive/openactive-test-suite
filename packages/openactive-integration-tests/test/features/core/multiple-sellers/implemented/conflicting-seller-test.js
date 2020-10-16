/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai'); // The latest version for new features than chakram includes
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'multiple-sellers',
  testFeatureImplemented: true,
  testIdentifier: 'conflicting-seller',
  testName: 'SellerMismatchError for inconsistent Sellers of OrderItems',
  testDescription: 'Runs C1, C2 and B where Sellers of OrderItems do not match and check SellerMismatchError is returned in all cases.',
  singleOpportunityCriteriaTemplate: opportunityType => [
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookableFree',
      seller: 'primary',
    },
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookableFree',
      seller: 'secondary',
    },
  ],
  skipMultiple: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.fetchOpportunities(orderItemCriteria);

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

  const shouldReturnSellerMismatchError = (stage, responseAccessor) => {
    it('should return 500', () => {
      stage.expectResponseReceived();
      expect(responseAccessor()).to.have.status(500);
    });

    it('Should return a SellerMismatchError', () => {
      stage.expectResponseReceived();
      expect(responseAccessor()).to.have.json(
        '@type',
        'SellerMismatchError',
      );
    });
  };

  describe('C1', function () {
    const c1 = (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    shouldReturnSellerMismatchError(c1, () => state.c1Response);
  });

  describe('C2', function () {
    const c2 = (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    shouldReturnSellerMismatchError(c2, () => state.c2Response);
  });

  describe('B', function () {
    const b = (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    shouldReturnSellerMismatchError(b, () => state.bResponse);
  });
});
