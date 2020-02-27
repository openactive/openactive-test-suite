const moment = require("moment");
const bookingShared = require("./book-shared");

let testEvent = {
  title: "Single session, 5 spaces, non-free",
  name: "OA-Test-BookOnly-ScheduledSession-Paid-Success",
  price: 14.95,
  event: {
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    superEvent: {
      "@type": "SessionSeries",
      name: "OA-Test-BookOnly-ScheduledSession-Paid-Success",
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

describe("Book Only", function() {
  describe("Book Only Success With Payment for ScheduledSession", function() {
    bookingShared.performTests.bind(this)(testEvent);
  });
});
