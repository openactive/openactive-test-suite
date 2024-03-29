/* TODO Support specifying category in the CLI args e.g. "authorization"
This should be supported as well as feature, which is currently supported
This should look something like `npm run test-data-generator -- [category-or-feature]`
e.g. `npm run test-data-generator -- authorization` */
const fs = require('fs').promises;
const path = require('path');
const { DateTime } = require('luxon');
const { dissoc } = require('ramda');
const yargs = require('yargs/yargs');
const { getConfigVarOrThrow, SELLER_CONFIG } = require('../test/helpers/config-utils');
const { SellerCriteriaRequirements, OpportunityCriteriaRequirements } = require('../test/helpers/criteria-utils');
const { getSellerConfigFromSellerCriteria } = require('../test/helpers/sellers');
const { createTestInterfaceOpportunity } = require('../test/helpers/test-interface-opportunities');

/**
 * @typedef {import('../documentation/generator').CategoriesJson} CategoriesJson
 * @typedef {import('../documentation/generator').FeatureRequirementsJson} FeatureRequirementsJson
 * @typedef {import('../test/types/TestInterfaceOpportunity').TestInterfaceOpportunity} TestInterfaceOpportunity
 * @typedef {import('../test/types/OpportunityCriteria').SellerCriteria} SellerCriteria
 */

/**
 * @template TListItem
 * @typedef {{
 *   '@context': [
 *     'https://openactive.io/',
 *     'https://openactive.io/test-interface',
 *   ];
 *   '@type': 'ItemList';
 *   numberOfItems: number;
 *   itemListElement: TListItem[];
 * }} ItemList
 */
/**
 * @typedef {ItemList<OutputOpportunityTestDataListItem>} OutputOpportunityTestData
 *
 * @typedef {{
 *   '@type': 'ListItem',
 *   'test:numberOfInstancesInDistribution': number,
 *   item: Omit<TestInterfaceOpportunity, '@context'>,
 * }} OutputOpportunityTestDataListItem
 *
 * @typedef {ItemList<{
 *   '@type': 'ListItem',
 *   item: {
 *     '@type': string;
 *   };
 * }>} OutputTestInterfaceActions
 */

// # Constants - File Paths
const FEATURE_REQUIREMENTS_JSON_FILE_PATH = path.join(__dirname, '..', 'test', 'features', 'feature-requirements.json');
const CATEGORIES_JSON_FILE_PATH = path.join(__dirname, '..', 'test', 'features', 'categories.json');
const DEFAULT_OUTPUT_DIR = path.join(__dirname, 'output');

// # Constants - Config
const IMPLEMENTED_FEATURES = getConfigVarOrThrow('integrationTests', 'implementedFeatures');
const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE_OBJ = getConfigVarOrThrow('integrationTests', 'bookableOpportunityTypesInScope');
const USE_SHAPE_EXPRESSIONS = getConfigVarOrThrow('integrationTests', 'useShapeExpressions');
/** An array of those opportunity types which the Booking System is testing */
const IMPLEMENTED_OPPORTUNITY_TYPES = Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE_OBJ)
  .filter(([, isInScope]) => isInScope)
  .map(([opportunityType]) => opportunityType);
const BOOKING_FLOWS_IN_SCOPE_OBJ = getConfigVarOrThrow('integrationTests', 'bookingFlowsInScope');
const IMPLEMENTED_BOOKING_FLOWS = Object.entries(BOOKING_FLOWS_IN_SCOPE_OBJ)
  .filter(([, isInScope]) => isInScope)
  .map(([bookingFlow]) => bookingFlow);

// # Process CLI Args
const argv = yargs(process.argv.slice(2)) // eslint-disable-line prefer-destructuring
  .command('$0 [category-or-feature]', 'OpenActive Test Data Generator', (yargsConfig) => {
    yargsConfig.positional('category-or-feature', {
      type: 'string',
      describe: 'If included, only generate test data for this Category (e.g. core) or Feature (e.g. agent-broker)',
      default: '*',
    });
  })
  .options({
    'output-dir': {
      type: 'string',
      alias: 'o',
      description: 'Output Directory',
      default: DEFAULT_OUTPUT_DIR,
    },
  })
  .argv;

const { 'output-dir': outputDirectory, 'category-or-feature': categoryOrFeatureUntyped } = argv;
const outputOpportunityTestDataFilePath = path.join(outputDirectory, 'opportunity-test-data.json');
const outputTestInterfaceActionsFilePath = path.join(outputDirectory, 'test-interface-actions.json');
const categoryOrFeature = /** @type {string} */(categoryOrFeatureUntyped); // yargs can only properly type the option args - not the positional ones. Hence the TS coercion here

// # Main

