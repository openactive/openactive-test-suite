const bookingShared = require('./book-shared');

let testEvent = {
  title: "Single session, 5 spaces, non-free",
  name: "OpenActiveTestEvent1",
  price: 14.95,
  event: {
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    superEvent: {
      "@type": "SessionSeries",
      name: "OpenActiveTestEvent1",
      offers: [
        {
          "@type": "Offer",
          price: 14.95,
        },
      ],
    },
    startDate: "2019-11-20T17:26:16.0731663+00:00",
    endDate: "2019-11-20T19:12:16.0731663+00:00",
    maximumAttendeeCapacity: 5,
  },
};

bookingShared.performTests(testEvent);
