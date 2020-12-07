const fs = require('fs').promises;
const path = require('path');
const { dissoc } = require('ramda');
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

const IMPLEMENTED_FEATURES = getConfigVarOrThrow('integrationTests', 'implementedFeatures');
const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE_OBJ = getConfigVarOrThrow('integrationTests', 'bookableOpportunityTypesInScope');
/** An array of those opportunity types which the Booking System is testing */
const IMPLEMENTED_OPPORTUNITY_TYPES = Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE_OBJ)
  .filter(([_, isInScope]) => isInScope) // eslint-disable-line no-unused-vars
  .map(([opportunityType, _]) => opportunityType); // eslint-disable-line no-unused-vars

const CRITERIA_REQUIREMENTS_JSON_FILE_PATH = path.join(__dirname, '..', 'test', 'features', 'criteria-requirements.json');
const DEFAULT_OUTPUT_FILE_PATH = path.join(__dirname, 'test-data', 'test-data.json');

(async () => {
  // # Load Requirements
  console.info(`Reading: ${CRITERIA_REQUIREMENTS_JSON_FILE_PATH}`);
  const criteriaRequirementsJsonRaw = await fs.readFile(CRITERIA_REQUIREMENTS_JSON_FILE_PATH);
  /** @type {CriteriaRequirementsJson} */
  const criteriaRequirementsJson = JSON.parse(criteriaRequirementsJsonRaw.toString());

  // # Tally the requirements from each implemented feature
  /**
   * The SellerCriteriaRequirements for every implemented features
   * @type {SellerCriteriaRequirements[]}
   */
  const sellerCriteriaRequirementMaps = [];
  for (const [featureIdentifier, sellerCriteriaRequirementsObj] of Object.entries(criteriaRequirementsJson.criteriaRequirements)) {
    // Feature isn't implemented, so we don't consider it
    if (!IMPLEMENTED_FEATURES[featureIdentifier]) { continue; }
    // Type casting is necessary here as Object.entries, in TypeScript, does not endow keys with the more
    // specific key type (https://github.com/microsoft/TypeScript/issues/20322)
    /** @type {[SellerCriteria, CriteriaRequirementsJson['criteriaRequirements'][string][SellerCriteria]][]} */
    const sellerCriteriaRequirementsObjEntries = /** @type {any} */(Object.entries(sellerCriteriaRequirementsObj));
    // This is a bit baroque. It's converting the JSON object into Maps (specifically,
    // our SellerCriteriaRequirements maps).
    const sellerCriteriaRequirements = new SellerCriteriaRequirements(sellerCriteriaRequirementsObjEntries.map(([sellerCriteria, opportunityCriteriaRequirements]) => ([
      sellerCriteria,
      new OpportunityCriteriaRequirements(Object.entries(opportunityCriteriaRequirements)),
    ])));
    sellerCriteriaRequirementMaps.push(sellerCriteriaRequirements);
  }
  const combinedSellerRequirements = SellerCriteriaRequirements.combine(sellerCriteriaRequirementMaps);

  // # Create Test Data
  //
  // One for each seller x opportunity criteria
  /** @type {TestDataListItem[]} */
  const itemListElement = [];
  let numberOfItems = 0;
  for (const [sellerCriteria, opportunityCriteriaRequirements] of combinedSellerRequirements) {
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
  // # Write Test Data
  //
  // Create the directory if it doesn't exist
  await fs.mkdir(path.dirname(DEFAULT_OUTPUT_FILE_PATH), { recursive: true });
  await fs.writeFile(DEFAULT_OUTPUT_FILE_PATH, JSON.stringify(testData, null, 2));
  console.log(`FILE SAVED: ${DEFAULT_OUTPUT_FILE_PATH}`);
})();
