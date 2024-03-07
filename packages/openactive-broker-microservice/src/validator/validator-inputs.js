/**
 * Items are sent to the Validator Worker Pool (VWP) by saving them to files, which the VWP then reads and processes.
 *
 * The reason that they are sent as files, rather than, say maintained in memory, is so that there is a hard limit on
 * memory usage from queuing items to Validator.
 *
 * The potential worst case scenario is one in which Validator takes a long time to start the first time e.g. because
 * the OpenActive JSON-LD context is taking a long time to load.
 * If items are queued in memory, then, in this potential worst case scenario, the entire feed would be held in memory
 * waiting for validation.
 */
const fs = require('fs').promises;
const path = require('path');
const fsExtra = require('fs-extra');
const itertools = require('iter-tools');
const mkdirp = require('mkdirp');
const { ITEM_VALIDATION_MODE, VALIDATOR_INPUT_TMP_DIR } = require('../broker-config');

/**
 * A chunk length of 100 gives a memory usage by Validator Workers of roughly up to 4kb * 100 * <NUM CORES>.
 *
 * - A rough average size of medium-size (e.g. SessionSeries rather than ScheduledSession) OpenActive items
 *   (uncompressed) is about 2-4kb.
 * - So, with 8 cores, the memory usage will be roughly up to 4kb * 100 * 8 = 3.2MB, which is acceptable.
 * - To clarify, this is the memory usage of just holding this data in memory. This is not counting the additional
 *   memory usage required by validator's mechanisms.
 *
 * The flipside is that this results in a number of validator-input files created that is roughly:
 *
 * - <NUM UPDATED ITEMS IN FEEDS> / 100
 * - This would happen if validator took so long to run that all the input files accumulated before it had run even
 *   once.
 * - So, with 1M items (as a very high example!) in the feeds, this could result in 10,000 files. This also seems
 *   acceptably unlikely to cause issues (e.g. inode usage issues).
 */
const VALIDATOR_ITEMS_CHUNK_LENGTH = 100;

let validatorInputFilenameSequenceNum = 0;

/**
 * Call this before saving any Validator inputs.
 */
async function setUpValidatorInputs() {
  await mkdirp(VALIDATOR_INPUT_TMP_DIR);
  // Clear this directory of any files which may not have been cleaned up in a prior run
  await clearValidatorInputTmpDir();
}

/**
 * Call this after Validator Worker Pool has stopped.
 */
async function cleanUpValidatorInputs() {
  // Once validator has stopped, we may as well clean this directory to free up storage space
  await clearValidatorInputTmpDir();
}

/**
 * For a given page of items, split out those which are validatable (i.e. ignore deleted ones) into files and save
 * those files so that the Validator Worker Pool can read and process them.
 *
 * @param {string} feedContextIdentifier
 * @param {any[]} items RPDE items
 * @returns {Promise<number>} Number of items which have become queued for Validation
 */
async function createAndSaveValidatorInputsFromRpdePage(feedContextIdentifier, items) {
  const updatedItems = items.filter((item) => item.state === 'updated');
  /* When re-harvesting the feed frequently during development, this can speed up the process. However, note
  that leaving this on may allow Broker to miss some critical issues which will cause confusing errors later down
  the line */
  if (process.env.DEBUG_BROKER_NO_VALIDATE === 'true') {
    return updatedItems.length;
  }
  const validatorInputs = itertools.execPipe(updatedItems,
    itertools.map((item) => /** @type {import('./types').ValidatorWorkerRequestParsedItem} */({
      item: item.data,
      validationMode: ITEM_VALIDATION_MODE,
      feedContextIdentifier,
    })),
    /* Items are split into chunks so e.g. a page with 500 items will, with chunk length 100, be split into 5 files
    with 100 items each.

    Compared to saving the entire page as one input file to Validator Worker Pool, this ensures that:

    - There's a much tighter limit on memory usage from queueing items for validation, which is
      MAX_ITEM_SIZE * CHUNK_LENGTH * NUM_CORES.
        * Note that this memory limit could still become very high if item size is very high.
    - Multiple CPU cores will be used to validate items from a page.

    Compared to saving an input file for each item, this ensures that:

    - Not too many files are saved per second, which will impact performance due to rate of IO operations.
    - Not too many files overall are created, at which point we could hit inode limits, etc.
    */
    itertools.batch(VALIDATOR_ITEMS_CHUNK_LENGTH),
    itertools.map((chunkOfItems) => JSON.stringify([...chunkOfItems])),
    itertools.toArray);
  await Promise.all(validatorInputs.map(async (validatorInput) => {
    validatorInputFilenameSequenceNum += 1;
    await fs.writeFile(
      path.join(VALIDATOR_INPUT_TMP_DIR, `${validatorInputFilenameSequenceNum}.json`),
      validatorInput,
    );
  }));
  return updatedItems.length;
}

async function clearValidatorInputTmpDir() {
  await fsExtra.emptyDir(VALIDATOR_INPUT_TMP_DIR);
}

module.exports = {
  setUpValidatorInputs,
  cleanUpValidatorInputs,
  createAndSaveValidatorInputsFromRpdePage,
};
