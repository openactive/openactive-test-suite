const {RequestState} = require("../../helpers/request-state");

const chakram = require("chakram");
const expect = chakram.expect;

describe("Create test event", function() {
  const testHelper = new RequestState(null);
  var apiResponse;
  var eventId;

  var testEvent = {
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    superEvent: {
      "@type": "SessionSeries",
      name: "Testevent2",
      offers: [
        {
          "@type": "Offer",
          price: 14.95
        }
      ]
    },
    startDate: "2019-11-20T17:26:16.0731663+00:00",
    endDate: "2019-11-20T19:12:16.0731663+00:00",
    maximumAttendeeCapacity: 5
  };

  beforeAll(async function() {
    let session = await testHelper.createScheduledSession(testEvent, {});

    ({ apiResponse } = await testHelper.getMatch(session.eventId));
  });

  afterAll(async function() {
    let { respObj } = await testHelper.deleteScheduledSession(eventId);
  });

  it("should return 200 on success", function() {
    expect(apiResponse).to.have.status(200);
  });

  it("should return newly created event", function() {
    expect(apiResponse).to.have.json("data.@type", "ScheduledSession");
    expect(apiResponse).to.have.json("data.superEvent.name", "Testevent2");
  });

  it("should have one offer", function() {
    expect(apiResponse).to.have.schema("data.superEvent.offers", {
      minItems: 1,
      maxItems: 1
    });
  });

  it("offer should have price of 14.95", function() {
    expect(apiResponse).to.have.json("data.superEvent.offers[0].price", 14.95);
  });
});
