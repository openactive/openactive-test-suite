const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'customer-details-capture-non-essential',
  testFeatureImplemented: true,
  testIdentifier: 'non-essential-customer-details-reflected',
  testName: 'givenName, familyName, and telephone number are reflected back at C2 and B',
  testDescription: 'Forename, surname, and telephone number from the Customer supplied by Broker should be reflected back by booking system.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  // # Initialise Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  // # Set up Tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    it('should include expected customer details', () => {
      const apiResponseJson = c2.getStage('c2').getOutput().httpResponse.body;
      expect(apiResponseJson).to.have.nested.property('customer.email').that.match(new RegExp(defaultFlowStageParams.customer.email, 'i'));
      expect(apiResponseJson).to.have.nested.property('customer.telephone', defaultFlowStageParams.customer.telephone);
      expect(apiResponseJson).to.have.nested.property('customer.givenName', defaultFlowStageParams.customer.givenName);
      expect(apiResponseJson).to.have.nested.property('customer.familyName', defaultFlowStageParams.customer.familyName);
    });
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    it('should include expected customer details', () => {
      const apiResponseJson = bookRecipe.b.getOutput().httpResponse.body;
      expect(apiResponseJson).to.have.nested.property('customer.email').that.match(new RegExp(defaultFlowStageParams.customer.email, 'i'));
      expect(apiResponseJson).to.have.nested.property('customer.telephone', defaultFlowStageParams.customer.telephone);
      expect(apiResponseJson).to.have.nested.property('customer.givenName', defaultFlowStageParams.customer.givenName);
      expect(apiResponseJson).to.have.nested.property('customer.familyName', defaultFlowStageParams.customer.familyName);
    });
  });
});
