const fs = require("fs");

class Logger {
  constructor(title) {
    this.title = title;
    this.workingLog = "";
  }
  flush() {
    var filename = "./output/" + this.title + ".txt";
    fs.writeFile(filename, this.workingLog, function(err) {
      if (err) {
        return console.log(err);
      }

      //console.log("FILE SAVED: " + filename);
    });
  }
  log(text) {
    this.workingLog += text + "\n";
    this.flush(); // TODO: Do we need to flush on each write?
  }
}

module.exports = Logger;
