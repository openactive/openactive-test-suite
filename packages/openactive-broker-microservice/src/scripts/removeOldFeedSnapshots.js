// TODO TODO doc this script e.g. in Broker readme?
const fs = require('fs/promises');
const path = require('path');

// Inform config library that config is in the root directory (https://github.com/lorenwest/node-config/wiki/Configuration-Files#config-directory)
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', '..', '..', '..', 'config');

const config = require('config');
const { log } = require('../util/log');

const SNAPSHOT_PATH = config.get('broker.snapshotPath');

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
  const dataSources = await fs.readdir(SNAPSHOT_PATH);
  await Promise.all(dataSources.map(async (dataSource) => {
    const timestamps = await fs.readdir(path.join(SNAPSHOT_PATH, dataSource));
    const timestampsToDelete = [...timestamps.sort()].slice(0, -2);
    await Promise.all(timestampsToDelete.map(async (timestamp) => {
      const filePath = path.join(SNAPSHOT_PATH, dataSource, timestamp);
      await fs.rm(filePath, {
        recursive: true, force: true,
      });
      log(`Removed old feed snapshot at ${filePath}`);
    }));
  }));
  log('Removed all feed snapshots except the last 2');
}

async function removeOldFeedSnapshotsAll() {
  await fs.rm(SNAPSHOT_PATH, {
    recursive: true, force: true,
  });
  log('Removed all feed snapshots');
}
