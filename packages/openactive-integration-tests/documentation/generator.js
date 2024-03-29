/* TODO fix this file so that it no longer needs to disable these rules:
https://github.com/openactive/openactive-test-suite/issues/648 */
/* eslint-disable no-use-before-define */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const chai = require('chai');
const jestConfig = require('../jest.config');
const defaultConfig = require('../../../config/default.json');
const { OpportunityCriteriaRequirements, SellerCriteriaRequirements } = require('../test/helpers/criteria-utils');
const { DefaultMap } = require('../test/helpers/map-utils');
const { FeatureJsonSchema } = require('./featureJson.js');

const FEATURES_ROOT = path.join(__dirname, '..', 'test', 'features');
const INDEX_README_FILE = path.join(FEATURES_ROOT, 'README.md');
const INDEX_FEATURE_REQUIREMENTS_JSON_FILE = path.join(FEATURES_ROOT, 'feature-requirements.json');
const INDEX_CATEGORIES_JSON_FILE = path.join(FEATURES_ROOT, 'categories.json');
const INDEX_TESTS_IMPLEMENTED_JSON_FILE = path.join(FEATURES_ROOT, 'tests-implemented.json');

/**
 * @typedef {import('../test/helpers/feature-helper').TestModuleExports} TestModuleExports
 * @typedef {import('../test/types/OpportunityCriteria').SellerCriteria} SellerCriteria
 * @typedef {import('./featureJson.js').FeatureJson} FeatureJson
 */

/**
 * @typedef {{
 *   [criteriaIdentifier: string]: number,
 * }} OpportunityCriteriaRequirementsObj
 *
 * @typedef {{
 *   _createdByDocumentationGeneratorScript: true,
 *   features: {
 *     [featureIdentifier: string]: {
 *       criteriaRequirements: {
 *         [sellerCriteria in SellerCriteria]?: OpportunityCriteriaRequirementsObj;
 *       };
 *       testInterfaceActionImplementationRequirements: string[];
 *     };
 *   };
 * }} FeatureRequirementsJson
 *
 * @typedef {{
 *   _createdByDocumentationGeneratorScript: true,
 *   categories: {
 *     [categoryIdentifier: string]: {
 *       [featureIdentifier: string]: true
 *     },
 *   },
 * }} CategoriesJson Note that the featureIdentifiers are stored as an object rather
 *   than an array. This is just a very simple way to express them as a "Set"-like
 *   object (i.e. no duplicates) in JSON.
 *   They can still easily be interpreted as an array with Object.keys().
 */

/**
 * @typedef {FeatureJson & {
 *   criteriaRequirement?: Map<string, number>,
 *   sellerCriteriaRequirements?: Map<string, Map<string, number>>,
 *   testInterfaceActionImplementationRequirements?: Set<string>,
 * }} FeatureMetadataItem
 *   - `criteriaRequirement`: `Map { [opportunityCriteria] => [numOpportunitiesRequired] }`
 *     e.g. `Map { 'TestOpportunityBookable' => 1 }`
 *   - `sellerCriteriaRequirements`: `Map { [sellerCriteria] => { [opportunityCriteria] => [numOpportunitiesRequired] } }`
 *   - `testInterfaceActionImplementationRequirements`: Test Interface Actions
 *     that need to be implemented for this feature to be tested.
 */

const FEATURES_NOT_REQUIRED_FOR_DEFAULT_JSON = new Set([
  /* Not required because the default behaviour allows for both opportunities
  which can and can not be cancelled */
  'customer-requested-cancellation-always-allowed',
  /* change-of-logistics-notification is also temporarily disabled while the
  Reference Implementation catches up to its new specification. */
  'change-of-logistics-notifications',
  // This is not required because it is mutually exclusive with multiple-sellers
  'single-seller',
]);

const rootDirectory = path.join(__dirname, '../');

// Stub global config
global.IMPLEMENTED_FEATURES = {};

console.log(rootDirectory);

// Workaround to enable chakram to load without test framework
// @ts-ignore ignoring this as it's a one-off workaround
global.afterEach = () => {};
global.documentationGenerationMode = true;

