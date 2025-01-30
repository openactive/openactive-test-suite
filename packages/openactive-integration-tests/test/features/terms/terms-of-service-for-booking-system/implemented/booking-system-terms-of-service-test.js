const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { expectTermsOfServiceToExistAndBeValid } = require('../../common');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} getHttpResponse
 */
function itShouldContainBookingServiceWithValidTermsOfService(getHttpResponse) {
  it('Should contain terms of service array in bookingService in response', () => {
    const { termsOfService } = getHttpResponse().body.bookingService;
    expectTermsOfServiceToExistAndBeValid(termsOfService);
  });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'terms',
  testFeature: 'terms-of-service-for-booking-system',
  testFeatureImplemented: true,
  testIdentifier: 'booking-system-terms-of-service',
  testName: 'Terms of service defined by bookingService in  C1, C2 and B',
  testDescription: 'Terms of service defined by bookingService reflected in bookingService fields in  C1, C2 and B',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) {
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, describeFeatureRecord);

  describe('Terms of service should be part of bookingService in all stages', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
      itShouldContainBookingServiceWithValidTermsOfService(() => c1.getStage('c1').getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      itShouldContainBookingServiceWithValidTermsOfService(() => c2.getStage('c2').getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
      itShouldContainBookingServiceWithValidTermsOfService(() => bookRecipe.b.getOutput().httpResponse);
    });
  });
});
