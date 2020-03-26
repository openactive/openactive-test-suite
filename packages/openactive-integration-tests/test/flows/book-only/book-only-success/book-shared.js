const chakram = require("chakram");
const expect = chakram.expect;

const {Logger} = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");
const sharedValidationTests = require("../../../shared-behaviours/validation");
const {GetMatch,C1,C2,B} = require("../../../shared-behaviours");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  const logger = new Logger(dataItem.name, this, {
    description: `A successful end to end booking.`
  });

  const state = new RequestState(logger);
  const flow = new FlowHelper(state);

  beforeAll(async function() {
    await state.createOpportunity(dataItem);

    return chakram.wait();
  });

  afterAll(async function() {
    await state.deleteOpportunity();

    await testHelper.deleteOrder(state.uuid, {
      sellerId: state.sellerId
    });
    return chakram.wait();
  });

  describe("Get Matching Event", function() {
    (new GetMatch({state, flow, logger, dataItem}))
    .beforeSetup()
    .successChecks()
    .validationTests();
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
