// TODO TODO this package needs TS/ESLint
const {
  first, flat, map, slice, toArray,
} = require('iter-tools');
const fs = require('fs-extra');
const path = require('path');
const { z } = require('zod');
const _ = require('lodash');
const { last } = require('lodash');

const fsp = fs.promises;
const FEED_SNAPSHOTS_PATH = path.join(__dirname, '..', 'openactive-broker-microservice', 'feed_snapshots');

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

// const RpdeItemType = z.object({
//   kind: z.string(),
//   state: z.enum(['updated','deleted']),
//   id: z.string(),
//   // TODO TODO this can also be string
//   modified: z.number(),
//   data: z.string().optional(),
// })
// const SingleFeedInstanceType = z.record(z.array(RpdeItemType));

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

        // TODO find a name for this thing
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
  for (const [pairKeyName, filePaths] of pairedFeeds) {
    // TODO TODO do we want to be constrained to latest/previous or be more flexible?
    // Either way, commit
    // - It might be safer to just have timestamps
    const latestFileName = filePaths.find((p) => p.includes('latest'));
    const previousFileName = filePaths.find((p) => p.includes('previous'));

    const latestFileData = JSON.parse(await fsp.readFile(latestFileName));
    const previousFileData = JSON.parse(await fsp.readFile(previousFileName));
    // We don't need to validate these files again as they were validated in the single-feed
    // assertions section

    checkModificationsArePushedToTheEndOfTheFeed(latestFileData, previousFileData);
    // const errors = await checkUnmodifiedItemsAreEqual(latestFileData, previousFileData);
    // if (errors.length != 0) {
    //   console.log(errors);
    // } else {
    console.log(`WooGoo ${pairKeyName} is valid`);
    // }
  }
}

/**
 * @param {unknown} unvalidatedFeedSnapshot
 */
function runSingleFeedInstanceAssertions(unvalidatedFeedSnapshot) {
  // try {
  //   // Validate
  const feedSnapshot = FeedSnapshot.parse(unvalidatedFeedSnapshot);
  // } catch (error) {
  //   const a = error;
  //   console.error('runSingleFeedInstanceAssertions() - ERROR', a.issues);
  // }
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
  const lastItemFromPreviousFeed = last(previousFeedItems);
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
