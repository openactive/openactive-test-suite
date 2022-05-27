const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-but-not-supplied',
  testName: 'Booking opportunity with additional details required but not supplied',
  testDescription: 'Should error',
  testOpportunityCriteria: 'TestOpportunityBookableAdditionalDetails',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteria, logger);

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);

  function itShouldReturnAnIncompleteIntakeFormError(flowStage) {
    it('should return an IncompleteIntakeFormError on the OrderItem', () => {
      const positionsOfOrderItemsThatNeedIntakeForms = Object.keys(c1.getOutput().positionOrderIntakeFormMap).map(parseInt);
      const orderItemsThatNeedIntakeForms = flowStage.getOutput().httpResponse.body.orderedItem
        .filter(orderItem => positionsOfOrderItemsThatNeedIntakeForms.includes(orderItem.position));

      for (const orderItem of orderItemsThatNeedIntakeForms) {
        chai.expect(orderItem).to.have.property('error');
        const errors = orderItem.error;
        const incompleteIntakeFormErrors = errors.filter(error => error['@type'] === 'IncompleteIntakeFormError');
        chai.expect(incompleteIntakeFormErrors).to.have.lengthOf.above(0);
      }
    });
  }

  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldReturnAnIncompleteIntakeFormError(c2);
  });

  FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
    itShouldReturnAnIncompleteIntakeFormError(bookRecipe.firstStage);
  });
});
