const { utils: { getOrganizerOrProvider } } = require('@openactive/test-interface-criteria');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { expectTermsOfServiceToExistAndBeValid } = require('../common');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} getHttpResponse
 */
function itShouldContainSellerWithValidTermsOfService(getHttpResponse) {
  it('Should contain terms of service array in seller in response', () => {
    const { termsOfService } = getHttpResponse().body.seller;
    expectTermsOfServiceToExistAndBeValid(termsOfService);
  });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'terms',
  testFeature: 'terms-of-service',
  testFeatureImplemented: true,
  testIdentifier: 'seller-terms-of-service',
  testName: 'Terms of service defined by seller in opportunity feed, C1, C2 and B',
  testDescription: 'Terms of service defined by seller reflected in seller fields in opportunity feed, C1, C2 and B',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableSellerTermsOfService',
  // Orders cannot contain OrderItems from different sellers, so there can be no OrderItems
  // that don't satisfy this criteria, which constraints the seller.
  controlOpportunityCriteria: 'TestOpportunityBookableSellerTermsOfService',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);

  describe('Terms of service should be part of seller in all stages', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities, () => {
      it('Should contain terms of service in provider/organizer in OrderItem in Opportunity feed', () => {
        for (const orderItem of fetchOpportunities.getOutput().orderItems) {
          const { termsOfService } = getOrganizerOrProvider(orderItem.orderedItem);
          expectTermsOfServiceToExistAndBeValid(termsOfService);
        }
      });
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
      itShouldContainSellerWithValidTermsOfService(() => c1.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
      itShouldContainSellerWithValidTermsOfService(() => c2.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsValid(b, () => {
      itShouldContainSellerWithValidTermsOfService(() => b.getOutput().httpResponse);
    });
  });
});