// Load metadata from all tests
const testMetadata = fg.sync(jestConfig.testMatch, { cwd: rootDirectory }).map(function (file) {
  console.log(`Reading: ${file}`);
  // TODO: Use code validation (e.g. with zod) to ensure that the data actually
  // conforms to the TestModuleExports type
  // ## Load the test
  const data = /** @type {TestModuleExports} */(require(`${rootDirectory}${file}`));
  // ## Validate the test metadata
  const expectedPath = `test/features/${renderFullTestPath(data)}`;
  chai.expect(expectedPath, `Expected ${file} to contain metadata matching its path`).to.equal(file);
  // All features in default.json should be true, with some exceptions
  const expectedValue = !FEATURES_NOT_REQUIRED_FOR_DEFAULT_JSON.has(data.testFeature);
  chai.expect(defaultConfig.integrationTests.implementedFeatures, `Expected default.json to contain feature '${data.testFeature} set to "${expectedValue}"'`).to.have.property(data.testFeature).to.equal(expectedValue);
  return data;
});

// Load feature.json files
/** @type {FeatureMetadataItem[]} */
const featureMetadata = fg.sync('**/test/features/**/feature.json', { cwd: rootDirectory }).map(function (file) {
  console.log(`Reading: ${file}`);
  const rawJson = require(`${rootDirectory}${file}`);
  return FeatureJsonSchema.parse(rawJson);
});

// Sort features so that required ones are first
featureMetadata.sort((a, b) => (a.required ? 0 : 1) - (b.required ? 0 : 1));

// Build summary of criteria required
for (const featureMetadataItem of featureMetadata) {
  const testMetadataThatAreWithinFeature = testMetadata.filter(t => t.testFeature === featureMetadataItem.identifier);
  // For each test in the feature, add up how many opportunities are required for
  // each opportunity criteria and each seller criteria.
  const criteriaRequirement = OpportunityCriteriaRequirements.combine(testMetadataThatAreWithinFeature.map(t => t.criteriaRequirement));
  const sellerCriteriaRequirements = SellerCriteriaRequirements.combine(testMetadataThatAreWithinFeature.map(t => t.sellerCriteriaRequirements));
  featureMetadataItem.criteriaRequirement = criteriaRequirement;
  featureMetadataItem.sellerCriteriaRequirements = sellerCriteriaRequirements;
  featureMetadataItem.testInterfaceActionImplementationRequirements = new Set();
  for (const t of testMetadataThatAreWithinFeature) {
    for (const action of (t.testInterfaceActions ?? [])) {
      featureMetadataItem.testInterfaceActionImplementationRequirements.add(action);
    }
  }
}

// Save implemented/not-implemented information to a machine-readable (JSON) file.
// This information includes which features have tests for which mode
// This file is used by certificate validator to know which features it expects to
// have tests available for
writeFileSetErrorExitCodeButDontThrowIfFails(
  INDEX_TESTS_IMPLEMENTED_JSON_FILE,
  renderTestsImplementedJson(testMetadata, featureMetadata),
);

// Save opportunity criteria requirements for each feature to a machine-readable (JSON)
// file.
// This file will be used by the test-data-generator script to help seed random
// mode tests.
writeFileSetErrorExitCodeButDontThrowIfFails(
  INDEX_FEATURE_REQUIREMENTS_JSON_FILE,
  renderFeatureRequirementsJson(featureMetadata),
);

// Save categories information to a machine-readable (JSON) file.
// This information includes which features are contained in which category.
// This file will be used by the test-data-generator script to help seed random
// mode tests when only testing for one category (e.g. core).
writeFileSetErrorExitCodeButDontThrowIfFails(
  INDEX_CATEGORIES_JSON_FILE,
  renderCategoriesJson(featureMetadata),
);

// Save a README.md at test/features which has a human-readable summary of all the
// features and the opportunity criteria required in order to run those features'
// tests.
writeFileSetErrorExitCodeButDontThrowIfFails(
  INDEX_README_FILE,
  renderFeatureIndex(featureMetadata),
);

// For each feature, save a summary README.md in its folder
featureMetadata.forEach((f) => {
  const filename = path.join(FEATURES_ROOT, f.category, f.identifier, 'README.md');
  writeFileSetErrorExitCodeButDontThrowIfFails(filename, renderFeatureReadme(f));
});

// # README rendering functions

/**
 * @param {FeatureMetadataItem[]} features
 */
