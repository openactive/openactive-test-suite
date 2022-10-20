const { spawn } = require('child_process');
const config = require('config');
const fs = require('fs/promises');
const path = require('path');

const BASE_SNAPSHOT_PATH = config.get('broker.snapshotPath');
const DATASET_SITE_URL = config.get('broker.datasetSiteUrl');
// TODO is URI encoding sufficient here?
const SNAPSHOT_PATH = path.join(__dirname, '..', '..', 'packages', 'openactive-broker-microservice', BASE_SNAPSHOT_PATH, encodeURIComponent(DATASET_SITE_URL));

run();

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
  const [earlierTimestamp, laterTimestamp] = [...timestamps.sort()].slice(-2);
  // 3. Run comparison with the latest 2 timestamps
  await validateFeedSnapshots(earlierTimestamp, laterTimestamp);
}

async function saveFeedSnapshotUsingBroker() {
  const brokerProc = spawn('npm', ['run', 'save-feed-snapshot-only'], {
    cwd: './packages/openactive-broker-microservice',
    stdio: 'inherit'
  });
  await completeChildProcess(brokerProc);
}

/**
 * @param {string} earlierTimestamp
 * @param {string} laterTimestamp
 */
async function validateFeedSnapshots(earlierTimestamp, laterTimestamp) {
  const earlierSnapshotDirectory = path.join(SNAPSHOT_PATH, earlierTimestamp);
  const laterSnapshotDirectory = path.join(SNAPSHOT_PATH, laterTimestamp);
  const snapshotValidatorProc = spawn('npm', ['start', earlierSnapshotDirectory, laterSnapshotDirectory], {
    cwd: './packages/openactive-feed-snapshot-validator',
    stdio: 'inherit',
  });
  await completeChildProcess(snapshotValidatorProc);
}

/**
 * @param {import('child_process').ChildProcess} childProcess
 */
function completeChildProcess(childProcess) {
  return new Promise((resolve) => {
    childProcess.on('exit', (code) => {
      if (code !== 0) {
        process.exit(code);
      }
      resolve();
    });
  });
}
