const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { runFlowStageAndExpectIncompleteBrokerDetailsError } = require('../../../../shared-behaviours/errors');

// /**
//  * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
//  * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
//  * @typedef {import('../../../../helpers/flow-stages/b').BFlowStageType} BFlowStageType
//  */

// /**
//  * @param {C1FlowStageType | C2FlowStageType | BFlowStageType} flowStage
//  */
// function runFlowStageAndExpectIncompleteBrokerDetailsError(flowStage) {
//   FlowStageUtils.describeRunAndCheckIsValid(flowStage, () => {
//     itShouldReturnAnOpenBookingError('IncompleteBrokerDetailsError', 400, () => flowStage.getOutput().httpResponse);
//   });
// }

FeatureHelper.describeFeature(module, {
  testCategory: 'broker-role',
  testFeature: 'no-broker',
  testFeatureImplemented: true,
  testIdentifier: 'broker-included-nobroker-mode',
  testName: 'Broker included in Order in NoBroker mode',
  testDescription: 'Request shoud fail if broker is included in Order in NoBroker mode for C1, C2 & B request.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
  describe('Booking should fail because Broker is included in Order in NoBroker mode', () => {
    describe('at C1', () => {
      // broker is included, by default, in C1 request
      const { fetchOpportunities, c1 } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, { brokerRole: 'https://openactive.io/NoBroker' });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      runFlowStageAndExpectIncompleteBrokerDetailsError(c1);
    });
    describe('at C2', () => {
      // broker is included, by default, in C2 request
      const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, { brokerRole: 'https://openactive.io/NoBroker', c1ReqTemplateRef: 'noBroker' });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      runFlowStageAndExpectIncompleteBrokerDetailsError(c2);
    });
    describe('at B', () => {
      // broker is included, by default, in B request
      const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, {
        brokerRole: 'https://openactive.io/NoBroker', c1ReqTemplateRef: 'noBroker', c2ReqTemplateRef: 'noBroker',
      });
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
      FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
      runFlowStageAndExpectIncompleteBrokerDetailsError(b);
    });
  });
});
