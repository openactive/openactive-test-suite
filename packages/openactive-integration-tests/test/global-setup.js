const assert = require("assert");
const axios = require("axios");
const config = require("config");

var BOOKING_API_BASE = config.get("tests.bookingApiBase");
var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");

async function ping() {
  let response = await axios.get(MICROSERVICE_BASE + "health-check/");

  assert.strictEqual(response.data, "openactive-broker");

  return true;
}

module.exports = async () => {
  try {
    await ping();
  } catch (error) {
    console.error(
      "The broker microservice is unreachable. This is a pre-requisite for the test suite."
    );
    throw error;
  }
};
