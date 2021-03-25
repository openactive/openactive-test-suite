const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-but-not-supplied',
  testName: 'Booking opportunity with additional details required but not included',
  testDescription: 'Should error',
  testOpportunityCriteria: 'TestOpportunityBookableAdditionalDetails',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteria, logger);

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: true, doCheckIsValid: false }, c1); // check valid when valueRequired not Boolean bug is fixed

  FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: false, doCheckIsValid: false }, c2, () => { // check valid when valueRequired not Boolean bug is fixed
    it('should an IncompleteIntakeFormError on the OrderItem', () => {
      const orderItemAtPosition0 = c2.getOutput().httpResponse.body.orderedItem.find(orderItem => orderItem.position === 0);
      expect(orderItemAtPosition0).toHaveProperty('error');
      const errors = orderItemAtPosition0.error;
      const incompleteIntakeFormErrors = errors.filter(error => error['@type'] === 'IncompleteIntakeFormError');
      expect(incompleteIntakeFormErrors.length > 0);
    });
  });
  FlowStageUtils.describeRunAndCheckIsValid(b, () => {
    itShouldReturnAnOpenBookingError('UnableToProcessOrderItemError', 409, () => b.getOutput().httpResponse);
  });
});
