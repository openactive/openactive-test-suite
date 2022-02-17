const { computeNumbers, getResults } = require('./workerThreadsMain');

(async () => {
  console.log('main1');
  await computeNumbers(50, 100);
  console.log('main2');
  // await computeNumbers(10);
  // await computeNumbers(10);
  // console.log('main3');
  // await computeNumbers(10);
  // console.log('main4');
  console.log('results:', getResults());
})();

/*

# Validator worker pool

globalState:

* validationResults
* isRunning (bool)

1. if (!isRunning) { return; }
2. Check TMP_DIR for any files
  - If no files, setTimeout back into the loop (in 1 second(?))
3. Get the first <CPUS> of the files (which are named `<SEQUENCE NUMBER>.json`)
4. Call Worker(.., { workerData: await fs.readFile(filePath) })
  - on('message', ..)
    1. Takes an array of validationResults
    2. Processes them in the same way as validateAndStoreValidationResults, which prepares them for rendering
    3. Saves them to its internal state
    4. Runs onValidate callback for each feedContextIdentifier. This looks like:
      onValidate(feedContextIdentifier, numItems)
5. After all workers have finished, setImmediate back into the loop

terminate()

1. Set globalState.isRunning = false

# Validator worker

1. Receives a JSON blob
2. Parse it (it'll be an array of `{ validationMode: <..>, item: <..>, feedContextIdentifier: <..> }`s)
3. Validate each
4. postMessage({ validationResults, numItemsPerFeed: { [feedContextIdentifier: string]: number }})

# Broker Main

Where we now say `await validator.validateItem(..)`:

1. Split the RPDE page into item slices of, say, 10 items each
2. Save items to TMP_DIR (as <SEQUENCE NUMBER>.json)
3. context.totalItemsQueuedForValidation += page.items.length

*/
