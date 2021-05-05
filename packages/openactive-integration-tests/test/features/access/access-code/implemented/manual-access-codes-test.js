const { expect } = require('chai'); // The latest version for new features than chakram includes
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-code',
  testFeatureImplemented: true,
  testIdentifier: 'manual-access-codes',
  testName: 'Successful booking with access codes.',
  testDescription: 'Access codes returned for B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityOfflineBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    it('Response should include accessCode array with appropriate fields (name and description) for each OrderItem', () => {
      const { orderedItem } = bookRecipe.b.getOutput().httpResponse.body;
      expect(orderedItem).to.be.an('array')
        .that.has.lengthOf.above(0)
        .and.has.lengthOf(orderItemCriteriaList.length);

      const physicalOrderItems = orderedItem.filter(orderItem => (
        !orderItem.accessChannel || orderItem.accessChannel['@type'] !== 'VirtualLocation'
      ));

      for (const orderItem of physicalOrderItems) {
        // Virtual sessions do not have accessPasses so need to be filtered out
        if (!orderItem.accessChannel || orderItem.accessChannel['@type'] !== 'VirtualLocation') {
          expect(orderItem.accessCode).to.be.an('array');
          for (const anAccessCode of orderItem.accessCode) {
            expect(anAccessCode).to.have.nested.property('name').that.is.a('string');
            expect(anAccessCode).to.have.nested.property('description').that.is.a('string');
          }
        }
      }
    });
  });
});
