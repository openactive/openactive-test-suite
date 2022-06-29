const fs = require('fs-extra');
const FEED_SNAPSHOTS_PATH = '../openactive-broker-microservice/feed_snapshots';
function start() {
  // Get Files
  for (const dataSource of await fs.access(FEED_SNAPSHOTS_PATH)) {

    
    // Run Assertions
  }


}

start();