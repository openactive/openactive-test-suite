const assert = require('assert');
const axios = require('axios');
const { getConfigVarOrThrow } = require('./helpers/config-utils');

const MICROSERVICE_BASE = `http://localhost:${process.env.PORT || 3000}`;
const TEST_DATASET_IDENTIFIER = getConfigVarOrThrow('integrationTests', 'testDatasetIdentifier');
const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = getConfigVarOrThrow('integrationTests', 'bookableOpportunityTypesInScope');
const USE_RANDOM_OPPORTUNITIES = getConfigVarOrThrow('integrationTests', 'useRandomOpportunities');

// Set NODE_TLS_REJECT_UNAUTHORIZED = '0' and suppress associated warning
const { silentlyAllowInsecureConnections } = require('./helpers/suppress-unauthorized-warning');

silentlyAllowInsecureConnections();

async function ping() {
  const response = await axios.get(`${MICROSERVICE_BASE}/health-check`, {
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
      timeout: 10000,
    });

  assert.strictEqual(response.status, 204);

  return true;
}

module.exports = async () => {
  console.log(`Running tests for opportunity types: ${Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE).filter(([, v]) => v).map(([k]) => `'${k}'`).join(', ')}`);
  console.log(`Running tests using ${USE_RANDOM_OPPORTUNITIES ? 'random': 'controlled'} opportunities`);
  try {
    console.log('Waiting for broker microservice to be ready...');
    await ping();
  } catch (error) {
    throw new Error(`The broker microservice is unreachable. This is a pre-requisite for the test suite. \n${error}`);
  }

  const endpointUrl = await getEndpointUrl();
  const testInterfaceBaseUrl = USE_RANDOM_OPPORTUNITIES ? MICROSERVICE_BASE : endpointUrl;

  try {
    console.log(`Deleting test dataset '${TEST_DATASET_IDENTIFIER}' within ${USE_RANDOM_OPPORTUNITIES ? 'local broker microservice' : 'booking system'}...`);
    await deleteTestDataset(testInterfaceBaseUrl);
  } catch (error) {
    throw new Error(`The test interface is unreachable. This is a pre-requisite for the test suite. \n${error}`);
  }
};
