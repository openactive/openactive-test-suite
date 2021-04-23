const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/b').BFlowStageType} BFlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'incomplete-customer-details',
  testName: 'Expect an IncompleteCustomerDetailsError when customer details are incomplete',
  testDescription: 'Run each of C2 and B for a valid opportunity, with customer details incomplete, expecting an IncompleteCustomerDetailsError to be returned (C1 is ignored because customer details are not accepted for C1)',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  numOpportunitiesUsedPerCriteria: 2, // one for each of the C2 and B tests
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  /**
   * @param {C2FlowStageType | BFlowStageType} flowStage
   */
  const itShouldReturnAnIncompleteCustomerDetailsError = flowStage => (
    itShouldReturnAnOpenBookingError('IncompleteCustomerDetailsError', 400, () => flowStage.getOutput().httpResponse));

  describe('Incomplete Customer Details at C2', () => {
    // # Initialise Flow Stages
    const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, {
      c2ReqTemplateRef: 'noCustomerEmail',
    });

    // # Set up Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
      itShouldReturnAnIncompleteCustomerDetailsError(c2);
    });
  });

  describe('Incomplete Customer Details at B', () => {
    // # Initialise Flow Stages
    const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, {
      bReqTemplateRef: 'noCustomerEmail',
    });

    // # Set up Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsValid(b, () => {
      itShouldReturnAnIncompleteCustomerDetailsError(b);
    });
  });
});
