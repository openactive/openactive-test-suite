
const pkg = require('../package.json');
const fg = require('fast-glob');
const fs = require('fs');

const INDEX_FILE = "../test/features/README.md";
const FEATURES_ROOT = "../test/features/";

var rootDirectory = require("path").join(__dirname, "../");

console.log(rootDirectory);

// Workaround to enable chakram to load without test framework
global.afterEach = () => {};

global.documentationGenerationMode = true;

// Load metadata from all tests
var tests = fg.sync(pkg.jest.testMatch, { cwd: rootDirectory }).map(function(file) {
  console.log('Reading: ' + file);
  return require(`${rootDirectory}${file}`);
});

// 
var featureMetadata = fg.sync('**/test/features/**/feature.json', { cwd: rootDirectory }).map(function(file) {
  console.log('Reading: ' + file);
  return require(`${rootDirectory}${file}`);
});

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
      return console.log(err);
  }

  console.log("FILE SAVED: " + INDEX_FILE);
}); 

featureMetadata.forEach(f => {
  const filename = `${FEATURES_ROOT}${f.category}/${f.identifier}/README.md`;
  fs.writeFile(filename, renderFeatureReadme(f), function(err) {
    if(err) {
        return console.log(err);
    }
  
    console.log("FILE SAVED: " + filename);
  }); 
});

function renderFeatureIndex(features) {
  return `
# Open Booking API Test Suite Feature Coverage

The test coverage below is [automatically generated](../../documentation), and indicates which features of the Open Booking API are currently covered by the test suite.

Stub tests are provided in many cases, and test coverage should not be regarded as exhaustive unless specified.

## Complete Test Coverage

The tests for these features cover all known edge cases, including both happy and unhappy paths.

| Category | Feature | Specification | Description | Prerequisites |
|----------|---------|---------------|-------------|-------------------|
${features.filter(f => f.coverageStatus === 'complete').map(f => renderFeatureIndexFeatureFragment(f)).join('')}

## Partial Test Coverage

The tests for these features provide partial coverage but do not include all known edgecases, and do not exercise all code paths and error conditions.

| Category | Feature | Specification | Description | Prerequisites |
|----------|---------|---------------|-------------|-------------------|
${features.filter(f => f.coverageStatus === 'partial').map(f => renderFeatureIndexFeatureFragment(f)).join('')}

## No Test Coverage

The tests for these features are fully stubbed, and are not yet implemented.

| Category | Feature | Specification | Description | Prerequisites |
|----------|---------|---------------|-------------|-------------------|
${features.filter(f => f.coverageStatus === 'none').map(f => renderFeatureIndexFeatureFragment(f)).join('')}

  `
}

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

function renderFeatureReadme(f) {
  return `[< Return to Overview](../../README.md)
# ${f.name} (${f.identifier})

${f.description}

${f.specificationReference}

Coverage Status: **${f.coverageStatus}**
${renderCriteriaRequired(f.criteriaRequirement, `### Test prerequisites
Opportunities that match the following criteria must exist in the booking system for the configured primary Seller in order to use \`useRandomOpportunities: true\`. Alternatively the following \`testOpportunityCriteria\` values can be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for \`useRandomOpportunities: false\`.

`)}

### Running tests for only this feature

${'```'}bash
npm test --runInBand -- test/features/${f.category}/${f.identifier}/
${'```'}


## 'Implemented' tests

Update \`test.json\` as follows to enable 'Implemented' testing for this feature:

${'```'}json
"implementedFeatures": {
  ...
  "${f.identifier}": true,
  ...
}
${'```'}
${f.required ? '\nNote this feature is required by the Open Booking API specification, and so must always be set to `true`.' : ''}

| Identifier | Name | Description | Prerequisites |
|------------|------|-------------|---------------|
${tests.filter(t => t.testFeature == f.identifier && t.testFeatureImplemented).map(t => renderFeatureTest(t)).join(``)}

## 'Not Implemented' tests

Update \`test.json\` as follows to enable 'Not Implemented' testing for this feature:

${'```'}json
"implementedFeatures": {
  ...
  "${f.identifier}": false,
  ...
}
${'```'}
${f.required ? '\nNote this feature is required by the Open Booking API specification, and so must always be set to `true`.' : ''}

| Identifier | Name | Description | Prerequisites |
|------------|------|-------------|---------------|
${tests.filter(t => t.testFeature == f.identifier && !t.testFeatureImplemented).map(t => renderFeatureTest(t)).join(``)}`;
}

function renderFeatureTest(t) {
  return `| ${t.testIdentifier} | ${t.testName} | ${t.testDescription} | ${renderCriteriaRequired(t.criteriaRequirement, '')} |
`
}

function renderCriteriaRequired(c, prefix) {
  if (c.size == 0) {
    return '';
  } else {
    return `${prefix !== undefined ? prefix : '\nPrerequisite opportunities: '}${Array.from(c.entries()).map(([key, value]) => `[${key}](https://openactive.io/test-interface#${key}) x${value}`).join(', ')}`;
  }
}