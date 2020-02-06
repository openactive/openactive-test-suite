const chakram = require("chakram");
const expect = chakram.expect;
const pMemoize = require("p-memoize");

const RequestHelper = require("../../../helpers/request-helper");
const Logger = require("../../../helpers/logger");
const sharedValidationTests = require("../../../shared-behaviours/validation");

function performTests(dataItem) {
  const { event: testEvent, price, name: eventName } = dataItem;

  var eventId;
  var opportunityId;
  var offerId;
  var sellerId;
  var uuid;
  var totalPaymentDue;

  var c1Response;

  const logger = new Logger(dataItem.name);

  const testHelper = new RequestHelper(logger);

  beforeAll(async function() {
    logger.log(
      "\n\n** Test Event **: \n\n" + JSON.stringify(testEvent, null, 2)
    );

    uuid = testHelper.uuid();

    let session = await testHelper.createScheduledSession(testEvent, {
      sellerId
    });

    eventId = session.respObj.body['@id'];

    await performGetMatch();

    return chakram.wait();
  });

  afterAll(async function() {
    // by the end, it should have done this already, but let's force it through if it hasn't

    await testHelper.deleteScheduledSession(eventId, {
      sellerId
    });
    return chakram.wait();
  });

  const performGetMatch = pMemoize(async function performGetMatch() {
    ({ opportunityId, offerId, sellerId } = await testHelper.getMatch(
      eventId
    ));
  });

  const performC1 = pMemoize(async function performC1() {
    await performGetMatch();

    ({ c1Response, totalPaymentDue } = await testHelper.putOrderQuoteTemplate(
      uuid,
      {
        opportunityId,
        offerId,
        sellerId,
        uuid
      }
    ));
  });

  describe("C1", function() {
    beforeAll(async function() {
      await performC1();
    });

    it("should return 200 on success", async function() {
      expect(c1Response).to.have.status(200);
    });

    it("should return newly created event", async function() {
      expect(c1Response).to.have.json(
        "orderedItem[0].orderedItem.@type",
        "ScheduledSession"
      );
      expect(c1Response).to.have.json(
        "orderedItem[0].orderedItem.superEvent.name",
        eventName
      );
    });

    it("offer should have price of " + price, async function() {
      expect(c1Response).to.have.json(
        "orderedItem[0].acceptedOffer.price",
        price
      );
    });

    it("OrderQuote.totalPaymentDue equal to " + price, async function() {
      expect(c1Response).to.have.json("totalPaymentDue.price", price);
    });

    it("C1 Order or OrderQuote should have one orderedItem", async function() {
      expect(c1Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    sharedValidationTests.shouldBeValidResponse(() => c1Response.body, "C1", logger, {
      validationMode: "C1Response"
    });
  });
}

module.exports = {
  performTests
};
