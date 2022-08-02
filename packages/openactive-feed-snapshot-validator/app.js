const fs = require('fs-extra');
const fsp = fs.promises;
const path = require('path');
const FEED_SNAPSHOTS_PATH = path.join(__dirname, '..', 'openactive-broker-microservice', 'feed_snapshots');
const {z} =  require('zod');
const _ = require('lodash');

class SnapshotComparisonError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super();
    this.details = [{ message }];
  }
}
SnapshotComparisonError.prototype.name = 'SnapshotComparisonError';

const RpdeItemType = z.object({
  kind: z.string(),
  state: z.enum(['updated','deleted']),
  id: z.string(),
  modified: z.number(),
  data: z.string().optional(),
})
const SingleFeedInstanceType = z.record(z.array(RpdeItemType));

const pairedFeeds = new Map();
async function start() {
  console.log(__dirname);
  // Single feed instance assertions
  for (const dataSource of await fsp.readdir(FEED_SNAPSHOTS_PATH)) {
    for (const feedInstance of await fsp.readdir(`${FEED_SNAPSHOTS_PATH}/${dataSource}`)) {
      for (const feedFileName of await fsp.readdir(`${FEED_SNAPSHOTS_PATH}/${dataSource}/${feedInstance}`)) {
        // Run single feed instance assertion
        const feedData = JSON.parse(await fsp.readFile(`${FEED_SNAPSHOTS_PATH}/${dataSource}/${feedInstance}/${feedFileName}`));
        runSingleFeedInstanceAssertions(feedData);
        console.log('VALID')

        const pairKeyName = `${dataSource}-${feedFileName}`;
        if (pairedFeeds.has(pairKeyName)) {
          const pair = pairedFeeds.get(pairKeyName);
          pair.push(`${FEED_SNAPSHOTS_PATH}/${dataSource}/${feedInstance}/${feedFileName}`);
          pairedFeeds.set(pairKeyName, pair);
        } else {
          pairedFeeds.set(pairKeyName, [`${FEED_SNAPSHOTS_PATH}/${dataSource}/${feedInstance}/${feedFileName}`] );
        }
      }
    }
  }

  // Snapshot comparison assertions
  for (const [pair, pairKeyName] of pairedFeeds) {
    const latestFileName = pair.find((path) => path.includes('latest'));
    const previousFileName =  pair.find((path) => path.includes('previous'));

    const latestFileData = JSON.parse(await fsp.readFile(latestFileName));
    const previousFileData = JSON.parse(await fsp.readFile(previousFileName));

    const errors = await checkUnmodifiedItemsAreEqual(latestFileData, previousFileData);
    if (errors.length != 0) {
      console.log(errors);
    } else {
      console.log(`WooGoo ${pairKeyName} is valid`)
    }
  }
}

function runSingleFeedInstanceAssertions(feedInstance) {
  try {
    // Validate
    SingleFeedInstanceType.parse(feedInstance);
  } catch (error) {
    const a = error;
    console.log(a.issues)
    }
}

/**
 * 
 * @param {z.infer<typeof SingleFeedInstanceType>} latestFileData 
 * @param {z.infer<typeof SingleFeedInstanceType>} previousFileData 
 * @returns 
 */
async function checkUnmodifiedItemsAreEqual(latestFileData, previousFileData) {
  const latestAllItems = _.flatten(Object.values(latestFileData));
  const previousAllItems = _.flatten(Object.values(previousFileData));
  const errors = [];

  for (const previousItem of previousAllItems) {
    const idMatch = latestAllItems.find(latestItem => latestItem.id === previousItem.id);
    if (_.isNil(idMatch)) {
      // If an item existed in the previous feed but not in the latest feed, it MUST have had a state = 'deleted' in the
      // previous feed
      if (previousItem.state !== 'deleted') {
        errors.push(new SnapshotComparisonError(`Item with id: ${previousItem.id} was not found in the latest snapshot`));
        continue;
      }
    }

    if (previousItem.modified === idMatch.modified) {
      if (previousItem.state !== idMatch.state) {
        errors.push(new SnapshotComparisonError(`Item with id: ${previousItem.id} has changed state without the modified (${previousItem.modified}) changing.`));
        continue;
      }
      if (previousItem.data !== idMatch.data) {
        errors.push(new SnapshotComparisonError(`Item with id ${previousItem.id} has the same id and modified as an item found in the latest snapshot, but they do have the same data`));
        continue;
      }
    }
  }


  // for (const latestItem of latestAllItems) {
  //   const idMatch = previousAllItems.find(previousItem => previousItem.id === latestItem.id);
  //   if (_.isNil(idMatch)) {
  //     if la
  //   }
  // }

  return errors;
}

start();