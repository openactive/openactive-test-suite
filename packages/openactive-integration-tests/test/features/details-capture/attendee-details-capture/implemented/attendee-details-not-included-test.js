const _ = require('lodash');
const chai = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

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
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteria, logger);

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);

  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    it('should an IncompleteAttendeeDetailsError on the OrderItem', () => {
      const positionsOfOrderItemsThatNeedAttendeeDetails = c1.getOutput().httpResponse.body.orderedItem
        .filter(orderItem => !_.isNil(orderItem.attendeeDetailsRequired))
        .map(orderItem => orderItem.position);
      const orderItemsThatNeedAttendeeDetails = c2.getOutput().httpResponse.body.orderedItem
        .filter(orderItem => positionsOfOrderItemsThatNeedAttendeeDetails.includes(orderItem.position));

      for (const orderItem of orderItemsThatNeedAttendeeDetails) {
        chai.expect(orderItem).to.have.property('error');
        const errors = orderItem.error;
        const incompleteIntakeFormErrors = errors.filter(error => error['@type'] === 'IncompleteAttendeeDetailsError');
        chai.expect(incompleteIntakeFormErrors).to.have.lengthOf.above(0)
      }
    });
  });
  FlowStageUtils.describeRunAndCheckIsValid(b, () => {
    itShouldReturnAnOpenBookingError('UnableToProcessOrderItemError', 409, () => b.getOutput().httpResponse);
  });
});
