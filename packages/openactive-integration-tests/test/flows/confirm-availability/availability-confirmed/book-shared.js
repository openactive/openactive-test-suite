const chakram = require("chakram");
const expect = chakram.expect;

const {Logger} = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");

const sharedValidationTests = require("../../../shared-behaviours/validation");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  const logger = new Logger(dataItem.name, this);

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

    it("should return 200 on success", function() {
      expect(state.c1Response).to.have.status(200);
    });

    it("should return newly created event", function() {
      expect(state.c1Response).to.have.json(
        "orderedItem[0].orderedItem.@type",
        "ScheduledSession"
      );
      expect(state.c1Response).to.have.json(
        "orderedItem[0].orderedItem.superEvent.name",
        eventName
      );
    });

    it("offer should have price of " + price, function() {
      expect(state.c1Response).to.have.json(
        "orderedItem[0].acceptedOffer.price",
        price
      );
    });

    it("OrderQuote.totalPaymentDue equal to " + price, function() {
      expect(state.c1Response).to.have.json("totalPaymentDue.price", price);
    });

    it("C1 Order or OrderQuote should have one orderedItem", function() {
      expect(state.c1Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
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
