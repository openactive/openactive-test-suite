const { first, flat, objectValues, slice } = require('iter-tools');
const fs = require('fs-extra');
const fsp = fs.promises;
const path = require('path');
const FEED_SNAPSHOTS_PATH = path.join(__dirname, '..', 'openactive-broker-microservice', 'feed_snapshots');
const { z } =  require('zod');
const _ = require('lodash');

class SnapshotComparisonError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.details = [{ message }];
  }
}
SnapshotComparisonError.prototype.name = 'SnapshotComparisonError';

const RpdeItemType = z.object({
  kind: z.string(),
  state: z.enum(['updated','deleted']),
  id: z.string(),
  // TODO TODO this can also be string
  modified: z.number(),
  data: z.string().optional(),
})
const SingleFeedInstanceType = z.record(z.array(RpdeItemType));

// TODO TODO document this
/**
 * @type {Map<string, string[]>}
 */
const pairedFeeds = new Map();
async function start() {
  console.log(__dirname);
  // Single feed instance assertions
  for (const dataSource of await fsp.readdir(FEED_SNAPSHOTS_PATH)) {
    // `latest` or `previous
    for (const feedInstance of await fsp.readdir(`${FEED_SNAPSHOTS_PATH}/${dataSource}`)) {
      // e.g. `FacilityUse.json`
      for (const feedFileName of await fsp.readdir(`${FEED_SNAPSHOTS_PATH}/${dataSource}/${feedInstance}`)) {
        // Run single feed instance assertion
        const filePath = `${FEED_SNAPSHOTS_PATH}/${dataSource}/${feedInstance}/${feedFileName}`;
        const feedData = JSON.parse(await fsp.readFile(filePath));
        runSingleFeedInstanceAssertions(feedData);
        console.log('VALID, single-feed:', filePath);

        const pairKeyName = `${dataSource}-${feedFileName}`;
        if (!pairedFeeds.has(pairKeyName)) {
          pairedFeeds.set(pairKeyName, []);
        }
        pairedFeeds.get(pairKeyName).push(filePath);
      }
    }
  }
  console.log(pairedFeeds);

  // Snapshot comparison assertions
  for (const [pairKeyName, pair] of pairedFeeds) {
    // TODO TODO do we want to be constrained to latest/previous or be more flexible? Either way, commit
    // - It might be safer to just have timestamps
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

/**
 * @param {unknown} unvalidatedFeedInstance
 */
function runSingleFeedInstanceAssertions(unvalidatedFeedInstance) {
  // try {
  //   // Validate
  const feedInstance = SingleFeedInstanceType.parse(unvalidatedFeedInstance);
  // } catch (error) {
  //   const a = error;
  //   console.error('runSingleFeedInstanceAssertions() - ERROR', a.issues);
  // }
  checkRpdeOrder(feedInstance);
}

/**
 * Later snapshot comparison checks rely on the fact that RPDE order is valid in both snapshots.
 * So here we check that the RPDE order is indeed valid
 *
 * @param {z.infer<typeof SingleFeedInstanceType>} feedSnapshot
 */
function checkRpdeOrder(feedSnapshot) {
  const getItemsIter = () => flat(1, objectValues(feedSnapshot));
  // Get initial comparison values from the 1st item
  const firstItem = first(getItemsIter());
  if (!firstItem) { return; }
  let lastId = firstItem.id;
  let lastModified = firstItem.modified;
  // Then compare each item to the previous
  for (const item of slice(1, getItemsIter())) {
    if (
      (item.modified < lastModified)
      || (item.modified === lastModified && item.id <= lastId)
    ) {
      // TODO elaborate these error messages lol
      throw new SnapshotComparisonError(`Item (ID: ${
        item.id
      }; Modified: ${
        item.modified
      }) is ordered incorrectly compared to the Previous Item (ID: ${
        lastId
      }; Modified: ${lastModified})`)
    }
    lastId = item.id;
    lastModified = item.modified;
  }
}

/**
 * @param {z.infer<typeof SingleFeedInstanceType>} latestFileData 
 * @param {z.infer<typeof SingleFeedInstanceType>} previousFileData 
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

/**
 * If an item is modified in any way (state change, data change, modified change), it should be
 * past the point of the last item in the previous feed.
 *
 * @param {z.infer<typeof SingleFeedInstanceType>} latestFeedSnapshot
 * @param {z.infer<typeof SingleFeedInstanceType>} previousFeedSnapshot
 */
function checkModificationsArePushedToTheEndOfTheFeed(latestFeedSnapshot, previousFeedSnapshot) {
}

start();