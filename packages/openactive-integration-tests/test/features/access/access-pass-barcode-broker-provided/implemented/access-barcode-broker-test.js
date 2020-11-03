const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const { FlowStageUtils, FetchOpportunitiesFlowStage, C1FlowStage, C2FlowStage, BFlowStage } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-pass-barcode-broker-provided',
  testFeatureImplemented: true,
  testIdentifier: 'access-barcode-broker',
  testName: 'Successful booking with access barcode from broker.',
  testDescription: 'Barcode access pass provided by broker returned in B response.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  const requestHelper = new RequestHelper(logger);

  /** @type {import('../../../../templates/b-req').AccessPassItem[]} */
  const accessPass = [{
    '@type': 'Barcode',
    url: 'https://fallback.image.example.com/9dpe8EZX',
    text: '0123456789',
  }];

  // ## Initiate Flow Stages
  const defaultFlowStageParams = FlowStageUtils.createDefaultFlowStageParams({ requestHelper, logger });
  const fetchOpportunities = new FetchOpportunitiesFlowStage({
    ...defaultFlowStageParams,
    orderItemCriteriaList,
  });
  const c1 = new C1FlowStage({
    ...defaultFlowStageParams,
    prerequisite: fetchOpportunities,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
    }),
  });
  const c2 = new C2FlowStage({
    ...defaultFlowStageParams,
    prerequisite: c1,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
    }),
  });
  const b = new BFlowStage({
    ...defaultFlowStageParams,
    accessPass,
    prerequisite: c2,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getOutput().totalPaymentDue,
      prepayment: c2.getOutput().prepayment,
    }),
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b, () => {
    it('should include the Barcode accessPass, with url and text, that was sent by the broker', () => {
      const orderItems = b.getOutput().httpResponse.body.orderedItem;
      expect(orderItems).to.be.an('array')
        .that.has.lengthOf.above(0)
        .and.has.lengthOf(orderItemCriteriaList.length);

      for (const orderItem of orderItems) {
        expect(orderItem.accessPass).to.be.an('array')
          .that.has.lengthOf.above(0)
          .and.has.lengthOf.at.least(accessPass.length)
          // .deep.include.members is used rather than .deep.equals because the
          // OrderItem's .accessPass could include additional items, put on by the
          // Booking System (https://openactive.io/open-booking-api/EditorsDraft/#extension-point-for-barcode-based-access-control)
          .and.to.deep.include.members(accessPass);
      }
    });
  });
});