function renderFeatureIndex(features) {
  return `
# Open Booking API Test Suite Feature Coverage

The test coverage below is [automatically generated](../../documentation), and indicates which features of the Open Booking API are currently covered by the test suite.

Stub tests are provided in many cases, and test coverage should not be regarded as exhaustive unless specified.

## Complete Test Coverage

The tests for these features cover all known edge cases, including both happy and unhappy paths.

| Category | Feature | Specification | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|----------|---------|---------------|-------------|-------------------|-------------------|
${features.filter(f => f.coverageStatus === 'complete').map(f => renderFeatureIndexFeatureFragment(f)).join('')}
${!features.some(f => f.coverageStatus === 'partial') ? '' : `
## Partial Test Coverage

The tests for these features provide partial coverage but do not include all known edgecases, and do not exercise all code paths and error conditions.

| Category | Feature | Specification | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|----------|---------|---------------|-------------|-------------------|-------------------|
${features.filter(f => f.coverageStatus === 'partial').map(f => renderFeatureIndexFeatureFragment(f)).join('')}`}

## No Test Coverage

The tests for these features are fully stubbed, and are not yet implemented.

| Category | Feature | Specification | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|----------|---------|---------------|-------------|-------------------|-------------------|
${features.filter(f => f.coverageStatus === 'none').map(f => renderFeatureIndexFeatureFragment(f)).join('')}

  `;
}

/**
 * @param {FeatureMetadataItem} f
 */
function renderFeatureIndexFeatureFragment(f) {
  return `| ${f.category} | ${f.name} ([${f.identifier}](./${f.category}/${f.identifier}/README.md)) | ${f.required ? 'Required' : 'Optional'}<br>[View Spec](${f.specificationReference}) | ${f.description} | ${renderCriteriaRequired(f.criteriaRequirement, '')} | ${renderTestInterfaceActionImplementationRequirements([...f.testInterfaceActionImplementationRequirements])} |
`;
}

/**
 * @param {FeatureMetadataItem} f
 */
function renderFeatureReadme(f) {
  const implementedTests = testMetadata.filter(t => (t.testFeature === f.identifier) && t.testFeatureImplemented);
  const notImplementedTests = testMetadata.filter(t => (t.testFeature === f.identifier) && !t.testFeatureImplemented);

  return `[< Return to Overview](../../README.md)
# ${f.name} (${f.identifier})

${f.description}
${f.explainer ? `\n${f.explainer}` : ''}${f.requiredCondition ? `\n${f.requiredCondition}` : ''}

${f.specificationReference}

Coverage Status: **${f.coverageStatus}**${f.links ? `\n\nSee also: ${f.links.map(l => `[${l.name}](${l.href})`).join(', ')}` : ''}
${renderCriteriaRequired(f.criteriaRequirement, `### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured \`bookableOpportunityTypesInScope\`) for the configured primary Seller in order to use \`useRandomOpportunities: true\`. Alternatively the following \`testOpportunityCriteria\` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for \`useRandomOpportunities: false\`.

`)}
${renderTestInterfaceActionImplementationRequirements([...f.testInterfaceActionImplementationRequirements], `### Test prerequisites - Test Interface Actions

The following Test Interface Actions must be implemented by the [test interface](https://openactive.io/test-interface/) of the booking system in order to test this feature (see the [Developer Docs guide for implementing Test Interface Actions](https://developer.openactive.io/open-booking-api/test-suite/implementing-the-test-interface/test-interface-actions)):

`)}

${f.coverageStatus !== 'none' ? `
### Running tests for only this feature

${'```'}bash
npm start -- --runInBand test/features/${f.category}/${f.identifier}/
${'```'}
` : '*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*'}

${implementedTests.length > 0 ? `
## 'Implemented' tests

${f.required
    ? 'This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:'
    : "Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:"}

${'```'}json
"implementedFeatures": {
  ...
  "${f.identifier}": true,
  ...
}
${'```'}

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
${implementedTests.map(t => renderFeatureTest(t)).join('')}` : ''}

${notImplementedTests.length > 0 ? `
## 'Not Implemented' tests

${!f.required ? `
Update \`default.json\` within \`packages/openactive-integration-tests/config/\` as follows to enable 'Not Implemented' testing for this feature:

${'```'}json
"implementedFeatures": {
  ...
  "${f.identifier}": false,
  ...
}
${'```'}
` : ''}
| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
${notImplementedTests.map(t => renderFeatureTest(t)).join('')}` : ''}`;
}

/**
 * @param {TestModuleExports} t
 */
function renderFeatureTest(t) {
  return `| [${t.testIdentifier}](./${renderFeatureTestPath(t)}) | ${t.testName} | ${t.testDescription} | ${renderCriteriaRequired(t.criteriaRequirement, '')} | ${renderTestInterfaceActionImplementationRequirements(t.testInterfaceActions ?? [])} |
`;
}

/**
 * @param {TestModuleExports} t
 */
function renderFeatureTestPath(t) {
  return `${t.testFeatureImplemented ? 'implemented' : 'not-implemented'}/${t.testIdentifier}-test.js`;
}

/**
 * @param {TestModuleExports} t
 */
function renderFullTestPath(t) {
  return `${t.testCategory}/${t.testFeature}/${renderFeatureTestPath(t)}`;
}

/**
 * @param {Map<string, number>} criteriaRequired
 * @param {string} [prefixOverride] If provided, this prefix is used rather than the default
 */
function renderCriteriaRequired(criteriaRequired, prefixOverride) {
  if (criteriaRequired.size === 0) {
    return '';
  }
  const prefix = prefixOverride !== undefined ? prefixOverride : '\nPrerequisite opportunities per Opportunity Type: ';
  return `${prefix}${Array.from(criteriaRequired.entries()).map(([key, value]) => (
    `[${key}](https://openactive.io/test-interface#${key}) x${value}`
  )).join(', ')}`;
}

/**
 * @param {string[] | undefined} testInterfaceActions e.g.
 *   `['test:AccessChannelUpdateSimulateAction']`
 * @param {string} [prefix] If provided, this prefix will be rendered before the
 *   test interface actions, if there are any.
 */
function renderTestInterfaceActionImplementationRequirements(testInterfaceActions, prefix = '') {
  if (!testInterfaceActions || testInterfaceActions.length === 0) {
    return '';
  }
  const sorted = [...testInterfaceActions].sort();
  const result = sorted.map((r) => {
    const nonPrefixed = r.replace(/^test:/, '');
    return `[${nonPrefixed}](https://openactive.io/test-interface#${nonPrefixed})`;
  }).join(', ');
  return `${prefix}${result}`;
}

