/* eslint-disable no-unused-vars */
const path = require('path');
const { isMainThread, parentPort, workerData } = require('worker_threads');
const fg = require('fast-glob');
const importFresh = require('import-fresh');
const jestConfig = require('../../jest.config');

const rootDirectory = path.join(__dirname, '../../');

/**
 * This worker mocks all test suite tests, to determine which would run in a given configuration
 *
 * Note this worker is NOT async as it temporarily manipulates the global object,
 * and is designed to terminate cleanly on completion
 */

if (isMainThread) {
  throw new Error('The worker must not be run in the main thread, as it severely mutates global variables.');
}

const { implementedFeatures, opportunityTypesInScope, bookingFlowsInScope } = workerData;

const suiteRegistry = new Map();

const globalMocks = {
  // Stubs to allow test suites to load
  beforeEach: () => {},
  afterEach: () => {},
  afterAll: () => {},
  beforeAll: () => {},
  testState: { on: () => {} },
  test: { todo: () => {} },

  // Basic stub of `describe()` that only maintains ancestorTitles for getFullName()
  describe(label, fn) {
    if (this.ancestorTitles === undefined) this.ancestorTitles = [];
    this.getFullName = () => this.ancestorTitles.join(' ');
    this.ancestorTitles.push(label);
    fn.bind(this)();
    this.ancestorTitles.pop();
  },

  // Basic stub of `it()` to record each spec name
  it(label, fn) {
    if (!this.certificateMetaLocalPath) {
      throw new Error("Test suite error: 'it' exists before logger was instantiated");
    }
    const specName = this.ancestorTitles.join(',');

    if (!suiteRegistry.has(this.certificateMetaLocalPath)) suiteRegistry.set(this.certificateMetaLocalPath, new Map());
    const specRegistry = suiteRegistry.get(this.certificateMetaLocalPath);

    if (!specRegistry.has(specName)) specRegistry.set(specName, []);
    specRegistry.get(specName).push(label);
  },

  // Temporary overrides for feature configuration
  BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE: opportunityTypesInScope,
  BOOKING_FLOWS_IN_SCOPE: bookingFlowsInScope,
  IMPLEMENTED_FEATURES: implementedFeatures,
  USE_RANDOM_OPPORTUNITIES: true, // Do not generate 'test-interface' tests
  SELLER_CONFIG: { primary: { '@id': 'mock', taxMode: 'https://openactive.io/TaxGross' }, secondary: { '@id': 'mock', taxMode: 'https://openactive.io/TaxNet' } },
};

// Set up global mocks
Object.entries(globalMocks).forEach(([key, value]) => {
  global[key] = value;
});

// Load all test suites using the mocks defined above, to populate the suiteRegistry
fg.sync(jestConfig.testMatch, { cwd: rootDirectory }).forEach(function (file) {
  importFresh(`${rootDirectory}${file}`);
});

// Convert maps to objects for easy comparison
suiteRegistry.forEach((v, k) => suiteRegistry.set(k, Object.fromEntries(v)));

// Return suiteRegistry to the main thread
parentPort.postMessage(suiteRegistry);

// Thread terminates after processing is complete, and is not reused.
// As the global state is left mutated, this worker should never be reused.
