const moment = require("moment");
const bookingShared = require("./book-shared");

//TODO: could we set ["ScheduledSession", "Slot"] in config so we only test types that are in that list?
["ScheduledSession", "Slot"].forEach(type => {
  describe("Book Only", function() {
    describe(`Book Only Success for random ${type}`, function() {
      bookingShared.performTests.bind(this)({
        title: `Single random ${type}`,
        randomEvent: `${type}`
      });
    });
  });
});