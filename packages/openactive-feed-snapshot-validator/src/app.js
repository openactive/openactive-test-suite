const {
  first, flat, map, slice, toArray,
} = require('iter-tools');
const fs = require('fs/promises');
const path = require('path');
const _ = require('lodash');
const { z } = require('zod');

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

const RpdeItem = z.object({
  kind: z.string(),
  state: z.enum(['updated', 'deleted']),
  id: z.string(),
  modified: z.union([z.number(), z.string()]),
  data: z.string().optional(),
});

const FeedSnapshotPage = z.object({
  url: z.string(),
  items: z.array(RpdeItem),
});

const FeedSnapshot = z.object({
  isoTimestamp: z.string(),
  pages: z.array(FeedSnapshotPage),
});

async function start() {
  if (process.argv.length < 4) {
    console.log('Expected usage:');
    console.log();
    console.log('  node src/app.js <EARLIER SNAPSHOT DIRECTORY> <LATER SNAPSHOT DIRECTORY>');
    console.log();
    console.log('e.g.');
    console.log();
    console.log('  node src/app.js ../openactive-broker-microservice/feed_snapshots/https%3A%2F%2Freference-implementation.openactive.io%2Fopenactive/20221019_122804 ../openactive-broker-microservice/feed_snapshots/https%3A%2F%2Freference-implementation.openactive.io%2Fopenactive/20221020_173728');
    process.exit(1);
  }

  const earlierSnapshotDirectory = process.argv[2];
  const laterSnapshotDirectory = process.argv[3];

  // 1. What feeds are we comparing?
  const sharedFeedFileNames = await getSharedFeedFileNames(
    earlierSnapshotDirectory,
    laterSnapshotDirectory,
  );

  // 2. Run single-feed assertions
  for (const feedFileName of sharedFeedFileNames) {
    for (const snapshotDirectory of [earlierSnapshotDirectory, laterSnapshotDirectory]) {
      const feedData = await getFeedFileData(snapshotDirectory, feedFileName);
      runSingleFeedInstanceAssertions(feedData);
      console.log(`SINGLE-FEED PASS: ${getFeedFilePath(snapshotDirectory, feedFileName)}`);
    }
  }

  // 3. Snapshot comparison assertions
  for (const feedFileName of sharedFeedFileNames) {
    const earlierFeedData = await getFeedFileData(earlierSnapshotDirectory, feedFileName);
    const laterFeedData = await getFeedFileData(laterSnapshotDirectory, feedFileName);
    // We don't need to validate these files again as they were validated in the single-feed
    // assertions section
    checkModificationsArePushedToTheEndOfTheFeed(laterFeedData, earlierFeedData);
    console.log(`COMPARISON PASS: ${feedFileName}`);
  }
}

/**
 * @param {string} earlierSnapshotDirectory
 * @param {string} laterSnapshotDirectory
 * @returns {Promise<string[]>} e.g. ['FacilityUse.json', 'FacilityUseSlot.json'].
 *   The file names for each of the feed types that are in both snapshot directory A and B.
 */
async function getSharedFeedFileNames(earlierSnapshotDirectory, laterSnapshotDirectory) {
  const feedFileNamesA = await fs.readdir(earlierSnapshotDirectory);
  const feedFileNamesB = await fs.readdir(laterSnapshotDirectory);
  return _.intersection(feedFileNamesA, feedFileNamesB);
}

/**
 * @param {string} snapshotDirectory
 * @param {string} feedFileName
 */
async function getFeedFileData(snapshotDirectory, feedFileName) {
  const filePath = getFeedFilePath(snapshotDirectory, feedFileName);
  return JSON.parse(String(await fs.readFile(filePath)));
}

/**
 * @param {string} snapshotDirectory
 * @param {string} feedFileName
 */
function getFeedFilePath(snapshotDirectory, feedFileName) {
  return path.join(snapshotDirectory, feedFileName);
}

/**
 * @param {unknown} unvalidatedFeedSnapshot
 */
function runSingleFeedInstanceAssertions(unvalidatedFeedSnapshot) {
  const feedSnapshot = FeedSnapshot.parse(unvalidatedFeedSnapshot);
  checkRpdeOrder(feedSnapshot);
}

/**
 * Later snapshot comparison checks rely on the fact that RPDE order is valid in both snapshots.
 * So here we check that the RPDE order is indeed valid
 *
 * @param {z.infer<typeof FeedSnapshot>} feedSnapshot
 */
function checkRpdeOrder(feedSnapshot) {
  // Get initial comparison values from the 1st item
  const firstItem = first(getFeedSnapshotItemsIterator(feedSnapshot));
  if (!firstItem) { return; }
  let previousItem = firstItem;
  // Then compare each item to the previous
  for (const item of slice(1, getFeedSnapshotItemsIterator(feedSnapshot))) {
    if (!isItemAPastItemB(item, previousItem)) {
      // TODO elaborate these error messages lol
      throw new SnapshotComparisonError(`Item (ID: ${
        item.id
      }; Modified: ${
        item.modified
      }) is ordered incorrectly compared to the Previous Item (ID: ${
        previousItem.id
      }; Modified: ${previousItem.modified})`);
    }
    previousItem = item;
  }
}

// TODO TODO array of errors
/**
 * If an item is modified in any way (state change, data change, modified change), it should be
 * past the point of the last item in the previous feed.
 *
 * @param {z.infer<typeof FeedSnapshot>} latestFeedSnapshot
 * @param {z.infer<typeof FeedSnapshot>} previousFeedSnapshot
 */
function checkModificationsArePushedToTheEndOfTheFeed(latestFeedSnapshot, previousFeedSnapshot) {
  const previousFeedItems = toArray(getFeedSnapshotItemsIterator(previousFeedSnapshot));
  // There's nothing to check if there's nothing in the previous feed
  if (previousFeedItems.length === 0) {
    return;
  }
  const lastItemFromPreviousFeed = _.last(previousFeedItems);
  /* An item can technically appear multiple times within a feed. In which case only the last
  occurrence of that item is most accurate. This will happen automatically as `new Map(..)` will
  overwrite if it sees a duplicate key */
  const previousFeedItemsById = new Map(previousFeedItems.map((item) => [item.id, item]));
  for (const item of getFeedSnapshotItemsIterator(latestFeedSnapshot)) {
    const previousItem = previousFeedItemsById.get(item.id);
    // Just doing a deep equality test means that we also check for new items. If it's a new item,
    // `previousItem` will be `undefined`.
    if (!_.isEqual(item, previousItem) && !isItemAPastItemB(item, lastItemFromPreviousFeed)) {
      throw new SnapshotComparisonError(`Item (ID: ${item.id}) has been modified since the previous run but it wasn't moved to the front of the feed, meaning that a feed importer would not have been able to see the change. New item: ${JSON.stringify(item)}; Previous item: ${JSON.stringify(item)}`);
    }
  }
}

/**
 * @param {z.infer<typeof FeedSnapshot>} feedSnapshot
 * @returns {IterableIterator<z.infer<typeof RpdeItem>>}
 */
function getFeedSnapshotItemsIterator(feedSnapshot) {
  return flat(1, map((page) => page.items, feedSnapshot.pages));
}

/**
 * @param {z.infer<typeof RpdeItem>} itemA
 * @param {z.infer<typeof RpdeItem>} itemB
 */
function isItemAPastItemB(itemA, itemB) {
  return (itemA.modified > itemB.modified)
    || (itemA.modified === itemB.modified && itemA.id > itemB.id);
}

start();
