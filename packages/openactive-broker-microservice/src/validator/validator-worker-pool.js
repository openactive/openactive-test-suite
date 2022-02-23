/**
 * TODO TODO doc
 */
const { execPipe, take, toArray, map } = require('iter-tools');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const R = require('ramda');
const { Worker } = require('worker_threads');
const { VALIDATOR_INPUT_TMP_DIR } = require('../broker-config');

/**
 * @typedef {import('./validator-worker').ValidatorWorkerResponse} ValidatorWorkerResponse
 */

const TIME_TO_WAIT_IF_NO_INPUTS_MS = 1000;
const MAX_NUM_EXAMPLES_PER_VALIDATION_RESULT = 5;

const numCpus = os.cpus().length;
const numWorkers = numCpus;
const workerFileName = path.join(__dirname, 'validator-worker.js');

const validatorInputFileNameComparator = R.ascend(getValidatorInputFileNameSequenceNumber);

/**
 * @typedef {(numItems: number) => void} OnValidateItemsCallback
 */

class ValidatorWorkerPool {
  /**
   * @param {number} validatorTimeoutMs Validator stops when:
   *   - the feed has finished harvesting
   *   - AND the timeout has run out.
   */
  constructor(validatorTimeoutMs) {
    /**
     * @type {Map<string, {
     *   path: string;
     *   message: string;
     *   occurrences: number;
     *   examples: any[];
     * }>}
     */
    this._validationResults = new Map();
    // TODO TODO doc this
    /** @type {(any) => void} */
    this._hasFinishedHarvestingAndAwaitingCompletionResolve = null;
    // this._onValidateItems = onValidateItems;
    /**
     * [feedContextIdentifier] -> OnValidateItemsCallback
     *
     * A map of callbacks for each feed context.
     *
     * A feed context's callback is called whenever items in that feed are validated
     *
     * @type {Map<string, OnValidateItemsCallback>}
     */
    this._onValidateItemsCallbacks = new Map();
    this._endTime = (new Date()).getTime() + validatorTimeoutMs;
  }

  /**
   * @param {string} feedContextIdentifier
   * @param {OnValidateItemsCallback} onValidateItemsCallback
   */
  setOnValidateItems(feedContextIdentifier, onValidateItemsCallback) {
    this._onValidateItemsCallbacks.set(feedContextIdentifier, onValidateItemsCallback);
  }

  stop() {
    return new Promise((resolve) => {
      this._hasFinishedHarvestingAndAwaitingCompletionResolve = resolve;
    });
  }

  getValidationResults() {
    return this._validationResults;
  }

  /**
   * TODO TODO doc
   *
   * You probably don't want to `await` this. The await will finish at a rather arbitrary time which is after
   * the first iteration.
   */
  async run() {
    // Timeout validation
    if (this._hasFinishedHarvestingAndAwaitingCompletionResolve && (new Date().getTime() >= this._endTime)) {
      this._hasFinishedHarvestingAndAwaitingCompletionResolve();
      return;
    }
    // Get a batch of files to validate
    const allFileNames = await fs.readdir(VALIDATOR_INPUT_TMP_DIR);
    if (allFileNames.length === 0) {
      // If we've finished harvesting and there are no validator inputs left, we've finished.
      if (this._hasFinishedHarvestingAndAwaitingCompletionResolve) {
        this._hasFinishedHarvestingAndAwaitingCompletionResolve();
        return;
      }
      // Otherwise, we'll check again in a bit
      setTimeout(() => this.run(), TIME_TO_WAIT_IF_NO_INPUTS_MS);
      return;
    }
    allFileNames.sort(validatorInputFileNameComparator);
    const filePaths = execPipe(allFileNames,
      take(numWorkers),
      map((fileName) => path.join(VALIDATOR_INPUT_TMP_DIR, fileName)),
      toArray);
    // Farm off to workers to validate
    await Promise.all(filePaths.map((filePath) => (
      this._validateFileWithWorker(filePath))));
    // Remove now validated files
    await Promise.all(filePaths.map(async (filePath) => {
      await fs.rm(filePath, {
        force: true,
      });
    }));
    // Check again immediately
    setImmediate(() => this.run());
  }

  /**
   * @param {string} filePath
   */
  async _validateFileWithWorker(filePath) {
    const fileData = await fs.readFile(filePath);
    const worker = new Worker(workerFileName, {
      workerData: fileData.toString(),
    });
    await new Promise((resolve, reject) => {
      worker.on('message', (/** @type {ValidatorWorkerResponse} */message) => {
        /*  */
        for (const { opportunityId, error } of message.errors) {
          this._processValidationError(opportunityId, error);
        }
        // Inform Broker that some items have been validated (so it can update its progress bars)
        for (const [feedContextIdentifier, numItems] of Object.entries(message.numItemsPerFeed)) {
          this._onValidateItems(feedContextIdentifier, numItems);
        }
        resolve();
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  /**
   * @param {string} feedContextIdentifier
   * @param {number} numItems
   */
  _onValidateItems(feedContextIdentifier, numItems) {
    const callback = this._onValidateItemsCallbacks.get(feedContextIdentifier);
    if (!callback) {
      throw new Error(`No onValidateItems callback set for "${feedContextIdentifier}" feed. Remember to call \`setOnValidateItems\` for this feed`);
    }
    callback(numItems);
  }

  /**
   * Prepare validation results for eventual render. This involves a compression, which is essential to make the
   * results readable and to minimise memory usage, as there can be a vast number of errors.
   *
   * @param {string} opportunityId
   * @param {any} validationError
   */
  _processValidationError(opportunityId, validationError) {
    // Use the first line of the error message to uniquely identify it
    const errorShortMessage = validationError.message.split('\n')[0];
    const errorKey = `${validationError.path}: ${errorShortMessage}`;

    // Create a new entry if this is a new error
    let currentValidationResults = this._validationResults.get(errorKey);
    if (!currentValidationResults) {
      currentValidationResults = {
        path: validationError.path,
        message: errorShortMessage,
        occurrences: 0,
        examples: [],
      };
      this._validationResults.set(errorKey, currentValidationResults);
    }

    // Keep track of examples of each error, with a preference for newer ones (later in the feed)
    currentValidationResults.occurrences += 1;
    currentValidationResults.examples.unshift(opportunityId);
    if (currentValidationResults.examples.length > MAX_NUM_EXAMPLES_PER_VALIDATION_RESULT) {
      currentValidationResults.examples.pop();
    }
  }
}

/**
 * @param {string} fileName
 */
function getValidatorInputFileNameSequenceNumber(fileName) {
  return Number(path.basename(fileName, '.json'));
}

module.exports = {
  ValidatorWorkerPool,
};
