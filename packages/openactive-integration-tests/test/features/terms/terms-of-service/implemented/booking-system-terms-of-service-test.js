const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
chai.use(require('chai-url'));

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} getHttpResponse
 */
function itShouldValidContainTermsOfService(getHttpResponse) {
  it('Should contain terms of service array in bookingService in response', () => {
    const { termsOfService } = getHttpResponse().body.bookingService;
    chai.expect(termsOfService).to.be.an('array')
      .that.has.lengthOf.at.least(1);
    for (const termsOfServiceItem of termsOfService) {
      // @ts-expect-error chai-url doesn't have a types package
      chai.expect(termsOfServiceItem.url).that.has.protocol('https');
      chai.expect(termsOfServiceItem['@type'] === 'PrivacyPolicy');
    }
  });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'terms',
  testFeature: 'terms-of-service',
  testFeatureImplemented: true,
  testIdentifier: 'booking-system-terms-of-service',
  testName: 'Terms of service defined by bookingService in  C1, C2 and B',
  testDescription: 'Terms of service defined by bookingService reflected in bookingService fields in  C1, C2 and B',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);

  describe('Terms of service should be part of bookingService in all stages', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
      itShouldValidContainTermsOfService(() => c1.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      itShouldValidContainTermsOfService(() => c2.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b, () => {
      itShouldValidContainTermsOfService(() => b.getOutput().httpResponse);
    });
  });
});
