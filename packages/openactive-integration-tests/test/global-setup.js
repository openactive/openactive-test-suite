const assert = require("assert");
const axios = require("axios");
const config = require("config");

var BOOKING_API_BASE = config.get("tests.bookingApiBase");
var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");
var TEST_DATASET_IDENTIFIER = config.get("tests.testDatasetIdentifier");
var USE_RANDOM_OPPORTUNITIES = config.get("tests.useRandomOpportunities");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function ping() {
  let response = await axios.get(MICROSERVICE_BASE + "health-check/");

  assert.strictEqual(response.data, "openactive-broker");

  return true;
}

async function deleteTestDataset() {
  let response = await axios.delete(`${USE_RANDOM_OPPORTUNITIES ? MICROSERVICE_BASE : BOOKING_API_BASE}test-interface/datasets/${TEST_DATASET_IDENTIFIER}`,
    {
      timeout: 10000
    }
  );

  assert.strictEqual(response.status, 204);

  return true;
}

module.exports = async () => {
  try {
    await ping();
  } catch (error) {
    throw new Error("The broker microservice is unreachable. This is a pre-requisite for the test suite. \n" + error);
  }

  try {
    await deleteTestDataset();
  } catch (error) {
    throw new Error("The test interface is unreachable. This is a pre-requisite for the test suite. \n" + error);
  }
  
};
