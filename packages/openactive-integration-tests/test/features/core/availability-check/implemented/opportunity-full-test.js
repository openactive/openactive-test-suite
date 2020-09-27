/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai'); // The latest version for new features than chakram includes
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, B, Common } = require('../../../../shared-behaviours');

const { expect } = chakram;
/* eslint-enable no-unused-vars */


FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'availability-check',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-full',
  testName: 'OpportunityIsFullError returned for full OrderItems',
  testDescription: 'An availability check against a session filled to capacity. As no more capacity is available it is no-longer possible to obtain quotes.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableNoSpaces',
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

  const shouldReturnOpportunityIsFullError = (stage, responseAccessor) => {
    it('should return 409', () => {
      stage.expectResponseReceived();
      expect(responseAccessor()).to.have.status(409);
    });

    Common.itForOrderItemByControl(orderItemCriteria, state, stage, () => responseAccessor().body,
      'should include an OpportunityIsFullError',
      (feedOrderItem, responseOrderItem, responseOrderItemErrorTypes) => {
        chai.expect(responseOrderItemErrorTypes).to.include('OpportunityIsFullError');

        if (responseOrderItem.orderedItem['@type'] === 'Slot') {
          chai.expect(responseOrderItem).to.nested.include({
            'orderedItem.remainingUses': 0,
          });
        } else {
          chai.expect(responseOrderItem).to.nested.include({
            'orderedItem.remainingAttendeeCapacity': 0,
          });
        }
      },
      'should not include an OpportunityIsFullError',
      (feedOrderItem, responseOrderItem, responseOrderItemErrorTypes) => {
        chai.expect(responseOrderItemErrorTypes).not.to.include('OpportunityIsFullError');

        if (responseOrderItem.orderedItem['@type'] === 'Slot') {
          chai.expect(responseOrderItem).to.nested.include({
            'orderedItem.remainingUses': feedOrderItem.orderedItem.remainingUses,
          });
        } else {
          chai.expect(responseOrderItem).to.nested.include({
            'orderedItem.remainingAttendeeCapacity': feedOrderItem.orderedItem.remainingAttendeeCapacity,
          });
        }
      });
  };

  describe('C1', function () {
    const c1 = (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    shouldReturnOpportunityIsFullError(c1, () => state.c1Response);
  });

  describe('C2', function () {
    const c2 = (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    shouldReturnOpportunityIsFullError(c2, () => state.c2Response);
  });
});
