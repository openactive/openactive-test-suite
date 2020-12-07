// TODO Support specifying category in the CLI args e.g. "authorization"
// This should be supported as well as feature, which is currently supported
// This should look something like `npm run test-data-generator -- [category-or-feature]`
// e.g. `npm run test-data-generator -- authorization`
const fs = require('fs').promises;
const path = require('path');
const { dissoc } = require('ramda');
const yargs = require('yargs/yargs');
const { getConfigVarOrThrow, SELLER_CONFIG } = require('../test/helpers/config-utils');
const { SellerCriteriaRequirements, OpportunityCriteriaRequirements } = require('../test/helpers/criteria-utils');
const { getSellerConfigFromSellerCriteria } = require('../test/helpers/sellers');
const { createTestInterfaceOpportunity } = require('../test/helpers/test-interface-opportunities');

/**
 * @typedef {import('../documentation/generator').CriteriaRequirementsJson} CriteriaRequirementsJson
 * @typedef {import('../test/types/TestInterfaceOpportunity').TestInterfaceOpportunity} TestInterfaceOpportunity
 * @typedef {import('../test/types/OpportunityCriteria').SellerCriteria} SellerCriteria
 */

/**
 * @typedef {{
 *   '@context': [
 *     'https://openactive.io/',
 *     'https://openactive.io/test-interface',
 *   ],
 *   '@type': 'ItemList',
 *   numberOfItems: number,
 *   itemListElement: TestDataListItem[],
 * }} TestData
 *
 * @typedef {{
 *   '@type': 'ListItem',
 *   'test:numberOfInstancesInDistribution': number,
 *   item: Omit<TestInterfaceOpportunity, '@context'>,
 * }} TestDataListItem
 */

// # Constants - File Paths
const CRITERIA_REQUIREMENTS_JSON_FILE_PATH = path.join(__dirname, '..', 'test', 'features', 'criteria-requirements.json');
const DEFAULT_OUTPUT_FILE_PATH = path.join(__dirname, 'test-data', 'test-data.json');

// # Constants - Config
const IMPLEMENTED_FEATURES = getConfigVarOrThrow('integrationTests', 'implementedFeatures');
const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE_OBJ = getConfigVarOrThrow('integrationTests', 'bookableOpportunityTypesInScope');
/** An array of those opportunity types which the Booking System is testing */
const IMPLEMENTED_OPPORTUNITY_TYPES = Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE_OBJ)
  .filter(([_, isInScope]) => isInScope) // eslint-disable-line no-unused-vars
  .map(([opportunityType, _]) => opportunityType); // eslint-disable-line no-unused-vars

// # Process CLI Args
const argv = yargs(process.argv.slice(2)) // eslint-disable-line prefer-destructuring
  .command('$0 [feature]', 'OpenActive Test Data Generator', (yargsConfig) => {
    yargsConfig.positional('feature', {
      type: 'string',
      describe: 'If selected, only generate test data for this Feature (e.g. agent-broker)',
      default: '*',
    });
  })
  .options({
    output: {
      type: 'string',
      alias: 'o',
      description: 'Output Directory',
      default: DEFAULT_OUTPUT_FILE_PATH,
    },
  })
  .argv;

const { output: outputFilePath, feature } = argv;

// # Main

