/**
 * ## Remove all but last 2
 *
 * ```sh
 * node src/scripts/removeOldFeedSnapshots.js --keep-last-2
 * ```
 *
 * This will remove all but the latest 2 feed snapshots. The latest 2 are required in order to
 * compare one against the other using Feed Snapshot Validator.
 *
 * This is the default strategy which is used if no flags are provided
 *
 * ## Remove all
 *
 * ```sh
 * node src/scripts/removeOldFeedSnapshots.js --remove-all
 * ```
 *
 * Simply removes all feed snapshots.
 */
// TODO TODO doc this script e.g. in Broker readme?
const fs = require('fs/promises');
const path = require('path');

// Inform config library that config is in the root directory (https://github.com/lorenwest/node-config/wiki/Configuration-Files#config-directory)
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', '..', '..', '..', 'config');

const config = require('config');
const { log } = require('../util/log');

const BASE_SNAPSHOT_PATH = config.get('broker.snapshotPath');
const DATASET_SITE_URL = config.get('broker.datasetSiteUrl');

const SNAPSHOT_PATH = path.join(BASE_SNAPSHOT_PATH, encodeURIComponent(DATASET_SITE_URL));

run();

function run() {
  const strategy = (
    process.argv.includes('--remove-all')
      ? 'remove-all'
      : 'keep-last-2'
  );

  removeOldFeedSnapshots(strategy);
}

/**
 * @param {'keep-last-2' | 'remove-all'} strategy
 */
async function removeOldFeedSnapshots(strategy) {
  switch (strategy) {
    case 'remove-all':
      await removeOldFeedSnapshotsAll();
      break;
    case 'keep-last-2':
      await removeOldFeedSnapshotsKeepLast2();
      break;
    default:
      throw new Error('unrecognised');
  }
}

async function removeOldFeedSnapshotsKeepLast2() {
  const timestamps = await fs.readdir(SNAPSHOT_PATH);
  const timestampsToDelete = [...timestamps.sort()].slice(0, -2);
  await Promise.all(timestampsToDelete.map(async (timestamp) => {
    const filePath = path.join(SNAPSHOT_PATH, timestamp);
    await fs.rm(filePath, {
      recursive: true, force: true,
    });
    log(`Removed old feed snapshot at ${filePath}`);
  }));
  // }));
  log('Removed all feed snapshots except the last 2');
}

async function removeOldFeedSnapshotsAll() {
  await fs.rm(SNAPSHOT_PATH, {
    recursive: true, force: true,
  });
  log('Removed all feed snapshots');
}
