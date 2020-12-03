// TODO fix this file so that it no longer needs to disable these rules
/* eslint-disable no-use-before-define */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const fg = require('fast-glob');
const fs = require('fs');
const chai = require('chai');
const path = require('path');
const pkg = require('../package.json');
const defaultConfig = require('../../../config/default.json');
const { OpportunityCriteriaRequirements, SellerCriteriaRequirements } = require('../test/helpers/criteria-utils');

const FEATURES_ROOT = path.join(__dirname, '..', 'test', 'features');
const INDEX_README_FILE = path.join(FEATURES_ROOT, 'README.md');
const INDEX_CRITERIA_REQUIREMENTS_JSON_FILE = path.join(FEATURES_ROOT, 'criteria-requirements.json');

/**
 * @typedef {import('../test/helpers/feature-helper').TestModuleExports} TestModuleExports
 * @typedef {import('../test/types/OpportunityCriteria').SellerCriteria} SellerCriteria
 */

/**
 * @typedef {{
 *   [criteriaIdentifier: string]: number,
 * }} OpportunityCriteriaRequirementsObj
 *
 * @typedef {{
 *   _createdByDocumentationGeneratorScript: true,
 *   criteriaRequirements: {
 *     [featureIdentifier: string]: {
 *       [sellerCriteria in SellerCriteria]?: OpportunityCriteriaRequirementsObj;
 *     },
 *   },
 * }} CriteriaRequirementsJson
 */

/**
 * @typedef {object} FeatureJsonLink
 * @property {string} name
 * @property {string} href
 */

/**
 * @typedef {object} FeatureJson The shape of data in feature.json files.
 * @property {string} category
 * @property {string} identifier
 * @property {string} name
 * @property {string} description
 * @property {string} explainer
 * @property {string} specificationReference URL reference to a section of the Open Booking API
 * @property {boolean} required Is it required for an implementation to implement this feature?
 * @property {'none' | 'partial' | 'complete'} coverageStatus How much test coverage has been written for this feature
 * @property {string} [requiredCondition] Description of when this feature is required
 * @property {FeatureJsonLink[]} [links]
 */

/**
 * @typedef {FeatureJson & {
 *   criteriaRequirement?: Map<string, number>,
 *   sellerCriteriaRequirements?: Map<string, Map<string, number>>,
 * }} FeatureMetadataItem
 */

const rootDirectory = path.join(__dirname, '../');

// Stub global config
global.IMPLEMENTED_FEATURES = {};

console.log(rootDirectory);

// Workaround to enable chakram to load without test framework
// @ts-ignore ignoring this as it's a one-off workaround
global.afterEach = () => {};
global.documentationGenerationMode = true;

// Load metadata from all tests
const testMetadata = fg.sync(pkg.jest.testMatch, { cwd: rootDirectory }).map(function (file) {
  console.log(`Reading: ${file}`);
  // TODO: Verify that the data actually conforms to the type.
  // ## Load the test
  const data = /** @type {TestModuleExports} */(require(`${rootDirectory}${file}`));
  // ## Validate the test metadata
  const expectedPath = `test/features/${renderFullTestPath(data)}`;
  chai.expect(expectedPath, `Expected ${file} to contain metadata matching its path`).to.equal(file);
  chai.expect(defaultConfig.integrationTests.implementedFeatures, `Expected default.json to contain feature '${data.testFeature} set to "true"'`).to.have.property(data.testFeature).to.equal(true);
  return data;
});

// Load feature.json files
/** @type {FeatureMetadataItem[]} */
const featureMetadata = fg.sync('**/test/features/**/feature.json', { cwd: rootDirectory }).map(function (file) {
  console.log(`Reading: ${file}`);
  // TODO: Verify that the data actually conforms to the type.
  return /** @type {FeatureJson} */(require(`${rootDirectory}${file}`));
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
}

// Save opportunity criteria requirements for each future to a machine-readable (JSON)
// file.
// This file will be used by the test-data-generator script to help seed random
// mode tests.
writeFileSetErrorExitCodeButDontThrowIfFails(
  INDEX_CRITERIA_REQUIREMENTS_JSON_FILE,
  renderCriteraRequirementsJson(featureMetadata),
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

| Category | Feature | Specification | Description | Prerequisites per Opportunity Type |
|----------|---------|---------------|-------------|-------------------|
${features.filter(f => f.coverageStatus === 'complete').map(f => renderFeatureIndexFeatureFragment(f)).join('')}

## Partial Test Coverage

The tests for these features provide partial coverage but do not include all known edgecases, and do not exercise all code paths and error conditions.

| Category | Feature | Specification | Description | Prerequisites per Opportunity Type |
|----------|---------|---------------|-------------|-------------------|
${features.filter(f => f.coverageStatus === 'partial').map(f => renderFeatureIndexFeatureFragment(f)).join('')}

## No Test Coverage

The tests for these features are fully stubbed, and are not yet implemented.

| Category | Feature | Specification | Description | Prerequisites per Opportunity Type |
|----------|---------|---------------|-------------|-------------------|
${features.filter(f => f.coverageStatus === 'none').map(f => renderFeatureIndexFeatureFragment(f)).join('')}

  `;
}

/**
 * @param {FeatureMetadataItem} f
 */
function renderFeatureIndexFeatureFragment(f) {
  return `| ${f.category} | ${f.name} ([${f.identifier}](./${f.category}/${f.identifier}/README.md)) | [${f.required ? 'Required' : 'Optional'}](${f.specificationReference}) | ${f.description} | ${renderCriteriaRequired(f.criteriaRequirement, '')} |
`;
}

// TODO - unused function - delete if not needed
// function renderFeatureIndexFeatureFragmentOld(f) {
//   return `
// #### ${f.name} ([${f.identifier}](./${f.category}/${f.identifier}/README.md))

// ${f.description}

// ${f.specificationReference}
// ${renderCriteriaRequired(f.criteriaRequirement)}

// `;
// }

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
${renderCriteriaRequired(f.criteriaRequirement, `### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured \`bookableOpportunityTypesInScope\`) for the configured primary Seller in order to use \`useRandomOpportunities: true\`. Alternatively the following \`testOpportunityCriteria\` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for \`useRandomOpportunities: false\`.

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

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
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
| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
${notImplementedTests.map(t => renderFeatureTest(t)).join('')}` : ''}`;
}

/**
 * @param {TestModuleExports} t
 */
function renderFeatureTest(t) {
  return `| [${t.testIdentifier}](./${renderFeatureTestPath(t)}) | ${t.testName} | ${t.testDescription} | ${renderCriteriaRequired(t.criteriaRequirement, '')} |
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
  return `${prefix}${Array.from(criteriaRequired.entries()).map(([key, value]) => `[${key}](https://openactive.io/test-interface#${key}) x${value}`).join(', ')}`;
}

// # JSON rendering functions

/**
 * @param {FeatureMetadataItem[]} features
 */
function renderCriteraRequirementsJson(features) {
  /** @type {CriteriaRequirementsJson} */
  const obj = {
    _createdByDocumentationGeneratorScript: true,
    criteriaRequirements: Object.fromEntries(features.map(feature => ([
      feature.identifier,
      // TODO TODO TODO make this easier to read
      Object.fromEntries(Array.from(feature.sellerCriteriaRequirements).map(([sellerCriteria, tallyByCriteria]) => ([
        sellerCriteria,
        Object.fromEntries(tallyByCriteria),
      ]))),
    ]))),
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
