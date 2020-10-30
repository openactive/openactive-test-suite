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
  testIdentifier: 'seller-terms-of-service',
  testName: 'Terms of service defined by seller in opportunity feed, C1, C2 and B',
  testDescription: 'Terms of service defined by seller reflected in seller fields in opportunity feed, C1, C2 and B',
  // The primary opportunity criteria to use for the primary OrderItem under test
  // TODO: TestOpportunityBookableSellerTermsOfService?
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  // TODO: TestOpportunityBookableSellerTermsOfService?
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);

  describe('Terms of service should be part of seller in all stages', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities, () => {
      it('Should contain terms of service in provider/organizer in OrderItem in Opportunity feed', () => {
        fetchOpportunities.getOutput().orderItems.forEach((orderItem) => {
          let termsOfServiceArray;
          if (orderItem.orderedItem['@type'] === 'ScheduledSession') {
            // @ts-expect-error chai-arrays doesn't have a types package
            chai.expect(orderItem.orderedItem.superEvent.organizer.termsOfService).to.be.array();
            termsOfServiceArray = orderItem.orderedItem.superEvent.organizer.termsOfService;
          }
          if (orderItem.orderedItem['@type'] === 'Slot') {
            // @ts-expect-error chai-arrays doesn't have a types package
            chai.expect(orderItem.orderedItem.facilityUse.provider.termsOfService).to.be.array();
            termsOfServiceArray = orderItem.orderedItem.facilityUse.provider.termsOfService;
          }

          termsOfServiceArray.forEach((termOfService) => {
            // @ts-expect-error chai-arrays doesn't have a types package
            chai.expect(termOfService.url).that.has.protocol('https');
            chai.expect(termOfService['@type'] === 'PrivacyPolicy');
          });
        });
      });
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
      it('Should contain terms of service array in seller in C1 response', () => {
        c1.getOutput().httpResponse.body.seller.termsOfService.forEach((termOfService) => {
          // @ts-expect-error chai-arrays doesn't have a types package
          chai.expect(termOfService.url).that.has.protocol('https');
          chai.expect(termOfService['@type'] === 'PrivacyPolicy');
        });
      });
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      it('Should contain terms of service array in seller in C2 response', () => {
        c2.getOutput().httpResponse.body.seller.termsOfService.forEach((termOfService) => {
          // @ts-expect-error chai-arrays doesn't have a types package
          chai.expect(termOfService.url).that.has.protocol('https');
          chai.expect(termOfService['@type'] === 'PrivacyPolicy');
        });
      });
    });
    FlowStageUtils.describeRunAndCheckIsValid(b, () => {
      it('Should contain terms of service array in seller in B response', () => {
        b.getOutput().httpResponse.body.seller.termsOfService.forEach((termOfService) => {
          // @ts-expect-error chai-arrays doesn't have a types package
          chai.expect(termOfService.url).that.has.protocol('https');
          chai.expect(termOfService['@type'] === 'PrivacyPolicy');
        });
      });
    });
  });
});
