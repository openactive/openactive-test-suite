const chakram = require('chakram');
const chai = require('chai'); // The latest version for new features than chakram includes
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, Common } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'availability-check',
  testFeatureImplemented: true,
  testIdentifier: 'availability-confirmed',
  testName: 'Occupancy in C1 and C2 matches feed',
  testDescription: 'Runs C1 and C2 for a known opportunity from the feed, and compares the results to those attained from the feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.fetchOpportunities(orderItemCriteria);

    return chakram.wait();
  });

  describe('Get Opportunity Feed Items', function () {
    (new GetMatch({
      state, flow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  const shouldMatchOccupancy = (stage, responseAccessor) => {
    Common.itForOrderItem(orderItemCriteria, state, stage, () => responseAccessor().body,
      'availability should match open data feed',
      (feedOrderItem, responseOrderItem) => {
        chai.expect(responseOrderItem).to.nested.include({
          'orderedItem.remainingAttendeeCapacity': feedOrderItem.orderedItem.remainingAttendeeCapacity,
        });
      });
  };

  describe('C1', function () {
    const c1 = (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    shouldMatchOccupancy(c1, () => state.c1Response);
  });

  describe('C2', function () {
    const c2 = (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    shouldMatchOccupancy(c2, () => state.c2Response);
  });
});
