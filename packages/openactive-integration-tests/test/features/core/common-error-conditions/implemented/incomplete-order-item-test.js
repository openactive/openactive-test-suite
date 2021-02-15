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
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Set up tests for noOrderedItem
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger,
    {
      c1ReqTemplateRef: 'noOrderedItem', c2ReqTemplateRef: 'noOrderedItem', bReqTemplateRef: 'noOrderedItem',
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
  FlowStageUtils.describeRunAndCheckIsValid(b, () => {
    // When CR3 is accepted and merged into the Booking Spec, this will be a 400 error, not a 409
    itShouldReturnAnOpenBookingError('IncompleteOrderItemError', 409, () => b.getOutput().httpResponse);
  });

  // ## Set up tests for noAcceptedOffer
  const second = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger,
    {
      c1ReqTemplateRef: 'noAcceptedOffer', c2ReqTemplateRef: 'noAcceptedOffer', bReqTemplateRef: 'noAcceptedOffer',
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
  FlowStageUtils.describeRunAndCheckIsValid(second.b, () => {
    // When CR3 is accepted and merged into the Booking Spec, this will be a 400 error, not a 409
    itShouldReturnAnOpenBookingError('IncompleteOrderItemError', 409, () => second.b.getOutput().httpResponse);
  });
});
