const chakram = require("chakram");
const expect = chakram.expect;

const {Logger} = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");
const sharedValidationTests = require("../../../shared-behaviours/validation");
const {C1} = require("../../../shared-behaviours/c1");
const {C2} = require("../../../shared-behaviours/c2");
const {B} = require("../../../shared-behaviours/B");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  const logger = new Logger(dataItem.name, this, {
    description: `A successful end to end booking.`
  });

  const state = new RequestState(logger);
  const flow = new FlowHelper(state);

  beforeAll(async function() {
    await state.createOpportunity(dataItem);
    await flow.getMatch();

    return chakram.wait();
  });

  afterAll(async function() {
    await state.deleteOpportunity();

    await testHelper.deleteOrder(state.uuid, {
      sellerId: state.sellerId
    });
    return chakram.wait();
  });

  //if (state.eventFound) {
    describe("C1", function() {
      (new C1({state, flow, logger, dataItem}))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe("C2", function() {
      (new C2({state, flow, logger, dataItem}))
      .beforeSetup()
      .successChecks()
      .validationTests();
    });

    describe("B", function() {
      (new B({state, flow, logger, dataItem}))
      .beforeSetup()
      .successChecks()
      .validationTests();
    });
  //}
}

module.exports = {
  performTests
};
