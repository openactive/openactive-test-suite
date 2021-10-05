const chai = require('chai');
chai.use(require('chai-url'));

const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-pass-image',
  testFeatureImplemented: true,
  testIdentifier: 'access-pass-image',
  testName: 'Successful booking with access pass image.',
  testDescription: 'Access pass image returned for B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityOfflineBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow2(orderItemCriteriaList, logger);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    it('Response should include accessPass array with url field that includes the `https` protocol', () => {
      const { orderedItem } = bookRecipe.b.getOutput().httpResponse.body;
      chai.expect(orderedItem).to.be.an('array')
        .that.has.lengthOf.above(0)
        .and.has.lengthOf(orderItemCriteriaList.length);

      for (const orderItem of orderedItem) {
        // Virtual sessions do not have accessPasses so need to be filtered out
        if (!orderItem.accessChannel || orderItem.accessChannel['@type'] !== 'VirtualLocation') {
          chai.expect(orderItem.accessPass).to.be.an('array');
          for (const anAccessPass of orderItem.accessPass) {
            // @ts-expect-error chai-url doesn't have a types package
            chai.expect(anAccessPass).to.have.property('url').that.has.protocol('https');
          }
        }
      }
    });
  });
});