(async () => {
  // ## Load Requirements
  console.info(`Reading: ${CRITERIA_REQUIREMENTS_JSON_FILE_PATH}`);
  const criteriaRequirementsJsonRaw = await fs.readFile(CRITERIA_REQUIREMENTS_JSON_FILE_PATH);
  /** @type {CriteriaRequirementsJson} */
  const criteriaRequirementsJson = JSON.parse(criteriaRequirementsJsonRaw.toString());

  // ## Tally the requirements from each implemented feature
  const sellerRequirements = tallySellerCriteriaRequirements(
    criteriaRequirementsJson,
    /** @type {string} */(feature), // yargs can only properly type the option args - not the positional ones. Hence the TS coercion here
  );

  // ## Create Test Data
  //
  // One for each seller x opportunity criteria
  /** @type {TestDataListItem[]} */
  const itemListElement = [];
  let numberOfItems = 0;
  for (const [sellerCriteria, opportunityCriteriaRequirements] of sellerRequirements) {
    // We're overriding the seller config in this call because this function, by default,
    // gets seller config from global.SELLER_CONFIG, which is set by broker.
    // Broker is not running, so we override it with seller config directly from the config file.
    const seller = getSellerConfigFromSellerCriteria(sellerCriteria, SELLER_CONFIG);
    for (const [opportunityCriteria, numOpportunitiesRequired] of opportunityCriteriaRequirements) {
      for (const opportunityType of IMPLEMENTED_OPPORTUNITY_TYPES) {
        numberOfItems += numOpportunitiesRequired;
        const testInterfaceOpportunity = createTestInterfaceOpportunity(opportunityType, opportunityCriteria, seller['@id'], seller['@type']);
        itemListElement.push({
          '@type': 'ListItem',
          'test:numberOfInstancesInDistribution': numOpportunitiesRequired,
          item: dissoc('@context', testInterfaceOpportunity),
        });
      }
    }
  }
  /** @type {TestData} */
  const testData = {
    '@context': ['https://openactive.io/', 'https://openactive.io/test-interface'],
    '@type': 'ItemList',
    numberOfItems,
    itemListElement,
  };
  // ## Write Test Data
  //
  // Create the directory if it doesn't exist
  await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
  await fs.writeFile(outputFilePath, JSON.stringify(testData, null, 2));
  console.log(`FILE SAVED: ${outputFilePath}`);
})();

// # Utils

/**
 * @param {CriteriaRequirementsJson} criteriaRequirementsJson
 * @param {string} [onlyThisFeatureIdentifier]
 *   If included (and not '*'), only generates test data for this feature identifier
 *   If excluded, is equivalent to '*', in which case test data is generated for all features
 * @returns {SellerCriteriaRequirements}
 */
function tallySellerCriteriaRequirements(criteriaRequirementsJson, onlyThisFeatureIdentifier = '*') {
  if (onlyThisFeatureIdentifier && onlyThisFeatureIdentifier !== '*') {
    const sellerCriteriaRequirementsObj = criteriaRequirementsJson.criteriaRequirements[onlyThisFeatureIdentifier];
    if (!sellerCriteriaRequirementsObj) {
      throw new Error(`Feature not found: "${onlyThisFeatureIdentifier}"`);
    }
    return getSellerCriteriaRequirementsFromJsonObj(sellerCriteriaRequirementsObj);
  }
  // All Features
  /**
   * The SellerCriteriaRequirements for every implemented features
   * @type {SellerCriteriaRequirements[]}
   */
  const sellerCriteriaRequirementMaps = [];
  for (const [featureIdentifier, sellerCriteriaRequirementsObj] of Object.entries(criteriaRequirementsJson.criteriaRequirements)) {
    // Feature isn't implemented, so we don't consider it
    if (!IMPLEMENTED_FEATURES[featureIdentifier]) { continue; }
    const sellerCriteriaRequirements = getSellerCriteriaRequirementsFromJsonObj(sellerCriteriaRequirementsObj);
    sellerCriteriaRequirementMaps.push(sellerCriteriaRequirements);
  }
  return SellerCriteriaRequirements.combine(sellerCriteriaRequirementMaps);
}

/**
 * @param {CriteriaRequirementsJson['criteriaRequirements'][string]} sellerCriteriaRequirementsObj
 */
function getSellerCriteriaRequirementsFromJsonObj(sellerCriteriaRequirementsObj) {
  // Type casting is necessary here as Object.entries, in TypeScript, does not endow keys with the more
  // specific key type (https://github.com/microsoft/TypeScript/issues/20322)
  /** @type {[SellerCriteria, CriteriaRequirementsJson['criteriaRequirements'][string][SellerCriteria]][]} */
  const sellerCriteriaRequirementsObjEntries = /** @type {any} */(Object.entries(sellerCriteriaRequirementsObj));
  // This is a bit baroque. It's converting the JSON object into Maps (specifically,
  // our SellerCriteriaRequirements maps).
  return new SellerCriteriaRequirements(sellerCriteriaRequirementsObjEntries.map(([sellerCriteria, opportunityCriteriaRequirements]) => ([
    sellerCriteria,
    new OpportunityCriteriaRequirements(Object.entries(opportunityCriteriaRequirements)),
  ])));
}