// # JSON rendering functions

/**
 * @param {FeatureMetadataItem[]} features
 */
function renderFeatureRequirementsJson(features) {
  /** @type {FeatureRequirementsJson} */
  const obj = {
    _createdByDocumentationGeneratorScript: true,
    features: Object.fromEntries(features.map(feature => ([
      feature.identifier,
      {
        criteriaRequirements: renderFeatureCriteriaRequirements(feature),
        testInterfaceActionImplementationRequirements: [
          ...feature.testInterfaceActionImplementationRequirements,
        ],
      },
    ]))),
  };
  return JSON.stringify(obj, null, 2);
}

/**
 * @param {FeatureMetadataItem} feature
 * @returns {FeatureRequirementsJson['features'][string]['criteriaRequirements']}
 */
function renderFeatureCriteriaRequirements(feature) {
  return Object.fromEntries(Array.from(feature.sellerCriteriaRequirements).map(([sellerCriteria, tallyByCriteria]) => ([
    sellerCriteria,
    Object.fromEntries(tallyByCriteria),
  ])));
}

/**
 * @param {FeatureMetadataItem[]} features
 */
function renderCategoriesJson(features) {
  // This is just a map so that we can use DefaultMap (i.e. programmer laziness)
  const categoriesMap = new DefaultMap(() => /** @type {CategoriesJson['categories'][string]} */({}));
  for (const feature of features) {
    const categoryFeatures = categoriesMap.get(feature.category);
    categoryFeatures[feature.identifier] = true;
  }
  /** @type {CategoriesJson} */
  const obj = {
    _createdByDocumentationGeneratorScript: true,
    categories: Object.fromEntries(categoriesMap),
  };
  return JSON.stringify(obj, null, 2);
}

function renderTestsImplementedJson(tests, features) {
  const featureMap = {};
  for (const f of features) {
    featureMap[f.identifier] = {
      implementedTestFiles: tests.filter(t => (t.testFeature === f.identifier) && t.testFeatureImplemented).length,
      notImplementedTestFiles: tests.filter(t => (t.testFeature === f.identifier) && !t.testFeatureImplemented).length,
    };
  }
  const obj = {
    _createdByDocumentationGeneratorScript: true,
    features: featureMap,
  };
  return JSON.stringify(obj, null, 2);
}

// # Utils

/**
 * @param {string} filePath
 * @param {string} contents
 */
function writeFileSetErrorExitCodeButDontThrowIfFails(filePath, contents) {
  fs.writeFile(filePath, contents, (err) => {
    if (err) {
      // The script is allowed to continue writing other files, but it will exit
      // with an error code.
      process.exitCode = 1;
      console.error(`ERROR SAVING FILE (${filePath}):`, err);
    } else {
      console.info(`FILE SAVED: ${filePath}`);
    }
  });
}
