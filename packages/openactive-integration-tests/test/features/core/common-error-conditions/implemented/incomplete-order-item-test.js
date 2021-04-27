const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'incomplete-order-item',
  testName: 'Test for IncompleteOrderItemError (at C1, C2 and B)',
  testDescription: 'Test for IncompleteOrderItemError (at C1, C2 and B). If there is a missing acceptedOffer or orderedItem property on the OrderItem.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: false,
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  describe('with noOrderedItem', () => {
    // ## Set up tests for noOrderedItem
    const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger,
      {
        c1ReqTemplateRef: 'noOrderedItem', c2ReqTemplateRef: 'noOrderedItem', bookReqTemplateRef: 'noOrderedItem',
      });

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: false }, c1, () => {
      // When CR3 is accepted and merged into the Booking Spec, this will be a 400 error, not a 409
      itShouldReturnAnOpenBookingError('IncompleteOrderItemError', 409, () => c1.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: false }, c2, () => {
      // When CR3 is accepted and merged into the Booking Spec, this will be a 400 error, not a 409
      itShouldReturnAnOpenBookingError('IncompleteOrderItemError', 409, () => c2.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
      // When CR3 is accepted and merged into the Booking Spec, this will be a 400 error, not a 409
      itShouldReturnAnOpenBookingError('IncompleteOrderItemError', 409, () => bookRecipe.firstStage.getOutput().httpResponse);
    });
  });

  describe('with noAcceptedOffer', () => {
    // ## Set up tests for noAcceptedOffer
    const second = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger,
      {
        c1ReqTemplateRef: 'noAcceptedOffer', c2ReqTemplateRef: 'noAcceptedOffer', bookReqTemplateRef: 'noAcceptedOffer',
      });

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(second.fetchOpportunities);
    FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: false }, second.c1, () => {
      // When CR3 is accepted and merged into the Booking Spec, this will be a 400 error, not a 409
      itShouldReturnAnOpenBookingError('IncompleteOrderItemError', 409, () => second.c1.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: false, doCheckSuccess: false }, second.c2, () => {
      // When CR3 is accepted and merged into the Booking Spec, this will be a 400 error, not a 409
      itShouldReturnAnOpenBookingError('IncompleteOrderItemError', 409, () => second.c2.getOutput().httpResponse);
    });
    FlowStageUtils.describeRunAndCheckIsValid(second.bookRecipe.firstStage, () => {
      // When CR3 is accepted and merged into the Booking Spec, this will be a 400 error, not a 409
      itShouldReturnAnOpenBookingError('IncompleteOrderItemError', 409, () => second.bookRecipe.firstStage.getOutput().httpResponse);
    });
  });
});