(async () => {
  // ## Load Requirements
  console.info(`Reading: ${FEATURE_REQUIREMENTS_JSON_FILE_PATH}`);
  const featureRequirementsJsonRaw = await fs.readFile(FEATURE_REQUIREMENTS_JSON_FILE_PATH);
  /** @type {FeatureRequirementsJson} */
  const featureRequirementsJson = JSON.parse(featureRequirementsJsonRaw.toString());

  const featureIdentifiers = await getSelectedFeatureIdentifiers(categoryOrFeature);

  // ## Tally the requirements from each implemented feature
  const sellerRequirements = tallySellerCriteriaRequirements(
    featureRequirementsJson,
    featureIdentifiers,
  );

  // ## Create Test Data
  const outputOpportunityTestData = createOutputOpportunityTestData(sellerRequirements);
  const outputTestInterfaceActions = createOutputTestInterfaceActions(featureRequirementsJson, featureIdentifiers);
  // ## Write Test Data
  //
  // Create the directory if it doesn't exist
  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.writeFile(outputOpportunityTestDataFilePath, JSON.stringify(outputOpportunityTestData, null, 2));
  console.log(`FILE SAVED: ${outputOpportunityTestDataFilePath}`);
  await fs.writeFile(outputTestInterfaceActionsFilePath, JSON.stringify(outputTestInterfaceActions, null, 2));
  console.log(`FILE SAVED: ${outputTestInterfaceActionsFilePath}`);
})();

// # Utils

/**
 * @param {SellerCriteriaRequirements} sellerRequirements
 */
function createOutputOpportunityTestData(sellerRequirements) {
  // One for each seller x opportunity criteria
  const harvestStartTimeOverride = DateTime.now().toISO();
  /** @type {OutputOpportunityTestDataListItem[]} */
  const itemListElement = [];
  let numberOfItems = 0;
  for (const [sellerCriteria, opportunityCriteriaRequirements] of sellerRequirements) {
    // We're overriding the seller config in this call because this function, by default,
    // gets seller config from global.SELLER_CONFIG, which is set by broker.
    // Broker is not running, so we override it with seller config directly from the config file.
    const seller = getSellerConfigFromSellerCriteria(sellerCriteria, SELLER_CONFIG);
    for (const [opportunityCriteria, numOpportunitiesRequired] of opportunityCriteriaRequirements) {
      for (const bookingFlow of IMPLEMENTED_BOOKING_FLOWS) {
        for (const opportunityType of IMPLEMENTED_OPPORTUNITY_TYPES) {
          /* TODO: This currently over-counts the number of Opportunities
          required because some tests implement `skipOpportunityTypes` or
          `skipBookingFlows` in FeatureHelper. This means that, for these tests,
          some opportunity types and/or booking flows should be ignored in the
          count. Doing this would require adding more information to the
          `feature-requirements.json` file that is output by documentation
          generation.
          It's not a huge issue as it's an over-count */
          numberOfItems += numOpportunitiesRequired;
          const testInterfaceOpportunity = createTestInterfaceOpportunity({
            opportunityType,
            testOpportunityCriteria: opportunityCriteria,
            // @ts-expect-error <- Needed until we assert that bookingFlow is one of the allowed string values
            bookingFlow,
            sellerId: seller['@id'],
            sellerType: seller['@type'],
            harvestStartTimeOverride,
            // This must be specified here as the global will not be available
            // to `createTestInterfaceOpportunity`, as this is set up in
            // testEnvironment.js, which is only evaluated for jest test runs.
            useShapeExpressions: USE_SHAPE_EXPRESSIONS,
          });
          itemListElement.push({
            '@type': 'ListItem',
            'test:numberOfInstancesInDistribution': numOpportunitiesRequired,
            item: dissoc('@context', testInterfaceOpportunity),
          });
        }
      }
    }
  }
  /** @type {OutputOpportunityTestData} */
  const outputOpportunityTestData = {
    '@context': ['https://openactive.io/', 'https://openactive.io/test-interface'],
    '@type': 'ItemList',
    numberOfItems,
    itemListElement,
  };
  return outputOpportunityTestData;
}

/**
 * @param {FeatureRequirementsJson} featureRequirementsJson
 * @param {string[]} featureIdentifiers
 * @returns {OutputTestInterfaceActions}
 */
