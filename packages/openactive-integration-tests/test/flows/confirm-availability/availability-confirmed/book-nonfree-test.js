const moment = require("moment");
const bookingShared = require("./book-shared");

let testEvent = {
  title: "Single session, 5 spaces, non-free",
  name: "OA-Test-ConfAvail-Confirmed",
  price: 14.95,
  event: {
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    superEvent: {
      "@type": "SessionSeries",
      name: "OA-Test-ConfAvail-Confirmed",
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
    maximumAttendeeCapacity: 5
  }
};

describe("Confirm Availability", function() {
  describe("Availabilty Confirmed", function() {
    bookingShared.performTests.bind(this)(testEvent);
  });
});
