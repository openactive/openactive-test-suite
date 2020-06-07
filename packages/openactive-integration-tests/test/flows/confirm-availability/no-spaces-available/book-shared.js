const chakram = require("chakram");
const expect = chakram.expect;

const {Logger} = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");

const sharedValidationTests = require("../../../shared-behaviours/validation");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  const logger = new Logger(dataItem.name, this, {
    description: `An availability check against a session filled to capacity. As no more capacity is available it's no-longer possible to obtain quotes.`
  });

  const state = new RequestState(logger);
  const flow = new FlowHelper(state);

  beforeAll(async function() {
    await state.fetchOpportunities(dataItem);
    await flow.getMatch();

    return chakram.wait();
  });

  afterAll(async function() {
    await state.deleteOpportunity();

    return chakram.wait();
  });
  
  describe("C1", function() {
    beforeAll(async function() {
      await flow.C1();
    });

    it("should return 409 - Conflict", async function() {
      expect(state.c1Response).to.have.status(409);
    });

    it("should return a OpportunityIsFullError error", async function() {
      expect(state.c1Response).to.have.json(
        "@type",
        "OpportunityIsFullError"
      );
    });

    sharedValidationTests.shouldBeValidResponse(
      () => state.c1Response,
      "C1",
      logger,
      {
        validationMode: "C1Response"
      }
    );
  });
}

module.exports = {
  performTests
};
