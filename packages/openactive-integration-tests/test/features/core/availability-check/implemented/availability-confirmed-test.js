/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { C1 } = require('../../../../shared-behaviours/c1');
const { C2 } = require('../../../../shared-behaviours/c2');
const { B } = require('../../../../shared-behaviours/b');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature({
  testCategory: 'core',
  testFeature: 'availability-check',
  testFeatureImplemented: true,
  testName: 'availability-confirmed',
  testDescription: 'Runs C1 and C2 for a known opportunity from the feed, and compares the results to those attained from the feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunity',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.createOpportunity(orderItemCriteria);
    await flow.getMatch();

    return chakram.wait();
  });

  // if (state.eventFound) {
  describe('C1', function () {
    const c1 = (new C1({
      state, flow, logger, configuration,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    it('availability should match open data feed', () => {
      c1.expectSuccessful();

      expect(state.c1Response).to.have.json(
        'orderedItem[0].orderedItem.remainingAttendeeCapacity',
        state.apiResponse.body.data.remainingAttendeeCapacity,
      );
    });
  });

  describe('C2', function () {
    const c2 = (new C2({
      state, flow, logger, configuration,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    it('availability should match open data feed', () => {
      c2.expectSuccessful();

      expect(state.c2Response).to.have.json(
        'orderedItem[0].orderedItem.remainingAttendeeCapacity',
        state.apiResponse.body.data.remainingAttendeeCapacity,
      );
    });
  });

  // }
});
