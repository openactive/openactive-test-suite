const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageUtils, FlowStageRecipes } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-pass-barcode-broker-provided',
  testFeatureImplemented: true,
  testIdentifier: 'access-barcode-broker',
  testName: 'Successful booking with access barcode from broker.',
  testDescription: 'Barcode access pass provided by broker returned in B response.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityOfflineBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: true,
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  /** @type {import('../../../../templates/b-req').AccessPassItem[]} */
  const accessPass = [{
    '@type': 'Barcode',
    url: 'https://fallback.image.example.com/9dpe8EZX',
    text: '0123456789',
  }];

  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
    accessPass,
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    it('should include the Barcode accessPass, with url and text, that was sent by the broker', () => {
      const orderItems = bookRecipe.b.getOutput().httpResponse.body.orderedItem;
      expect(orderItems).to.be.an('array')
        .that.has.lengthOf.above(0)
        .and.has.lengthOf(orderItemCriteriaList.length);

      for (const orderItem of orderItems) {
        // Virtual sessions do not have accessPasses so need to be filtered out
        if (!orderItem.accessChannel || orderItem.accessChannel['@type'] !== 'VirtualLocation') {
          expect(orderItem.accessPass).to.be.an('array')
            .that.has.lengthOf.above(0)
            .and.has.lengthOf.at.least(accessPass.length)
          // .deep.include.members is used rather than .deep.equals because the
          // OrderItem's .accessPass could include additional items, put on by the
          // Booking System (https://openactive.io/open-booking-api/EditorsDraft/#extension-point-for-barcode-based-access-control)
            .and.to.deep.include.members(accessPass);
        }
      }
    });
  });
});
