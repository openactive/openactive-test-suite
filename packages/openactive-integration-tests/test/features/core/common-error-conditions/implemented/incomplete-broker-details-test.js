const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageUtils, FlowStageRecipes } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/b').BFlowStageType} BFlowStageType
 * @typedef {import('../../../../helpers/flow-stages/p').PFlowStageType} PFlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'incomplete-broker-details',
  testName: 'Expect an IncompleteBrokerDetailsError when broker details are missing name',
  testDescription: 'Run each of C1, C2 and B for a valid opportunity, with broker details incomplete (missing name), expecting an IncompleteBrokerDetailsError to be returned',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  numOpportunitiesUsedPerCriteria: 3, // one for each of the C1, C2 and B tests
  supportsApproval: true,
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  /**
   * @param {C1FlowStageType | C2FlowStageType | BFlowStageType | PFlowStageType} flowStage
   */
  const itShouldReturnAnIncompleteBrokerDetailsError = flowStage => (
    itShouldReturnAnOpenBookingError('IncompleteBrokerDetailsError', 400, () => flowStage.getOutput().httpResponse));

  describe('Incomplete Broker Details at C1', () => {
    // # Initialise Flow Stages
    const { fetchOpportunities, c1 } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, {
      c1ReqTemplateRef: 'noBrokerName',
    });

    // # Set up Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
      itShouldReturnAnIncompleteBrokerDetailsError(c1);
    });
  });

  describe('Incomplete Broker Details at C2', () => {
    // # Initialise Flow Stages
    const { fetchOpportunities, c1, c2 } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger, {
      c2ReqTemplateRef: 'noBrokerName',
    });

    // # Set up Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
      itShouldReturnAnIncompleteBrokerDetailsError(c2);
    });
  });

  describe('Incomplete Broker Details at B', () => {
    // # Initialise Flow Stages
    const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
      bookReqTemplateRef: 'noBrokerName',
    });

    // # Set up Tests
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
      itShouldReturnAnIncompleteBrokerDetailsError(bookRecipe.firstStage);
    });
  });
});
