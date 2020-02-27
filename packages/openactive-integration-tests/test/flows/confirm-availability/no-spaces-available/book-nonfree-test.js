const moment = require("moment");
const bookingShared = require("./book-shared");

let testEvent = {
  title: "Single session, 5 spaces, non-free",
  name: "OA-Test-ConfAvail-NoSpaces",
  price: 14.95,
  event: {
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    superEvent: {
      "@type": "SessionSeries",
      name: "OA-Test-ConfAvail-NoSpaces",
      offers: [
        {
          "@type": "Offer",
          price: 14.95
        }
      ]
    },
    startDate: moment()
      .add(6, "d")
      .format(),
    endDate: moment()
      .add(7, "d")
      .format(),
    maximumAttendeeCapacity: 0
  }
};

describe("Confirm Availability", function() {
  describe("No Spaces Available in Single Opportunity", function() {
    bookingShared.performTests.bind(this)(testEvent);
  });
});
