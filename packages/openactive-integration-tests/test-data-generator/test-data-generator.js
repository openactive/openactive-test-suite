const fs = require('fs').promises;
const path = require('path');
const { getConfigVarOrThrow } = require('../test/helpers/config-utils');
// const { sum } = require('ramda');

/**
 * @typedef {import('../test/types/TestInterfaceOpportunity').TestInterfaceOpportunity} TestInterfaceOpportunity
 * @typedef {import('../documentation/generator').CriteriaRequirementsJson} CriteriaRequirementsJson
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
  /** key: Criteria identifier ; value: number of criteria required */
  const criteriaCounts = Object.entries(criteriaRequirementsJson.criteriaRequirementsByFeature).reduce(
    (result, [featureIdentifier, criteriaRequirements]) => {
      // Feature isn't implemented, so we don't consider it
      if (!IMPLEMENTED_FEATURES[featureIdentifier]) { return result; }

      for (const [criteriaIdentifier, additionalCount] of Object.entries(criteriaRequirements)) {
        const existingCount = result.get(criteriaIdentifier) ?? 0;
        result.set(criteriaIdentifier, existingCount + additionalCount);
      }
      return result;
    },
    /** @type {Map<string, number>} */(new Map()),
  );
  console.log(criteriaCounts); // TODO delete me

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
