const assert = require("assert");
const axios = require("axios");
const config = require("config");

var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");
var TEST_DATASET_IDENTIFIER = config.get("tests.testDatasetIdentifier");
var USE_RANDOM_OPPORTUNITIES = config.get("tests.useRandomOpportunities");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function ping() {
  let response = await axios.get(MICROSERVICE_BASE + "health-check/");

  assert.strictEqual(response.data, "openactive-broker");

  return true;
}

async function getEndpointUrl() {
  let response = await axios.get(MICROSERVICE_BASE + "dataset-site");

  if (!(response && response.data && response.data.accessService && response.data.accessService.endpointURL)) {
    throw new Error("Dataset Site JSON-LD does not contain an accessService.endpointURL");
  }

  return response.data.accessService.endpointURL;
}

async function deleteTestDataset(testInterfaceBaseUrl) {
  let response = await axios.delete(`${testInterfaceBaseUrl}test-interface/datasets/${TEST_DATASET_IDENTIFIER}`,
    {
      timeout: 10000
    }
  );

  assert.strictEqual(response.status, 204);

  return true;
}

module.exports = async () => {
  try {
    console.log("Waiting for broker microservice to be ready...")
    await ping();
  } catch (error) {
    throw new Error("The broker microservice is unreachable. This is a pre-requisite for the test suite. \n" + error);
  }

  let endpointUrl = await getEndpointUrl();
  let testInterfaceBaseUrl = USE_RANDOM_OPPORTUNITIES ? MICROSERVICE_BASE : endpointUrl;

  try {
    await deleteTestDataset(testInterfaceBaseUrl);
  } catch (error) {
    throw new Error("The test interface is unreachable. This is a pre-requisite for the test suite. \n" + error);
  }
};
