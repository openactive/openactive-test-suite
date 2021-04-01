const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
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
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  beforeAll(async () => {
    await state.fetchOpportunities(orderItemCriteria);
  });

  describe('Get Opportunity Feed Items', () => {
    (new GetMatch({
      state, flow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C1', () => {
    (new C1({
      state, flow, logger,
    }))
      .beforeSetup();

    itShouldReturnAnOpenBookingError('IncompleteAttendeeDetailsError', 409, () => state.c1Response);
  });

  describe('C2', () => {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup();

    itShouldReturnAnOpenBookingError('IncompleteAttendeeDetailsError', 409, () => state.c2Response);
  });

  describe('B', () => {
    (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    itShouldReturnAnOpenBookingError('IncompleteAttendeeDetailsError', 409, () => state.bResponse);
  });
});
