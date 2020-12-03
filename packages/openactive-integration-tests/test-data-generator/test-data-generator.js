const fs = require('fs').promises;
const path = require('path');
const { getConfigVarOrThrow } = require('../test/helpers/config-utils');
const { SellerCriteriaRequirements, CriteriaRequirementsDatum } = require('../test/helpers/criteria-utils');

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
 *   item: TestInterfaceOpportunity,
 * }} TestDataListItem
 */

// /** @type {{ [featureIdentifier: string]: boolean | null }} */
const IMPLEMENTED_FEATURES = getConfigVarOrThrow('integrationTests', 'implementedFeatures');

const CRITERIA_REQUIREMENTS_JSON_FILE_PATH = path.join(__dirname, '..', 'test', 'features', 'criteria-requirements.json');

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
    const sellerCriteriaRequirements = new SellerCriteriaRequirements(sellerCriteriaRequirementsObjEntries.map(([sellerCriteria, criteriaRequirementsDatum]) => ([
      sellerCriteria,
      new CriteriaRequirementsDatum(Object.entries(criteriaRequirementsDatum)),
    ])));
    sellerCriteriaRequirementMaps.push(sellerCriteriaRequirements);
  }
  const combinedSellerRequirements = SellerCriteriaRequirements.combine(sellerCriteriaRequirementMaps);
  console.log(combinedSellerRequirements); // TODO delete me

  // // # Create Test Data
  // //
  // // One for each criteria
  // /** @type {TestData['itemListElement']} */
  // const itemListElement = Array.from(criteriaCounts, ([criteriaIdentifier, count]) => ({
  //   '@type': 'ListItem',
  //   'test:numberOfInstancesInDistribution': count,
  //   item: null,
  // }));
  // /** @type {TestData} */
  // const testData = {
  //   '@context': ['https://openactive.io/', 'https://openactive.io/test-interface'],
  //   '@type': 'ItemList',
  //   numberOfItems: sum(Array.from(criteriaCounts.values())),
  //   itemListElement,
  // };
})();
