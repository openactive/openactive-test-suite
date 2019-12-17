const bookingShared = require('./book-shared');

let testEvent = {
  title: "Single session, 5 spaces, free",
  name: "OpenActiveTestEvent2",
  price: 0,
  event: {
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    superEvent: {
      "@type": "SessionSeries",
      name: "OpenActiveTestEvent2",
      offers: [
        {
          "@type": "Offer",
          price: 0,
        },
      ],
    },
    startDate: "2019-11-20T17:26:16.0731663+00:00",
    endDate: "2019-11-20T19:12:16.0731663+00:00",
    maximumAttendeeCapacity: 5,
  },
};

bookingShared.performTests(testEvent);
