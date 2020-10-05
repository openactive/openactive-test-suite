
const pkg = require('../package.json');
const fg = require('fast-glob');
const fs = require('fs');

const INDEX_FILE = "./test/features/README.md";
const FEATURES_ROOT = "./test/features/";

/**
 * @typedef {import('../test/helpers/feature-helper').TestModuleExports} TestModuleExports
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
 * }} FeatureMetadataItem
 */

var rootDirectory = require("path").join(__dirname, "../");

console.log(rootDirectory);

// Workaround to enable chakram to load without test framework
// @ts-ignore ignoring this as it's a one-off workaround
global.afterEach = () => {};
global.documentationGenerationMode = true;

// Load metadata from all tests
var tests = fg.sync(pkg.jest.testMatch, { cwd: rootDirectory }).map(function(file) {
  console.log('Reading: ' + file);
  // TODO: Verify that the data actually conforms to the type.
  return /** @type {TestModuleExports} */(require(`${rootDirectory}${file}`));
});

// Load feature.json files
/** @type {FeatureMetadataItem[]} */
var featureMetadata = fg.sync('**/test/features/**/feature.json', { cwd: rootDirectory }).map(function(file) {
  console.log('Reading: ' + file);
  // TODO: Verify that the data actually conforms to the type.
  return /** @type {FeatureJson} */(require(`${rootDirectory}${file}`));
});

featureMetadata = featureMetadata.sort((a, b) => (a.required ? 0 : 1) - (b.required ? 0 : 1));

// Build summary of criteria required
featureMetadata.forEach(f => {
  const criteriaRequirement = new Map();
  tests.filter(t => t.testFeature == f.identifier).forEach(t => {
    t.criteriaRequirement.forEach((count, opportunityCriteria) => {
      if (!criteriaRequirement.has(opportunityCriteria)) criteriaRequirement.set(opportunityCriteria, 0);
      criteriaRequirement.set(opportunityCriteria, criteriaRequirement.get(opportunityCriteria) + count);
    });
  });
  f.criteriaRequirement = criteriaRequirement;
});

fs.writeFile(INDEX_FILE, renderFeatureIndex(featureMetadata), function(err) {
  if(err) {
    process.exitCode = 1;
    console.error(err);
  } else {
    console.log("FILE SAVED: " + INDEX_FILE);
  }
}); 

featureMetadata.forEach(f => {
  const filename = `${FEATURES_ROOT}${f.category}/${f.identifier}/README.md`;
  fs.writeFile(filename, renderFeatureReadme(f), function(err) {
    if(err) {
      process.exitCode = 1;
      console.error(err);
    } else {
      console.log("FILE SAVED: " + filename);
    }
  }); 
});

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

  `
}

/**
 * @param {FeatureMetadataItem} f
 */
function renderFeatureIndexFeatureFragment(f) {
  return `| ${f.category} | ${f.name} ([${f.identifier}](./${f.category}/${f.identifier}/README.md)) | [${f.required ? 'Required' : 'Optional'}](${f.specificationReference}) | ${f.description} | ${renderCriteriaRequired(f.criteriaRequirement, '')} |
`;
}

function renderFeatureIndexFeatureFragmentOld(f) {
  return `
#### ${f.name} ([${f.identifier}](./${f.category}/${f.identifier}/README.md))

${f.description}

${f.specificationReference}
${renderCriteriaRequired(f.criteriaRequirement)}

`;
}

/**
 * @param {FeatureMetadataItem} f
 */
function renderFeatureReadme(f) {
  const implementedTests = tests.filter(t => t.testFeature == f.identifier && t.testFeatureImplemented);
  const notImplementedTests =  tests.filter(t => t.testFeature == f.identifier && !t.testFeatureImplemented);

  return `[< Return to Overview](../../README.md)
# ${f.name} (${f.identifier})

${f.description}
${f.explainer ? '\n' + f.explainer : ''}${f.requiredCondition ? '\n' + f.requiredCondition : ''}

${f.specificationReference}

Coverage Status: **${f.coverageStatus}**${f.links ? '\n\nSee also: ' + f.links.map(l => `[${l.name}](${l.href})`).join(', ') : ''}
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

${f.required ? 
  "This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:" :
  "Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:"}

${'```'}json
"implementedFeatures": {
  ...
  "${f.identifier}": true,
  ...
}
${'```'}

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
${implementedTests.map(t => renderFeatureTest(t)).join(``)}` : ''}

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
${notImplementedTests.map(t => renderFeatureTest(t)).join(``)}` : ''}`;
}

/**
 * @param {TestModuleExports} t
 */
function renderFeatureTest(t) {
  return `| [${t.testIdentifier}](./${t.testFeatureImplemented ? 'implemented' : 'not-implemented'}/${t.testIdentifier}-test.js) | ${t.testName} | ${t.testDescription} | ${renderCriteriaRequired(t.criteriaRequirement, '')} |
`
}

/**
 * @param {Map<string, number>} criteriaRequired
 * @param {string} [prefixOverride] If provided, this prefix is used rather than the default
 */
function renderCriteriaRequired(criteriaRequired, prefixOverride) {
  if (criteriaRequired.size == 0) {
    return '';
  } else {
    const prefix = prefixOverride !== undefined ? prefixOverride : '\nPrerequisite opportunities per Opportunity Type: ';
    return `${prefix}${Array.from(criteriaRequired.entries()).map(([key, value]) => `[${key}](https://openactive.io/test-interface#${key}) x${value}`).join(', ')}`;
  }
}