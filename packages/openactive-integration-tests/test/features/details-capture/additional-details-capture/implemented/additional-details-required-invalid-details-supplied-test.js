const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-invalid-details-supplied',
  testName: 'Booking opportunity with additional details supplied but not supplied',
  testDescription: 'Should error',
  testOpportunityCriteria: 'TestOpportunityBookableAdditionalDetails',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
// ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteria, logger,
    { c2ReqTemplateRef: 'additionalDetailsRequiredInvalidSupplied', bReqTemplateRef: 'additionalDetailsRequiredInvalidSupplied' });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);

  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    it('should return an IncompleteAttendeeDetailsError on the OrderItem', () => {
      const positionsOfOrderItemsThatNeedIntakeForms = Object.keys(c1.getOutput().positionOrderIntakeFormMap).map(parseInt);
      const orderItemsThatNeedIntakeForms = c2.getOutput().httpResponse.body.orderedItem
        .filter(orderItem => positionsOfOrderItemsThatNeedIntakeForms.includes(orderItem.position));

      for (const orderItem of orderItemsThatNeedIntakeForms) {
        chai.expect(orderItem).to.have.property('error');
        const errors = orderItem.error;
        const incompleteIntakeFormErrors = errors.filter(error => error['@type'] === 'InvalidIntakeFormError');
        chai.expect(incompleteIntakeFormErrors).to.have.lengthOf.above(0);
      }
    });
  });
  FlowStageUtils.describeRunAndCheckIsValid(b, () => {
    itShouldReturnAnOpenBookingError('UnableToProcessOrderItemError', 409, () => b.getOutput().httpResponse);
  });
});
