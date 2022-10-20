const { spawn } = require('child_process');
const config = require('config');
const fs = require('fs/promises');
const path = require('path');

const BASE_SNAPSHOT_PATH = config.get('broker.snapshotPath');
const DATASET_SITE_URL = config.get('broker.datasetSiteUrl');
const SNAPSHOT_PATH = path.join(BASE_SNAPSHOT_PATH, DATASET_SITE_URL);

function saveFeedSnapshotUsingBroker() {
  return new Promise((resolve) => {
    const broker = spawn('npm', ['run', 'save-feed-snapshot-only'], {
      cwd: './packages/openactive-broker-microservice',
      stdio: 'inherit'
    });
    broker.on('exit', (code) => {
      if (code !== 0) {
        process.exit(code);
      }
      resolve();
    });
  });
}

// TODO options;
// * Specified previous timestamp (to compare to a much earlier one)
// * Clean up old timestamps?
async function run() {
  // 1. Save feed snapshot
  await saveFeedSnapshotUsingBroker();
  // 2. Do we have enough snapshots (we need 2) for comparison?
  const timestamps = await fs.readdir(SNAPSHOT_PATH);
  if (timestamps.length <= 1) {
    console.log('A 2nd snapshot is needed in order to perform a comparison. Run this command again at a later time in order to compare the snapshot created then with the snapshot created just now');
    process.exit(0);
  }
  const [previousTimestamp, latestTimestamp] = [...timestamps.sort()].slice(-2);
  // 3. Run comparison with the latest 2 timestamps
}

run();