function createOutputTestInterfaceActions(featureRequirementsJson, featureIdentifiers) {
  const allActionsSet = Object.entries(featureRequirementsJson.features)
    .reduce((acc, [feature, { testInterfaceActionImplementationRequirements }]) => {
      // Ignore any features which weren't specified
      if (!featureIdentifiers.includes(feature)) { return acc; }
      for (const action of testInterfaceActionImplementationRequirements) {
        acc.add(action);
      }
      return acc;
    }, /** @type {Set<string>} */(new Set()));
  /* If the Booking System supports approval flow, then every test which creates
  a successful booking will need to use the
  `SellerAcceptOrderProposalSimulateAction` (which is not explicitly annotated
  for each test as it depends on the implemented booking flows).

  ! There is a sort-of bug here, which is that
  test:SellerAcceptOrderProposalSimulateAction will be outputted even if Test
  Data Generator has been called on a category or feature that doesn't include
  successful bookings. This is technically incorrect. In the opinion of this
  author, it's fine because every Booking System should be able to support
  successful bookings (!) */
  if (IMPLEMENTED_BOOKING_FLOWS.includes('OpenBookingApprovalFlow')) {
    allActionsSet.add('test:SellerAcceptOrderProposalSimulateAction');
  }
  const sortedActions = [...allActionsSet].sort();
  /** @type {OutputTestInterfaceActions['itemListElement']} */
  const listItems = sortedActions.map(action => ({
    '@type': 'ListItem',
    item: {
      '@type': action,
    },
  }));
  return {
    '@context': ['https://openactive.io/', 'https://openactive.io/test-interface'],
    '@type': 'ItemList',
    numberOfItems: listItems.length,
    itemListElement: listItems,
  };
}

/**
 * Count opportunity requirements for each seller, given the features which are selected and implemented
 *
 * @param {FeatureRequirementsJson} featureRequirementsJson
 * @param {string[]} featureIdentifiers Only generates test data for these feature identifiers.
 * @returns {SellerCriteriaRequirements}
 */
function tallySellerCriteriaRequirements(featureRequirementsJson, featureIdentifiers) {
  /**
   * The SellerCriteriaRequirements for every implemented features
   * @type {SellerCriteriaRequirements[]}
   */
  const sellerCriteriaRequirementMaps = [];
  for (const featureIdentifier of featureIdentifiers) {
    const sellerCriteriaRequirementsObj = featureRequirementsJson.features[featureIdentifier].criteriaRequirements;
    if (!sellerCriteriaRequirementsObj) {
      console.log(`WARNING: Missing Criteria Requirements for '${featureIdentifier}'. Try running \`npm run doc-gen\`.`);
    }
    const sellerCriteriaRequirements = getSellerCriteriaRequirementsFromJsonObj(sellerCriteriaRequirementsObj || {});
    sellerCriteriaRequirementMaps.push(sellerCriteriaRequirements);
  }
  return SellerCriteriaRequirements.combine(sellerCriteriaRequirementMaps);
}

/**
 * @param {string} [categoryOrFeatureIdentifier]
 *   If included (and not '*'), only generates test data for this feature identifier
 *   If excluded, is equivalent to '*', in which case test data is generated for all features
 * @returns {Promise<string[]>}
 */
async function getSelectedFeatureIdentifiers(categoryOrFeatureIdentifier) {
  if (categoryOrFeatureIdentifier && categoryOrFeatureIdentifier !== '*') {
    // **First, assume it's a category identifier.**
    //
    // Best to go with this first as, if a category and feature have the same name, it would
    // be more frustrating to not be able to select the category than it would be to not be
    // able to select the feature.
    // Because if you cannot select a single category, you would have to just get test data
    // for everything, which would make data generation take much longer for each test.
    const categoriesJsonRaw = await fs.readFile(CATEGORIES_JSON_FILE_PATH);
    /** @type {CategoriesJson} */
    const categoriesJson = JSON.parse(categoriesJsonRaw.toString());
    if (categoryOrFeatureIdentifier in categoriesJson.categories) {
      // Return features in that category
      return onlyIncludeImplementedFeatures(Object.keys(categoriesJson.categories[categoryOrFeatureIdentifier]));
    }
    // **Otherwise, it must be a feature identifier.**
    return onlyIncludeImplementedFeatures([categoryOrFeatureIdentifier]);
  }
  // If no features have been selected, just use all the implemented features
  return Object.entries(IMPLEMENTED_FEATURES)
    .filter(([_, isImplemented]) => isImplemented) // eslint-disable-line no-unused-vars
    .map(([featureIdentifier, _]) => featureIdentifier); // eslint-disable-line no-unused-vars
}

/**
 * Narrow array of feature identifiers down so as to only include this which are implemented
 *
 * Note: This raises an error if none of the identifiers make it through the filter.
 *
 * @param {string[]} featureIdentifiers
 */
function onlyIncludeImplementedFeatures(featureIdentifiers) {
  const implementedFeatureIdentifiers = featureIdentifiers.filter(featureIdentifier => IMPLEMENTED_FEATURES[featureIdentifier]);
  if (implementedFeatureIdentifiers.length === 0) {
    throw new Error(`None of the selected feature identifiers (${featureIdentifiers.join(', ')}) are implemented. Therefore, no test data can be generated.`);
  }
  return implementedFeatureIdentifiers;
}

