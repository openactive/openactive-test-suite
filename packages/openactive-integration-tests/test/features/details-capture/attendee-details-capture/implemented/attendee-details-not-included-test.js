const _ = require('lodash');
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
  testFeature: 'attendee-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'attendee-details-not-included',
  testName: 'Booking opportunity with attendeeDetails not included',
  testDescription: 'Should error',
  testOpportunityCriteria: 'TestOpportunityBookableAttendeeDetails',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, describeFeatureRecord) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteria, logger, describeFeatureRecord, {
    c2ExpectToFail: true,
    bookExpectToFail: true,
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);

  /**
   * @param {C2FlowStageType | BFlowStageType | PFlowStageType} flowStage
   */
  function itShouldReturnAnIncompleteAttendeeDetailsError(flowStage) {
    it('should return an IncompleteAttendeeDetailsError on the OrderItem', () => {
      const positionsOfOrderItemsThatNeedAttendeeDetails = c1.getStage('c1').getOutput().httpResponse.body.orderedItem
        .filter(orderItem => !_.isNil(orderItem.attendeeDetailsRequired))
        .map(orderItem => orderItem.position);
      const orderItemsThatNeedAttendeeDetails = flowStage.getOutput().httpResponse.body.orderedItem
        .filter(orderItem => positionsOfOrderItemsThatNeedAttendeeDetails.includes(orderItem.position));

      for (const orderItem of orderItemsThatNeedAttendeeDetails) {
        chai.expect(orderItem).to.have.property('error');
        const errors = orderItem.error;
        const incompleteIntakeFormErrors = errors.filter(error => error['@type'] === 'IncompleteAttendeeDetailsError');
        chai.expect(incompleteIntakeFormErrors).to.have.lengthOf.above(0);
      }
    });
  }

  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldReturnAnIncompleteAttendeeDetailsError(c2.getStage('c2'));
  });

  FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
    itShouldReturnAnIncompleteAttendeeDetailsError(bookRecipe.firstStage);
  });
});
