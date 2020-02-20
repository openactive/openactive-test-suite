const moment = require("moment");
const bookingShared = require("./book-shared");

let testEvent = {
  title: "Single session, 5 spaces, free",
  name: "OA-Test-BookCCancel-Free-Failure",
  price: 0,
  event: {
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    superEvent: {
      "@type": "SessionSeries",
      name: "OA-Test-BookCCancel-Free-Failure",
      offers: [
        {
          "@type": "Offer",
          price: 0
        }
      ]
    },
    startDate: moment()
      .subtract(7, "d")
      .format(),
    endDate: moment()
      .subtract(6, "d")
      .format(),
    maximumAttendeeCapacity: 5
  }
};

describe("Book and Cancel", function() {
  describe("Book and Customer Cancel Failure Without Payment", function() {
    bookingShared.performTests.bind(this)(testEvent);
  });
});
