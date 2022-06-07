const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

/**
 * @typedef {import('../../../../helpers/flow-stages/p').PFlowStageType} PFlowStageType
 * @typedef {import('../../../../helpers/flow-stages/b').BFlowStageType} BFlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c2').C2FlowStageType} C2FlowStageType
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-invalid-details-supplied',
  testName: 'Booking opportunity with additional details supplied but invalid details supplied',
  testDescription: 'Should error',
  testOpportunityCriteria: 'TestOpportunityBookableAdditionalDetails',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
// ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteria, logger, {
    c2ReqTemplateRef: 'additionalDetailsRequiredInvalidSupplied',
    bookReqTemplateRef: 'additionalDetailsRequiredInvalidSupplied',
    c2ExpectToFail: true,
    bookExpectToFail: true,
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);

  /**
   * @param {C2FlowStageType | BFlowStageType | PFlowStageType } flowStage
   */
  function itShouldReturnAnInvalidIntakeFormError(flowStage) {
    it('should return an IncompleteAttendeeDetailsError on the OrderItem', () => {
      const positionsOfOrderItemsThatNeedIntakeForms = Object.keys(c1.getStage('c1').getOutput().positionOrderIntakeFormMap).map(parseInt);
      const orderItemsThatNeedIntakeForms = flowStage.getOutput().httpResponse.body.orderedItem
        .filter(orderItem => positionsOfOrderItemsThatNeedIntakeForms.includes(orderItem.position));

      for (const orderItem of orderItemsThatNeedIntakeForms) {
        chai.expect(orderItem).to.have.property('error');
        const errors = orderItem.error;
        const incompleteIntakeFormErrors = errors.filter(error => error['@type'] === 'InvalidIntakeFormError');
        chai.expect(incompleteIntakeFormErrors).to.have.lengthOf.above(0);
      }
    });
  }

  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldReturnAnInvalidIntakeFormError(c2.getStage('c2'));
  });
  FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
    itShouldReturnAnInvalidIntakeFormError(bookRecipe.firstStage);
  });
});
