const chakram = require("chakram");
const expect = chakram.expect;

const {Logger} = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");
const {C1} = require("../../../shared-behaviours/c1");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  const logger = new Logger(dataItem.name, this, {
    description: `An availability check against a session with capacity to spare.`
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

    return chakram.wait();
  });

  describe("C1", function() {
    (new C1({state, flow, logger, dataItem}))
    .beforeSetup()
    .successChecks()
    .validationTests();
  });
}

module.exports = {
  performTests
};
