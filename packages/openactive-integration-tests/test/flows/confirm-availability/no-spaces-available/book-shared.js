const chakram = require("chakram");
const expect = chakram.expect;

const Logger = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");

const sharedValidationTests = require("../../../shared-behaviours/validation");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  const logger = new Logger(dataItem.name);

  const state = new RequestState(logger);
  const flow = new FlowHelper(state);

  beforeAll(async function() {
    logger.log(
      "\n\n** Test Event **: \n\n" + JSON.stringify(testEvent, null, 2)
    );

    await state.createScheduledSession(testEvent);
    await flow.getMatch();

    return chakram.wait();
  });

  afterAll(async function() {
    await state.deleteScheduledSession();

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
      () => state.c1Response.body,
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