// /**
//  * ## Tally Seller Criteria Requirements
//  *
//  * Count opportunity requirements for each seller, given the features which are selected and implemented
//  *
//  * @param {CriteriaRequirementsJson} criteriaRequirementsJson
//  * @param {string} [categoryOrFeatureIdentifier]
//  *   If included (and not '*'), only generates test data for this feature identifier
//  *   If excluded, is equivalent to '*', in which case test data is generated for all features
//  * @returns {SellerCriteriaRequirements}
//  */
// function tallySellerCriteriaRequirementsUh(criteriaRequirementsJson, categoryOrFeatureIdentifier = '*') {
//   if (categoryOrFeatureIdentifier && categoryOrFeatureIdentifier !== '*') {
//     // ### First, assume it's a category identifier.
//     //
//     // Best to go with this first as, if a category and feature have the same name, it would
//     // be more frustrating to not be able to select the category than it would be to not be
//     // able to select the feature.
//     // Because if you cannot select a single category, you would have to just get test data
//     // for everything, which would make data generation take much longer for each test.
//     if (categoryOrFeatureIdentifier in criteriaRequirementsJson.criteriaRequirements) {
//       /**
//        * The SellerCriteriaRequirements for every implemented features
//        * @type {SellerCriteriaRequirements[]}
//        */
//       const sellerCriteriaRequirementMaps = [];
//       for (const [featureIdentifier, sellerCriteriaRequirementsObj] of Object.entries(criteriaRequirementsJson.criteriaRequirements[categoryOrFeatureIdentifier])) {
//         // Feature isn't implemented, so we don't consider it
//         if (!IMPLEMENTED_FEATURES[featureIdentifier]) { continue; }
//         const sellerCriteriaRequirements = getSellerCriteriaRequirementsFromJsonObj(sellerCriteriaRequirementsObj);
//         sellerCriteriaRequirementMaps.push(sellerCriteriaRequirements);
//       }
//       return SellerCriteriaRequirements.combine(sellerCriteriaRequirementMaps);
//     }
//     // ### Otherwise, it's a feature identifier
//     for (const [categoryIdentifier, featureRequirements] of Object.entries(criteriaRequirementsJson.criteriaRequirements)) {
//     }
//     const sellerCriteriaRequirementsObj = criteriaRequirementsJson.criteriaRequirements[categoryOrFeatureIdentifier];
//     if (!sellerCriteriaRequirementsObj) {
//       throw new Error(`Feature not found: "${categoryOrFeatureIdentifier}"`);
//     }
//     return getSellerCriteriaRequirementsFromJsonObj(sellerCriteriaRequirementsObj);
//   }
//   // ### For All Features
//   /**
//    * The SellerCriteriaRequirements for every implemented features
//    * @type {SellerCriteriaRequirements[]}
//    */
//   const sellerCriteriaRequirementMaps = [];
//   for (const [featureIdentifier, sellerCriteriaRequirementsObj] of Object.entries(criteriaRequirementsJson.criteriaRequirements)) {
//     // Feature isn't implemented, so we don't consider it
//     if (!IMPLEMENTED_FEATURES[featureIdentifier]) { continue; }
//     const sellerCriteriaRequirements = getSellerCriteriaRequirementsFromJsonObj(sellerCriteriaRequirementsObj);
//     sellerCriteriaRequirementMaps.push(sellerCriteriaRequirements);
//   }
//   return SellerCriteriaRequirements.combine(sellerCriteriaRequirementMaps);
// }

/**
 * @param {FeatureRequirementsJson['features'][string]['criteriaRequirements']} sellerCriteriaRequirementsObj
 */
function getSellerCriteriaRequirementsFromJsonObj(sellerCriteriaRequirementsObj) {
  // Type casting is necessary here as Object.entries, in TypeScript, does not endow keys with the more
  // specific key type (https://github.com/microsoft/TypeScript/issues/20322)
  /** @type {[SellerCriteria, FeatureRequirementsJson['features'][string]['criteriaRequirements'][SellerCriteria]][]} */
  const sellerCriteriaRequirementsObjEntries = /** @type {any} */(Object.entries(sellerCriteriaRequirementsObj));
  // This is a bit baroque. It's converting the JSON object into Maps (specifically,
  // our SellerCriteriaRequirements maps).
  return new SellerCriteriaRequirements(sellerCriteriaRequirementsObjEntries.map(([sellerCriteria, opportunityCriteriaRequirements]) => ([
    sellerCriteria,
    new OpportunityCriteriaRequirements(Object.entries(opportunityCriteriaRequirements)),
  ])));
}
