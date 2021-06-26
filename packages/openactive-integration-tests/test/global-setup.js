const assert = require('assert');
const axios = require('axios');
const { getConfigVarOrThrow } = require('./helpers/config-utils');

const MICROSERVICE_BASE = `http://localhost:${process.env.PORT || 3000}`;
const TEST_DATASET_IDENTIFIER = getConfigVarOrThrow('integrationTests', 'testDatasetIdentifier');
const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = getConfigVarOrThrow('integrationTests', 'bookableOpportunityTypesInScope');
const BOOKING_FLOWS_IN_SCOPE = getConfigVarOrThrow('integrationTests', 'bookingFlowsInScope');
const USE_RANDOM_OPPORTUNITIES = getConfigVarOrThrow('integrationTests', 'useRandomOpportunities');

// Set NODE_TLS_REJECT_UNAUTHORIZED = '0' and suppress associated warning
const { silentlyAllowInsecureConnections } = require('./helpers/suppress-unauthorized-warning');

silentlyAllowInsecureConnections();

async function ping() {
  const response = await axios.get(`${MICROSERVICE_BASE}/health-check`, {
    // Allow up to 30 minutes for full harvest to complete
    timeout: 1000 * 60 * 30,
  });

  assert.strictEqual(response.data, 'openactive-broker');

  return true;
}

async function getEndpointUrl() {
  const response = await axios.get(`${MICROSERVICE_BASE}/config`);

  if (!(response && response.data && response.data.bookingApiBaseUrl)) {
    throw new Error('Dataset Site JSON-LD does not contain an accessService.endpointURL');
  }

  return response.data.bookingApiBaseUrl;
}

async function deleteTestDataset(testInterfaceBaseUrl) {
  const response = await axios.delete(`${testInterfaceBaseUrl}/test-interface/datasets/${TEST_DATASET_IDENTIFIER}`,
    {
      timeout: 60000,
    });

  assert.strictEqual(response.status, 204);

  return true;
}

async function purgeCache() {
  const response = await axios.delete(`${MICROSERVICE_BASE}/opportunity-cache`,
    {
      timeout: 10000,
    });

  assert.strictEqual(response.status, 204);

  return true;
}

/**
 * @param {{[k: string]: boolean}} booleanObj
 */
function booleanObjIsAllFalse(booleanObj) {
  return Object.entries(booleanObj).filter(([, v]) => v).length === 0;
}

/**
 * @param {{[k: string]: boolean}} booleanObj
 */
function booleanObjGetTrueKeys(booleanObj) {
  return Object.entries(booleanObj).filter(([, v]) => v).map(([k]) => k);
}

module.exports = async () => {
  if (booleanObjIsAllFalse(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE)) {
    throw new Error('There are no Opportunity Types selected for testing. Please ensure `bookableOpportunityTypesInScope` contains at least one value set to `true`.');
  }
  if (booleanObjIsAllFalse(BOOKING_FLOWS_IN_SCOPE)) {
    throw new Error('There are no Booking Flows selected for testing. Please ensure `bookingFlowsInScope` contains at least one value set to `true`.');
  }
  if (process.env.SINGLE_FLOW_PATH_MODE) {
    console.log(`Running a single flow path "${process.env.SINGLE_FLOW_PATH_MODE}" for tests in "${USE_RANDOM_OPPORTUNITIES ? 'random' : 'controlled'}" mode.`);
  } else {
    console.log(`Running tests in "${USE_RANDOM_OPPORTUNITIES ? 'random' : 'controlled'}" mode for opportunity types: ${
      booleanObjGetTrueKeys(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE).map(k => `'${k}'`).join(', ')
    } and booking flows: ${
      booleanObjGetTrueKeys(BOOKING_FLOWS_IN_SCOPE).map(k => `'${k}'`).join(', ')
    }`);
  }

  try {
    console.log('Waiting for broker microservice to be ready...');
    await ping();
  } catch (error) {
    throw new Error(`The broker microservice is unreachable. This is a pre-requisite for the test suite. \n${error}`);
  }

  if (USE_RANDOM_OPPORTUNITIES) {
    try {
      console.log(`Releasing opportunity locks for '${TEST_DATASET_IDENTIFIER}' within local broker microservice...`);
      await deleteTestDataset(MICROSERVICE_BASE);
    } catch (error) {
      throw new Error(`The broker microservice is unreachable. This is a pre-requisite for the test suite. \n${error}`);
    }
  } else {
    const endpointUrl = await getEndpointUrl();

    try {
      console.log(`Calling "DELETE ${endpointUrl}/test-interface/datasets/${TEST_DATASET_IDENTIFIER}" to delete test dataset '${TEST_DATASET_IDENTIFIER}' within booking system (see https://openactive.io/test-interface/)...`);
      await deleteTestDataset(endpointUrl);
    } catch (error) {
      throw new Error(`The test interface within the booking system is unreachable. This is a pre-requisite for the test suite. \n${error}`);
    }

    try {
      console.log('Purging test dataset cache within local broker microservice...');
      await purgeCache();
    } catch (error) {
      throw new Error(`The broker microservice is unreachable. This is a pre-requisite for the test suite. \n${error}`);
    }
  }
};
