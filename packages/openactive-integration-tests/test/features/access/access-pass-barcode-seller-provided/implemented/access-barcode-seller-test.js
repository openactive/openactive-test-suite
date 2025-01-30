const { expect } = require('chai');

const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-pass-barcode-seller-provided',
  testFeatureImplemented: true,
  testIdentifier: 'access-barcode-seller',
  testName: 'Successful booking with access barcode from seller.',
  testDescription: 'Access pass contains barcode returned for B request from seller.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityOfflineBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) {
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, describeFeatureRecord);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    it('Response should include Barcode accessPass with url, text and codeType field', () => {
      const { orderedItem } = bookRecipe.b.getOutput().httpResponse.body;
      expect(orderedItem).to.be.an('array')
        .that.has.lengthOf.above(0)
        .and.has.lengthOf(orderItemCriteriaList.length);

      for (const orderItem of orderedItem) {
        // Virtual sessions do not have accessPasses so need to be filtered out
        if (!orderItem.accessChannel || orderItem.accessChannel['@type'] !== 'VirtualLocation') {
          expect(orderItem.accessPass).to.be.an('array');

          for (const anAccessPass of orderItem.accessPass) {
            // Both Image and Barcode contain url, but Barcode contains 2 more field.
            if (anAccessPass['@type'] === 'Barcode') {
              expect(anAccessPass.text).to.be.a('string');
              expect(anAccessPass['beta:codeType']).to.be.a('string');
            }
          }
        }
      }
    });
  });
});
