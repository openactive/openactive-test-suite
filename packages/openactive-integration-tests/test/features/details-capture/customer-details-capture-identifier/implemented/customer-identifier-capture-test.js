const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'customer-details-capture-identifier',
  testFeatureImplemented: true,
  testIdentifier: 'customer-identifier-capture',
  testName: 'Customer identifier is reflected back at C2 and B',
  testDescription: 'Identifier from the Customer supplied by Broker should be reflected back by booking system.',
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
    it('should include expected Customer identifier', () => {
      // CustomerIdentifierC2 is set in the standard C2 request template.
      expect(c2.getStage('c2').getOutput().httpResponse.body.customer.identifier).to.equal(defaultFlowStageParams.customer.identifier);
    });
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    it('should include expected Customer identifier', () => {
      // CustomerIdentifierB is set in the standard B request template.
      expect(bookRecipe.b.getOutput().httpResponse.body.customer.identifier).to.equal(defaultFlowStageParams.customer.identifier);
    });
  });
});
