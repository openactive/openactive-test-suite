const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError, itShouldIncludeErrorForOnlyPrimaryOrderItems } = require('../../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

const { IMPLEMENTED_FEATURES } = global;

const singleOpportunityCriteriaTemplate = (opportunityType, bookingFlow) => [
  {
    opportunityType,
    bookingFlow,
    opportunityCriteria: 'TestOpportunityBookableNonFreePrepaymentRequired',
  },
  {
    opportunityType,
    bookingFlow,
    opportunityCriteria: 'TestOpportunityBookableNonFreePrepaymentUnavailable',
  },
];

// If free opportunities are implemented, they can be used as a control.
const canDoTestWithControl = IMPLEMENTED_FEATURES['free-opportunities'];

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-required-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'prepayment-required-unavailable-conflict-error',
  testName: 'Fail when required and unavailable OrderItems are mixed',
  testDescription: 'For an Order that includes OrderItems with openBookingPrepayment=Required and =Unavailable, a OpportunityIsInConflictError should be emitted',
  singleOpportunityCriteriaTemplate,
  multipleOpportunityCriteriaTemplate: canDoTestWithControl
    ? (opportunityType, bookingFlow) => [
      ...singleOpportunityCriteriaTemplate(opportunityType, bookingFlow),
      {
        opportunityType,
        bookingFlow,
        // A free opportunity should not conflict with the above
        opportunityCriteria: 'TestOpportunityBookableFree',
        control: true,
      },
    ]
    : null,
  skipMultiple: !canDoTestWithControl,
}, (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // Iniitate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, {
    c1ExpectToFail: true,
    c2ExpectToFail: true,
    bookExpectToFail: true,
  });

  /**
   * @param {C1FlowStageType | C2FlowStageType} flowStage
   */
  function itShouldIncludeOpportunityIsInConflictErrorWhereRelevant(flowStage) {
    itShouldIncludeErrorForOnlyPrimaryOrderItems('OpportunityIsInConflictError', {
      orderItemCriteriaList,
      getFeedOrderItems: () => fetchOpportunities.getOutput().orderItems,
      getOrdersApiResponse: () => flowStage.getOutput().httpResponse,
    });
  }

  // Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsValid(c1, () => {
    itShouldIncludeOpportunityIsInConflictErrorWhereRelevant(c1.getStage('c1'));
  });
  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldIncludeOpportunityIsInConflictErrorWhereRelevant(c2.getStage('c2'));
  });
  FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
    itShouldReturnAnOpenBookingError('UnableToProcessOrderItemError', 409, () => bookRecipe.firstStage.getOutput().httpResponse);
  });
});
