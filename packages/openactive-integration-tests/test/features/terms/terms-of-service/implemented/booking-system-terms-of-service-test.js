/* eslint-disable no-unused-vars */
const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
chai.use(require('chai-arrays'));
chai.use(require('chai-url'));

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
      it('Should contain terms of service array in bookingService in C1 response', () => {
        c1.getOutput().httpResponse.body.bookingService.termsOfService.forEach((termOfService) => {
          // @ts-expect-error chai-arrays doesn't have a types package
          chai.expect(termOfService.url).that.has.protocol('https');
          chai.expect(termOfService['@type'] === 'PrivacyPolicy');
        });
      });
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      it('Should contain terms of service array in bookingService in C2 response', () => {
        c2.getOutput().httpResponse.body.bookingService.termsOfService.forEach((termOfService) => {
          // @ts-expect-error chai-arrays doesn't have a types package
          chai.expect(termOfService.url).that.has.protocol('https');
          chai.expect(termOfService['@type'] === 'PrivacyPolicy');
        });
      });
    });
    FlowStageUtils.describeRunAndCheckIsValid(b, () => {
      it('Should contain terms of service array in bookingService in B response', () => {
        b.getOutput().httpResponse.body.bookingService.termsOfService.forEach((termOfService) => {
          // @ts-expect-error chai-arrays doesn't have a types package
          chai.expect(termOfService.url).that.has.protocol('https');
          chai.expect(termOfService['@type'] === 'PrivacyPolicy');
        });
      });
    });
  });
});
